import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { parseHTML } from "linkedom";

const source = readFileSync(
  new URL("../template/back.html", import.meta.url),
  "utf8",
);
const renderer = source.slice(
  source.indexOf("  function morae("),
  source.indexOf("  function initFieldGroups()"),
);

function renderPitch(reading, positions, categories = "", expression = "") {
  const { document } = parseHTML(
    `<html><body><div id="manatan-note-type">
    <div class="mk-back-expression">${expression}</div>
    <div class="mk-pitch"
      data-reading="${reading}" data-pitch-categories="${categories}"
    >${positions}</div></div></body></html>`,
  );
  const root = document.querySelector("#manatan-note-type");
  new Function("document", "root", "$", `${renderer}; initPitchDisplay();`)(
    document,
    root,
    (selector) => root.querySelector(selector),
  );
  return [...root.querySelectorAll(".mk-pitch-item")].map((item) => ({
    type: item.dataset.pitchType,
    morae: [...item.querySelectorAll(".mk-pitch-mora")].map(
      (mora) => mora.textContent,
    ),
    drop: item.querySelector(".mk-pitch-segment")?.textContent,
  }));
}

test("counts small tsu as a mora in the exported やっつける [4] graph", () => {
  assert.deepEqual(
    renderPitch(
      "やっつける",
      "<span>[</span><span>4</span><span>]</span>",
      "kifuku",
    ),
    [{ type: "kifuku", morae: ["や", "っ", "つ", "け", "る"], drop: "け" }],
  );
  assert.deepEqual(renderPitch("キョッカ", "[2]"), [
    { type: "nakadaka", morae: ["キョ", "ッ", "カ"], drop: "ッ" },
  ]);
});

test("derives the graph and color from the saved position", () => {
  const [graph] = renderPitch("ためす", "[2]", "odaka");
  assert.equal(graph.drop, "め");
  assert.equal(graph.type, "nakadaka");
});

test("applies a deduplicated kifuku category to all accented variants", () => {
  const graphs = renderPitch("やっつける", "[0], [4], [5]", "kifuku, heiban");
  assert.deepEqual(
    graphs.map(({ type, drop }) => [type, drop]),
    [
      ["heiban", undefined],
      ["kifuku", "け"],
      ["kifuku", "る"],
    ],
  );
});

test("derives each variant's color from its own downstep", () => {
  const graphs = renderPitch("はみがきこ", "[4], [3], [0]", "nakadaka,heiban");
  assert.deepEqual(
    graphs.map(({ type, drop }) => [type, drop]),
    [
      ["nakadaka", "き"],
      ["nakadaka", "が"],
      ["heiban", undefined],
    ],
  );
});

test("uses the headword's ruby readings or kana when the reading field is blank", () => {
  const expected = renderPitch("やっつける", "[4]", "kifuku");
  for (const expression of [
    "<ruby>遣<rt>や</rt></ruby>っ<ruby>付<rt>つ</rt></ruby>ける",
    "やっつける",
  ]) {
    assert.deepEqual(renderPitch("", "[4]", "kifuku", expression), expected);
  }
  assert.deepEqual(renderPitch("", "[4]", "kifuku", "遣っ付ける"), []);
});
