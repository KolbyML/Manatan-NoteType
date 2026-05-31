import { join } from "node:path";
import { fileURLToPath } from "node:url";

const TOOLS_DIR = fileURLToPath(new URL(".", import.meta.url));
const ROOT = join(TOOLS_DIR, "..");
const p = (path) => join(ROOT, path);

export const paths = {
  "@/": ROOT,
  "@/.env": p(".env"),
  "@/package.json": p("package.json"),

  "@/template/": p("template/"),
  "@/template/front.html": p("template/front.html"),
  "@/template/back.html": p("template/back.html"),
  "@/template/style.css": p("template/style.css"),

  "@/.anki-build/": p(".anki-build/"),
  "@/.anki-build/_manatan_note_type_front.html": p(
    ".anki-build/_manatan_note_type_front.html",
  ),
  "@/.anki-build/_manatan_note_type_back.html": p(
    ".anki-build/_manatan_note_type_back.html",
  ),
  "@/.anki-build/_manatan_note_type_style.css": p(
    ".anki-build/_manatan_note_type_style.css",
  ),

  "@/.release/": p(".release/"),
  "@/.release/Manatan-NoteType.apkg": p(".release/Manatan-NoteType.apkg"),
};
