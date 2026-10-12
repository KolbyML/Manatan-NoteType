import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { parseHTML } from "linkedom";

const source = readFileSync(
  new URL("../template/back.html", import.meta.url),
  "utf8",
);
const pager = source.slice(
  source.indexOf("  function initDefinitionPager()"),
  source.indexOf("  function initImageModal()"),
);
const single = (dictionary, body) =>
  `<div class="yomitan-glossary"><i>(${dictionary})</i> <span data-dictionary="${dictionary}">${body}</span></div>`;
const grouped = (...entries) =>
  `<div class="yomitan-glossary"><ol>${entries.map(([dictionary, body]) => `<li data-dictionary="${dictionary}"><i>(${dictionary})</i> ${body}</li>`).join("")}</ol></div>`;
function run(main, glossary, selection = "") {
  const { document } =
    parseHTML(`<html><body><div id="manatan-note-type"><div class="mk-definition">
    ${selection ? `<section class="mk-definition-page" data-title="Selection Text"><h2>Selection</h2><div class="mk-zoomable-images">${selection}</div></section>` : ""}
    <section class="mk-definition-page" data-title="Main Definition"><h2>Definition</h2><div class="mk-zoomable-images">${main}</div></section>
    <section class="mk-definition-page" data-title="Glossary"><h2>Glossary</h2><div class="mk-glossary">${glossary}</div></section>
  </div></div></body></html>`);
  const root = document.querySelector("#manatan-note-type");
  new Function("document", "root", "$", `${pager}; initDefinitionPager();`)(
    document,
    root,
    (selector) => root.querySelector(selector),
  );
  const box = root.querySelector(".mk-definition");
  return {
    box,
    glossary: root.querySelector('.mk-definition-page[data-title="Glossary"]'),
    pages: [...box.querySelectorAll(".mk-definition-page")],
  };
}

test("keeps different targeted dictionaries even with equal counts and meanings", () => {
  const { box, glossary, pages } = run(
    single("JMdict", "definition"),
    single("Jitendex", "definition"),
    "selected text",
  );
  assert.equal(pages.length, 3);
  assert.equal(box.querySelector(".mk-definition-count").textContent, "1/3");
  assert.ok(glossary.textContent.includes("definition"));
});
test("removes the repeated first definition from the full grouped glossary", () => {
  const { glossary } = run(
    single("JMdict", "first meaning"),
    grouped(["JMdict", "first meaning"], ["Jitendex", "other meaning"]),
  );
  assert.ok(!glossary.textContent.includes("first meaning"));
  assert.ok(glossary.textContent.includes("other meaning"));
});
test("preserves additional definitions from the same dictionary", () => {
  const { glossary } = run(
    grouped(["JMdict", "first meaning"]),
    grouped(["JMdict", "first meaning"], ["JMdict", "second meaning"]),
  );
  assert.ok(!glossary.textContent.includes("first meaning"));
  assert.ok(glossary.textContent.includes("second meaning"));
  assert.equal(glossary.hidden, true); // The remaining glossary is a navigable second page.
});
test("removes identical single fields without leaving an empty glossary page", () => {
  const field = single("JMdict", "definition");
  const { pages } = run(field, field);
  assert.equal(pages.length, 1);
  assert.equal(pages[0].hidden, false);
});
test("handles legacy grouped fields", () => {
  const { glossary } = run(
    grouped(["JMdict", "first meaning"]),
    grouped(["JMdict", "first meaning"], ["Jitendex", "other meaning"]),
  );
  assert.ok(!glossary.textContent.includes("first meaning"));
  assert.ok(glossary.textContent.includes("other meaning"));
});
test("keeps changed definitions from the same dictionary", () => {
  const { glossary } = run(
    single("JMdict", "first meaning"),
    single("JMdict", "second meaning"),
  );
  assert.ok(glossary.textContent.includes("second meaning"));
});
test("keeps image-only definitions and dictionary-scoped styling", () => {
  const { glossary } = run(
    single("JMdict", '<img src="one.png">'),
    single(
      "Jitendex",
      '<img src="two.png"><style>span { color: blue; }</style>',
    ),
  );
  assert.equal(glossary.querySelector("img").getAttribute("src"), "two.png");
  assert.ok(glossary.querySelector("style"));
});

test("preserves different italic definitions from one dictionary", () => {
  const { glossary } = run(
    single("JMdict", "<i>first meaning</i>"),
    single("JMdict", "<i>second meaning</i>"),
  );
  assert.ok(glossary.textContent.includes("second meaning"));
});
test("handles Yomitan's ungrouped first glossary without dictionary attributes", () => {
  const first =
    '<div class="yomitan-glossary"><i>(JMdict)</i> <span>first meaning</span></div>';
  const { glossary } = run(
    first,
    grouped(
      ["JMdict", "<span>first meaning</span>"],
      ["Jitendex", "other meaning"],
    ),
  );
  assert.ok(!glossary.textContent.includes("first meaning"));
  assert.ok(glossary.textContent.includes("other meaning"));
});
