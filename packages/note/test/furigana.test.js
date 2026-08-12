import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseFurigana } from "../tools/furigana.js";

describe("parseFurigana", () => {
  it("keeps kana outside the ruby bases in the reported regression", () => {
    assert.deepEqual(parseFurigana("お化[ば]け屋敷[やしき]"), [
      { type: "text", text: "お" },
      { type: "ruby", text: "化", reading: "ば" },
      { type: "text", text: "け" },
      { type: "ruby", text: "屋敷", reading: "やしき" },
    ]);
  });

  it("handles standard mixed kana and kanji markup", () => {
    assert.deepEqual(parseFurigana("青[あお]い海[うみ]"), [
      { type: "ruby", text: "青", reading: "あお" },
      { type: "text", text: "い" },
      { type: "ruby", text: "海", reading: "うみ" },
    ]);
  });

  it("supports Kiku's whole-expression and space-delimited markup", () => {
    assert.deepEqual(parseFurigana("この 為す術もない[なすすべもない]状態"), [
      { type: "text", text: "この" },
      {
        type: "ruby",
        text: "為す術もない",
        reading: "なすすべもない",
      },
      { type: "text", text: "状態" },
    ]);
  });

  it("keeps numbers with their kanji ruby base", () => {
    assert.deepEqual(parseFurigana("次の１０日[とおか]に会う"), [
      { type: "text", text: "次の" },
      { type: "ruby", text: "１０日", reading: "とおか" },
      { type: "text", text: "に会う" },
    ]);
  });
});
