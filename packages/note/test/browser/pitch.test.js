import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";
import { chromium, webkit } from "playwright";

// These fields were captured from the app's production pitchAccentExport
// functions, including the graphical mapping saved in the reported backup.
const fixtures = JSON.parse(
  await readFile(
    new URL("../fixtures/pitch-export-fields.json", import.meta.url),
    "utf8",
  ),
);
const endpoint = process.env.MANATAN_SRS_TEST_URL;
const packageDir = fileURLToPath(new URL("../..", import.meta.url));
let browser, collection, deck, noteType;
async function api(route, method = "GET", body) {
  const response = await fetch(`${endpoint}${route}`, {
    method,
    headers: { "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
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
    "Set MANATAN_SRS_TEST_URL to a dedicated Flashcards server",
  );
  execFileSync(process.execPath, [
    path.join(packageDir, "script/generate-template.js"),
  ]);
  collection = (
    await api("/collections", "POST", { name: "Pitch field regression" })
  ).id;
  const types = await api(`/collections/${collection}/note-types`);
  noteType = types.find((type) => type.name === "Manatan-NoteType").id;
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
        name: "Mining",
        qfmt: await read("front.html"),
        afmt: await read("back.html"),
      },
    ],
  });
  deck = (
    await api(`/collections/${collection}/decks`, "POST", {
      name: "Pitch fields",
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
async function open(fields, type = noteType) {
  const card = await api(`/decks/${deck}/cards`, "POST", {
    noteTypeId: type,
    fields,
  });
  const page = await browser.newPage({ viewport: { width: 430, height: 900 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  if (process.env.MANATAN_PREVIEW === "draft") {
    const before = await api(`/cards/${card.id}/note`);
    const details = await api(`/note-types/${type}`);
    const template = details.templates[0];
    const preview = await api(`/cards/${card.id}/template-preview`, "POST", {
      qfmt: template.qfmt,
      afmt: template.afmt,
      css: details.css,
      fields,
      side: "back",
      night: true,
    });
    await page.goto(new URL(preview.url, endpoint).href);
    assert.deepEqual(await api(`/cards/${card.id}/note`), before);
  } else {
    await page.goto(`${endpoint}/cards/${card.id}/page?side=back&night=1`);
  }
  await page.waitForFunction(
    () =>
      document.querySelector("#manatan-note-type")?.dataset.mkReady === "true",
    null,
    { timeout: 2000 },
  );
  assert.deepEqual(errors, []);
  return page;
}
async function state(page) {
  return page.evaluate(() => ({
    type: document.querySelector("#manatan-note-type").dataset.pitchType,
    color: getComputedStyle(document.querySelector(".mk-back-expression"))
      .color,
    graphs: document.querySelectorAll(
      ".mk-pitch-item, .mk-pitch-source [data-pitch-type]",
    ).length,
    text: document.querySelector(".mk-expression-panel").textContent,
  }));
}
function fields(key) {
  const {
    key: ignored,
    positions,
    ...value
  } = fixtures.find((entry) => entry.key === key);
  return value;
}
test("graphical Pitch Accent mapping gives 握手 its atamadaka color", async () => {
  const page = await open(fields("akushu"));
  try {
    // The headword animates color changes; inspect the completed visual state.
    await page.waitForFunction(
      () =>
        getComputedStyle(document.querySelector(".mk-back-expression"))
          .color ===
        getComputedStyle(
          document.querySelector(".mk-pitch-source [data-pitch-type]"),
        ).color,
    );
    const result = await state(page);
    assert.equal(result.type, "atamadaka");
    assert.equal(result.graphs, 1);
    assert.equal(
      await page
        .locator(".mk-pitch-source [data-pitch-type]")
        .evaluate((node) => getComputedStyle(node).color),
      result.color,
    );
  } finally {
    await page.close();
  }
});
test("HTML in the category field stays inert and repeated pitch graphs deduplicate", async () => {
  const data = fields("yadori");
  data.PitchCategories = fixtures.find(
    (entry) => entry.key === "yadori",
  ).positions;
  const page = await open(data);
  try {
    const result = await state(page);
    assert.equal(result.type, "odaka");
    assert.equal(result.graphs, 1);
    assert.ok(!result.text.includes("data-reading="));
    assert.ok(!result.text.includes("[3]"));
    assert.equal(await page.locator(".mk-pitch-source > ol > li").count(), 1);
  } finally {
    await page.close();
  }
});
test("HTML categories and reading cannot break the card attributes", async () => {
  const data = fields("heya");
  data.ExpressionReading = '<span title="reading">へや</span>';
  data.PitchCategories = '<span class="category" title="quoted">odaka</span>';
  const page = await open(data);
  try {
    const result = await state(page);
    assert.equal(result.type, "odaka");
    assert.equal(result.graphs, 1);
    assert.ok(!result.text.includes("data-reading="));
    assert.ok(!result.text.includes("quoted"));
  } finally {
    await page.close();
  }
});
test("numeric positions still determine each graph, including kifuku and heiban", async () => {
  const page = await open({
    Expression: "やっつける",
    ExpressionReading: "やっつける",
    PitchPosition: "[0], [4], [5]",
    PitchCategories: "kifuku,heiban",
  });
  try {
    assert.deepEqual(
      await page
        .locator(".mk-pitch-item")
        .evaluateAll((nodes) => nodes.map((node) => node.dataset.pitchType)),
      ["heiban", "kifuku", "kifuku"],
    );
  } finally {
    await page.close();
  }
});
test("headword ruby supplies the reading for graphical fields", async () => {
  const data = fields("akushu");
  data.ExpressionReading = "";
  data.ExpressionFurigana = "握手[あくしゅ]";
  const page = await open(data);
  try {
    assert.equal((await state(page)).type, "atamadaka");
  } finally {
    await page.close();
  }
});
test("unrecognized HTML graphics retain phonetic annotations and use the saved category", async () => {
  const data = fields("akushu");
  data.PitchPosition =
    '<svg data-phonetic="preserved" viewBox="0 0 60 40"><path d="M0 0 H20 V30 H60" stroke="currentColor"/></svg>';
  const page = await open(data);
  try {
    assert.equal((await state(page)).type, "atamadaka");
    assert.equal(
      await page.locator('svg[data-phonetic="preserved"]').count(),
      1,
    );
  } finally {
    await page.close();
  }
});

test("stock script permission does not authorize additional custom scripts", async () => {
  const details = await api(`/note-types/${noteType}`);
  try {
    const templates = details.templates.map((template) => ({
      ...template,
      afmt: `${template.afmt}<script>window.__unexpectedPitchScript = true;</script>`,
    }));
    await api(`/note-types/${noteType}`, "PATCH", {
      css: details.css,
      templates,
    });
    const page = await open(fields("akushu"));
    try {
      assert.equal((await state(page)).type, "atamadaka");
      assert.equal(
        await page.evaluate(() => window.__unexpectedPitchScript),
        undefined,
      );
    } finally {
      await page.close();
    }
  } finally {
    await api(`/note-types/${noteType}`, "PATCH", {
      css: details.css,
      templates: details.templates,
    });
  }
});

test("renaming a stock note type retains its approved pitch script", async () => {
  const copy = await api(`/collections/${collection}/note-types`, "POST", {
    name: "Renamed pitch template",
    source: "clone",
    noteTypeId: noteType,
  });
  const page = await open(fields("akushu"), copy.id);
  try {
    assert.equal((await state(page)).type, "atamadaka");
  } finally {
    await page.close();
  }
});

test("combined graph and numeric exports preserve devoicing annotations", async () => {
  const data = fields("annotated");
  data.PitchPosition += fixtures.find(
    (entry) => entry.key === "annotated",
  ).positions;
  const page = await open(data);
  try {
    assert.equal((await state(page)).type, "atamadaka");
    assert.equal(
      await page.locator('.mk-pitch-source [style*="dotted"]').count(),
      1,
    );
  } finally {
    await page.close();
  }
});
