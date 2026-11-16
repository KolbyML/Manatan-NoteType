import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { parseHTML } from "linkedom";

const source = readFileSync(
  new URL("../template/front.html", import.meta.url),
  "utf8",
);
const script = source.match(/<script>([\s\S]+)<\/script>/)[1];
const nav = `
  <div class="mk-front-field-group-nav" hidden>
    <button class="mk-field-group-prev"></button>
    <span class="mk-field-group-date"></span>
    <span class="mk-field-group-count"></span>
    <button class="mk-field-group-next"></button>
  </div>`;
const contexts = `
  <span data-group-id="2">新しい<b>例文</b></span>
  <span data-group-id="1">前の<b>例文</b></span>
  最後の<br><b>例文</b>`;

function render(body) {
  const { document, Event, Node } = parseHTML(
    `<html><body><div id="manatan-note-type">${body}${nav}</div></body></html>`,
  );
  new Function("document", "Node", script)(document, Node);
  return { $: (selector) => document.querySelector(selector), Event };
}

test("reveals context controls when a click card switches to the sentence", () => {
  const { $, Event } = render(`
    <label class="mk-click-card">
      <input type="checkbox">
      <span class="mk-click-sentence">${contexts}</span>
    </label>`);
  const controls = $(".mk-front-field-group-nav");
  assert.equal(controls.hidden, true);
  const toggle = $(".mk-click-card input");
  toggle.checked = true;
  toggle.dispatchEvent(new Event("change"));
  assert.equal(controls.hidden, false);
  assert.equal($(".mk-field-group-count").textContent, "1 / 3");

  $(".mk-field-group-prev").click();
  assert.equal($(".mk-field-group-count").textContent, "3 / 3");
  const legacy = $('.mk-click-sentence [data-group-id="0"]');
  assert.equal(legacy.hidden, false);
  assert.ok(legacy.querySelector("br"));

  toggle.checked = false;
  toggle.dispatchEvent(new Event("change"));
  assert.equal(controls.hidden, true);
});

test("keeps the sentences for every native playback clip visible on grouped audio fronts", () => {
  const { $ } = render(`
    <div class="mk-front-audio">
      <div class="mk-front-sentence">${contexts}</div>
      <div class="mk-audio-row">
        <span data-group-id="2">[anki:play:q:0]</span>
        <span data-group-id="1">[anki:play:q:1]</span>
      </div>
    </div>`);
  const front = $(".mk-front-audio");
  assert.equal(front.classList.contains("mk-front-grouped-audio"), true);
  assert.equal(front.querySelectorAll("[data-group-id][hidden]").length, 0);
  assert.equal(
    front.querySelectorAll(".mk-front-sentence > [data-group-id]").length,
    3,
  );
  assert.equal(
    front.querySelector(".mk-front-sentence b").textContent,
    "[...]",
  );
  assert.equal($(".mk-front-field-group-nav").hidden, true);
});
