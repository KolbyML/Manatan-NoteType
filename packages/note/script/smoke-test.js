import { access, readdir, readFile } from "node:fs/promises";
import { paths } from "../tools/paths.js";

const outputs = {
  front: paths["@/.anki-build/_manatan_note_type_front.html"],
  back: paths["@/.anki-build/_manatan_note_type_back.html"],
  style: paths["@/.anki-build/_manatan_note_type_style.css"],
};

const forbiddenSnippets = [
  "AnkiConnect",
  "_kiku.js",
  "_kiku_libs.js",
  "_kiku_shared.js",
  "_kiku_lazy.js",
  "_kiku_worker.js",
  "_kiku_plugin",
  "_kiku_db",
  "_minikiku",
  "miniKiku",
  "minikiku",
  "mk-header-status",
  "mk-header-theme",
  "mk-theme-light",
  "mk-theme-dark",
  "data-anki-include",
  "data-kiku",
  "HYDRATION_SCRIPT",
  "SSR_TEMPLATE",
  "initAnki",
  'id="kiku-root"',
];

const expectedFields = [
  "Expression",
  "ExpressionFurigana",
  "ExpressionReading",
  "ExpressionAudio",
  "SelectionText",
  "MainDefinition",
  "DefinitionPicture",
  "Sentence",
  "SentenceFurigana",
  "SentenceAudio",
  "Picture",
  "Glossary",
  "Hint",
  "PitchPosition",
  "Frequency",
  "FreqSort",
  "MiscInfo",
  "Tags",
];

async function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function readOutputs() {
  await Promise.all(Object.values(outputs).map((file) => access(file)));
  const [front, back, style] = await Promise.all(
    Object.values(outputs).map((file) => readFile(file, "utf8")),
  );
  return { front, back, style, all: `${front}\n${back}\n${style}` };
}

async function run() {
  const files = await readdir(paths["@/.anki-build/"]);
  await assert(
    files.includes("_manatan_note_type_front.html") &&
      files.includes("_manatan_note_type_back.html") &&
      files.includes("_manatan_note_type_style.css"),
    "Missing generated Manatan-NoteType template files.",
  );
  await assert(
    !files.some((file) => file.startsWith("_kiku_")),
    "Legacy _kiku_* files are still present in .anki-build.",
  );

  const templates = await readOutputs();
  for (const snippet of forbiddenSnippets) {
    await assert(
      !templates.all.includes(snippet),
      `Generated templates still contain fragile runtime snippet: ${snippet}`,
    );
  }

  await assert(
    templates.front.includes('id="manatan-note-type"') &&
      templates.back.includes('id="manatan-note-type"') &&
      templates.style.includes("#manatan-note-type"),
    "Generated templates are missing the Manatan-NoteType root hooks.",
  );

  await assert(
    templates.style.includes("--mk-bg: oklch(25.33% 0.016 252.42)") &&
      templates.style.includes("--mk-panel-2: oklch(23.26% 0.014 253.1)") &&
      templates.style.includes("--mk-fg: oklch(97.807% 0.029 256.847)"),
    "Generated templates should default to the dark Kiku-style theme.",
  );

  await assert(
    templates.front.includes("mk-front-hero") &&
      templates.front.includes("mk-expression-panel") &&
      templates.front.includes("mk-front-header") &&
      templates.back.includes("mk-header-layout") &&
      templates.style.includes(".mk-front-stack"),
    "Generated front template is missing the Kiku-style front layout.",
  );

  await assert(
    templates.style.includes("_manatan_note_type_font_hina-mincho.woff2") &&
      templates.style.includes("_manatan_note_type_font_klee-one.woff2") &&
      templates.style.includes(
        "_manatan_note_type_font_ibm-plex-sans-jp.woff2",
      ),
    "Generated templates are missing bundled Manatan-NoteType font references.",
  );

  await assert(
    templates.back.includes("function pitchPattern(") &&
      templates.back.includes("mk-pitch-item") &&
      templates.style.includes(".mk-pitch-segment::after"),
    "Generated templates are missing the static Kiku-style pitch renderer.",
  );

  await assert(
    templates.back.includes("function initPictureCycler()") &&
      templates.back.includes("function wrapUngroupedSentenceNodes()") &&
      templates.back.includes(
        "const siblingRoot = script?.previousElementSibling",
      ) &&
      templates.back.includes("const nestedRoot =") &&
      templates.back.includes("const parentRoot =") &&
      templates.back.includes('querySelector?.("#manatan-note-type")') &&
      templates.back.includes("function initDefinitionPictureCycler()") &&
      templates.back.includes("mk-picture-controls") &&
      templates.style.includes(".mk-picture-controls"),
    "Generated templates are missing robust static grouped media/sentence behavior.",
  );

  await assert(
    templates.back.includes("function initFrequencyDropdown()") &&
      templates.back.includes("mk-frequency-toggle") &&
      templates.style.includes(".mk-frequency-menu:hover .mk-frequency-list"),
    "Generated templates are missing the frequency dropdown.",
  );

  for (const field of expectedFields) {
    await assert(
      new RegExp(`{{[#/^]?(?:furigana:|kana:|kanji:)?${field}}}`).test(
        templates.all,
      ),
      `Generated templates are missing expected field {{${field}}}.`,
    );
  }

  console.log("✅ Static template smoke test passed");
}

run().catch((err) => {
  console.error("❌ Static template smoke test failed:", err);
  process.exit(1);
});
