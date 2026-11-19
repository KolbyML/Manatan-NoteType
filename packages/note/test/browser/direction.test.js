import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";
import { chromium, webkit } from "playwright";

// This suite uses the actual Flashcards HTTP renderer, not a substitute for
// Anki's template filters or a hand-built approximation of the rendered card.
const endpoint = process.env.MANATAN_SRS_TEST_URL;
const packageDir = fileURLToPath(new URL("../..", import.meta.url));
let browser;
let collection;
let deck;
let noteType;

async function api(route, method = "GET", body) {
  const response = await fetch(`${endpoint}${route}`, {
    method,
    headers: { "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(30000),
  });
  assert.ok(
    response.ok,
    `${response.status}: ${await response.clone().text()}`,
  );
  return response.json();
}

before(async () => {
  assert.ok(
    endpoint,
    "Set MANATAN_SRS_TEST_URL to a dedicated test server's /api/v1/srs URL",
  );
  execFileSync(process.execPath, [
    path.join(packageDir, "script/generate-template.js"),
  ]);
  collection = (
    await api("/collections", "POST", { name: "Direction regression" })
  ).id;
  const types = await api(`/collections/${collection}/note-types`);
  const source = types.find((type) => type.name === "Manatan-NoteType");
  noteType = (
    await api(`/collections/${collection}/note-types`, "POST", {
      name: "Direction regression",
      source: "clone",
      noteTypeId: source.id,
    })
  ).id;
  const read = (suffix) =>
    readFile(
      path.join(packageDir, `.anki-build/_manatan_note_type_${suffix}`),
      "utf8",
    );
  await api(`/note-types/${noteType}`, "PATCH", {
    css: await read("style.css"),
    templates: [
      {
        ord: 0,
        name: "Recognition",
        qfmt: await read("front.html"),
        afmt: await read("back.html"),
      },
    ],
  });
  deck = (
    await api(`/collections/${collection}/decks`, "POST", {
      name: "Direction regression",
    })
  ).id;
  const engine = process.env.MANATAN_BROWSER === "webkit" ? webkit : chromium;
  browser = await engine.launch({
    executablePath: process.env.BROWSER_EXECUTABLE_PATH,
  });
});

after(async () => {
  await browser?.close();
  if (collection) await api(`/collections/${collection}`, "DELETE");
});

const sentence = ">> لقد حذرتك ألا <b>تثرثر</b> كثيرا!";
const rubySentence =
  ">> <ruby>لقد<rt>لَقَدْ</rt></ruby> <ruby>حذ<rt>حَذَّ</rt></ruby>رتك ألا <b><ruby>تثرثر<rt>تَثَرْثَرَ</rt></ruby></b> كثيرا!";

async function cardPage(fields, side = "back", width = 1000, night = false) {
  const card = await api(`/decks/${deck}/cards`, "POST", {
    noteTypeId: noteType,
    fields: {
      Expression: "ثرثر",
      ExpressionReading: "ثَرْثَرَ",
      Sentence: sentence,
      SentenceTranslation: "I warned you not to chatter so much!",
      MainDefinition:
        "<h3>Grammar</h3><h3>Etymology</h3><div>to chatter, to prattle</div>",
      ...fields,
    },
  });
  const page = await browser.newPage({
    viewport: { width, height: 760 },
    deviceScaleFactor: 1,
  });
  await page.goto(
    `${endpoint}/cards/${card.id}/page?side=${side}&night=${night ? 1 : 0}`,
  );
  await page.evaluate(() => document.fonts.ready);
  return page;
}

async function textX(page, selector, text) {
  return page.locator(selector).evaluate((element, text) => {
    const nodes = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    for (let node = nodes.nextNode(); node; node = nodes.nextNode()) {
      if (node.parentElement.closest("rt")) continue;
      const start = node.textContent.indexOf(text);
      if (start < 0) continue;
      const range = document.createRange();
      range.setStart(node, start);
      range.setEnd(node, start + text.length);
      return range.getBoundingClientRect().x;
    }
    throw new Error(`Missing text: ${text}`);
  }, text);
}

async function direction(page, selector) {
  return page
    .locator(selector)
    .evaluate((element) => getComputedStyle(element).direction);
}

async function capture(page, name) {
  const directory = process.env.MANATAN_SCREENSHOT_DIR;
  if (!directory) return;
  await mkdir(directory, { recursive: true });
  await page.screenshot({ path: path.join(directory, `${name}.png`) });
}

for (const width of [1000, 390]) {
  test(`Arabic ruby fragments retain word and sentence order at ${width}px`, async () => {
    const page = await cardPage(
      { SentenceFurigana: rubySentence },
      "back",
      width,
    );
    try {
      await capture(page, `arabic-ruby-${width}`);
      assert.ok(
        (await textX(page, ".mk-sentence", "حذ")) >
          (await textX(page, ".mk-sentence", "رتك")),
        "The start of حذرتك must be to the right of its ending",
      );
      assert.ok(
        (await textX(page, ".mk-sentence", "لقد")) >
          (await textX(page, ".mk-sentence", "تثرثر")),
        "The first word must be to the right of the later word",
      );
      assert.equal(await direction(page, ".mk-sentence"), "rtl");
      assert.equal(await direction(page, ".mk-sentence-translation"), "ltr");
      assert.equal(
        await direction(
          page,
          ".mk-definition-page:not([hidden]) .mk-zoomable-images",
        ),
        "ltr",
      );
    } finally {
      await page.close();
    }
  });
}

test("plain Arabic punctuation, translations, and both card sides use their own direction", async () => {
  const page = await cardPage({}, "front");
  try {
    assert.equal(await direction(page, ".mk-front-expression"), "rtl");
    await capture(page, "arabic-front");
    await page.goto(page.url().replace("side=front", "side=back"));
    await capture(page, "arabic-plain");
    assert.equal(await direction(page, ".mk-back-expression"), "rtl");
    assert.equal(await direction(page, ".mk-sentence"), "rtl");
    assert.ok(
      (await textX(page, ".mk-sentence", "!")) <
        (await textX(page, ".mk-sentence", "لقد")),
    );
    assert.equal(await direction(page, ".mk-sentence-translation"), "ltr");
    assert.equal(await direction(page, ".mk-header"), "ltr");
  } finally {
    await page.close();
  }
});

test("Japanese ruby and English definitions retain left-to-right layout", async () => {
  const page = await cardPage({
    Expression: "貢献",
    ExpressionReading: "こうけん",
    SentenceFurigana:
      "<ruby>日本語<rt>にほんご</rt></ruby>を<b><ruby>勉強<rt>べんきょう</rt></ruby></b>しています。",
    SentenceTranslation: "I am studying Japanese.",
  });
  try {
    await capture(page, "japanese");
    assert.equal(await direction(page, ".mk-back-expression"), "ltr");
    assert.equal(await direction(page, ".mk-sentence"), "ltr");
    assert.ok(
      (await textX(page, ".mk-sentence", "日本語")) <
        (await textX(page, ".mk-sentence", "勉強")),
    );
  } finally {
    await page.close();
  }
});

test("Arabic fields respect explicit Latin text and keep numbers in order", async () => {
  const page = await cardPage(
    {
      SentenceFurigana: 'لدي <span dir="ltr">Wi-Fi 6</span> و123 كتابًا!',
      MainDefinition: "تعريف عربي!",
      SentenceTranslation: "I have Wi-Fi 6 and 123 books!",
    },
    "back",
    390,
    true,
  );
  try {
    assert.equal(await direction(page, ".mk-sentence"), "rtl");
    assert.equal(await direction(page, '.mk-sentence [dir="ltr"]'), "ltr");
    assert.equal(
      await direction(
        page,
        ".mk-definition-page:not([hidden]) .mk-zoomable-images",
      ),
      "rtl",
    );
    assert.ok(
      (await textX(page, ".mk-sentence", "1")) <
        (await textX(page, ".mk-sentence", "3")),
    );
    await capture(page, "arabic-mixed-dark-mobile");
  } finally {
    await page.close();
  }
});
