import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { paths } from "../tools/paths.js";
import { getVersion, log } from "../tools/util.js";

class Script {
  PATHS = {
    FRONT_SRC: paths["@/template/front.html"],
    BACK_SRC: paths["@/template/back.html"],
    STYLE_SRC: paths["@/template/style.css"],

    FRONT_DEST: paths["@/.anki-build/_manatan_note_type_front.html"],
    BACK_DEST: paths["@/.anki-build/_manatan_note_type_back.html"],
    STYLE_DEST: paths["@/.anki-build/_manatan_note_type_style.css"],
  };

  LEGACY_OUTPUTS = [
    ".anki-build/_kiku_front.html",
    ".anki-build/_kiku_back.html",
    ".anki-build/_kiku_style.css",
    ".anki-build/_minikiku_front.html",
    ".anki-build/_minikiku_back.html",
    ".anki-build/_minikiku_style.css",
  ];

  async ensureDestDir() {
    await mkdir(paths["@/.anki-build/"], { recursive: true });
  }

  async removeLegacyOutputs() {
    await Promise.all(
      this.LEGACY_OUTPUTS.map((file) =>
        rm(`${paths["@/"]}/${file}`, { force: true }),
      ),
    );
  }

  async loadSources() {
    const [front, back, style] = await Promise.all([
      readFile(this.PATHS.FRONT_SRC, "utf8"),
      readFile(this.PATHS.BACK_SRC, "utf8"),
      readFile(this.PATHS.STYLE_SRC, "utf8"),
    ]);
    return { front, back, style };
  }

  async buildTemplates(src) {
    const version = `v${await getVersion()}`;
    log.yellow("Generating static Manatan-NoteType templates");

    const front = src.front.replace("__VERSION__", version);
    const back = src.back.replace("__VERSION__", version);
    const style = src.style.replace("__VERSION__", version);

    return { front, back, style };
  }

  async writeOutputs(templates) {
    await Promise.all([
      writeFile(this.PATHS.FRONT_DEST, templates.front),
      writeFile(this.PATHS.BACK_DEST, templates.back),
      writeFile(this.PATHS.STYLE_DEST, templates.style),
    ]);
  }

  async run() {
    await this.ensureDestDir();
    await this.removeLegacyOutputs();
    const sources = await this.loadSources();
    const templates = await this.buildTemplates(sources);
    await this.writeOutputs(templates);
  }
}

const script = new Script();
script
  .run()
  .then(() => {
    console.log("✅ Generated template");
  })
  .catch((err) => {
    console.error("❌ Failed to generate template:", err);
    process.exit(1);
  });
