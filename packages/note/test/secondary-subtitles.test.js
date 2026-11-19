import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { parseHTML } from "linkedom";

const source = readFileSync(
  new URL("../template/back.html", import.meta.url),
  "utf8",
);
const grouping = source.slice(
  source.indexOf("  function initFieldGroups()"),
  source.indexOf("  function initPictureCycler()"),
);

function render(sentence, translation) {
  const { document, Node } = parseHTML(`<html><body><div id="manatan-note-type">
    <section class="mk-sentence">${sentence}</section>
    <section class="mk-sentence-translation">${translation}</section>
    <div class="mk-field-group-nav" hidden>
      <button class="mk-field-group-prev"></button>
      <button class="mk-field-group-next"></button>
      <span class="mk-field-group-count"></span>
      <span class="mk-field-group-date"></span>
    </div>
  </div></body></html>`);
  const root = document.querySelector("#manatan-note-type");
  new Function(
    "document",
    "root",
    "Node",
    "$",
    "$$",
    `${grouping}; initFieldGroups();`,
  )(
    document,
    root,
    Node,
    (selector) => root.querySelector(selector),
    (selector) => [...root.querySelectorAll(selector)],
  );
  return (selector) => root.querySelector(selector);
}

test("the back template includes an optional secondary subtitle field", () => {
  assert.match(
    source,
    /{{#SentenceTranslation}}\s*<section class="mk-sentence-translation">\s*{{SentenceTranslation}}\s*<\/section>\s*{{\/SentenceTranslation}}/,
  );
  const packageScript = readFileSync(
    new URL("../script/generate-preview-apkg.py", import.meta.url),
    "utf8",
  );
  assert.match(
    packageScript.slice(
      packageScript.indexOf("FIELD_NAMES ="),
      packageScript.indexOf("SAMPLE_NOTES ="),
    ),
    /"SentenceTranslation"/,
  );
});

test("secondary subtitles follow their sentence when switching contexts", () => {
  const $ = render(
    '<span data-group-id="2">新しい例文</span><span data-group-id="1">古い例文</span>',
    '<span data-group-id="2">New sentence</span><span data-group-id="1">Old sentence</span>',
  );
  assert.equal($('.mk-sentence-translation [data-group-id="1"]').hidden, true);
  assert.equal($('.mk-sentence-translation [data-group-id="2"]').hidden, false);
  $(".mk-field-group-next").click();
  assert.equal($('.mk-sentence [data-group-id="1"]').hidden, false);
  assert.equal($('.mk-sentence-translation [data-group-id="1"]').hidden, false);
  assert.equal($('.mk-sentence-translation [data-group-id="2"]').hidden, true);
});

test("a legacy subtitle belongs to its original context and keeps line breaks", () => {
  const $ = render(
    '<span data-group-id="2">新しい例文</span>元の例文',
    "Original<br>subtitle",
  );
  const legacy = $('.mk-sentence-translation [data-group-id="0"]');
  assert.ok(legacy);
  assert.equal(legacy.hidden, true);
  assert.ok(legacy.querySelector("br"));
  $(".mk-field-group-next").click();
  assert.equal(legacy.hidden, false);
  assert.equal(legacy.textContent, "Originalsubtitle");
});
