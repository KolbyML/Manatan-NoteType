import { cp, stat } from "node:fs/promises";
import { basename, join } from "node:path";
import { env } from "../tools/env.js";
import { paths } from "../tools/paths.js";

class Script {
  async ensureAnkiDir() {
    await stat(env.ANKI_COLLECTION_MEDIA_PATH);
  }

  async copyFiles(files, srcDir) {
    for (const file of files) {
      const src = join(srcDir, file);
      await stat(src);
      const dest = join(env.ANKI_COLLECTION_MEDIA_PATH, file);
      await cp(src, dest);
      console.log(`✅ Copied ${basename(src)}`);
    }
  }

  async copyAnkiBuild() {
    const FILES = [
      "_manatan_note_type_front.html",
      "_manatan_note_type_back.html",
      "_manatan_note_type_style.css",
    ];

    console.log("\n📁 Copying ANKI BUILD files...");
    await this.copyFiles(FILES, paths["@/.anki-build/"]);
  }

  async run() {
    console.log(
      `🔍 Checking Anki collection at: ${env.ANKI_COLLECTION_MEDIA_PATH}`,
    );
    await this.ensureAnkiDir();
    await this.copyAnkiBuild();
    console.log("\n🎉 Done!");
  }
}

const script = new Script();
script.run();
