// Adapted from Kiku's parse-furigana implementation. Keep this function
// self-contained so generate-template.js can embed it in the Anki template.
export function parseFurigana(input) {
  const isKanji = (char) => /\p{Script=Han}/u.test(char);
  const trailingNumericKanjiPattern = /[0-9０-９]+\p{Script=Han}+$/u;

  function tokenize(value) {
    const tokens = [];
    let index = 0;
    const chars = Array.from(value);

    while (index < chars.length) {
      const char = chars[index];

      if (char === "[") {
        let reading = "";
        index++;

        while (index < chars.length && chars[index] !== "]") {
          reading += chars[index];
          index++;
        }

        if (chars[index] === "]") index++;
        tokens.push({ type: "furigana", value: reading });
        continue;
      }

      if (char === " " || char === "　") {
        tokens.push({ type: "space" });
      } else if (isKanji(char)) {
        tokens.push({ type: "kanji", value: char });
      } else {
        tokens.push({ type: "kana", value: char });
      }

      index++;
    }

    return tokens;
  }

  function tokensToRenderItems(tokens) {
    const result = [];
    let textBuffer = "";
    let kanjiBuffer = "";
    let mixedBuffer = "";
    let lastTokenType = null;
    let hasSpaceBefore = false;

    function flushText() {
      if (!textBuffer) return;
      result.push({ type: "text", text: textBuffer });
      textBuffer = "";
    }

    function flushMixedAsText() {
      if (!mixedBuffer) return;
      textBuffer += mixedBuffer;
      mixedBuffer = "";
      kanjiBuffer = "";
      hasSpaceBefore = false;
    }

    for (const token of tokens) {
      switch (token.type) {
        case "space": {
          flushMixedAsText();
          textBuffer += " ";
          hasSpaceBefore = true;
          break;
        }

        case "kanji": {
          kanjiBuffer += token.value;
          mixedBuffer += token.value;
          break;
        }

        case "kana": {
          kanjiBuffer = "";
          mixedBuffer += token.value;
          break;
        }

        case "furigana": {
          let base = "";

          if (hasSpaceBefore) {
            base = mixedBuffer;
            if (textBuffer.endsWith(" ")) {
              textBuffer = textBuffer.slice(0, -1);
            }
          } else if (lastTokenType === "kanji") {
            base =
              mixedBuffer.match(trailingNumericKanjiPattern)?.[0] ??
              kanjiBuffer;
            textBuffer += mixedBuffer.slice(0, -base.length);
          } else if (lastTokenType === "kana") {
            base = mixedBuffer;
          }

          if (base) {
            flushText();
            result.push({ type: "ruby", text: base, reading: token.value });
            mixedBuffer = "";
            kanjiBuffer = "";
            hasSpaceBefore = false;
          }
          break;
        }
      }
      lastTokenType = token.type;
    }

    flushMixedAsText();
    flushText();
    return result;
  }

  return tokensToRenderItems(tokenize(input));
}
