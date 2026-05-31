import { createReadStream, createWriteStream } from "node:fs";
import { readFile, rm } from "node:fs/promises";
import { createGzip } from "node:zlib";
import chalk from "chalk";
import { paths } from "./paths.js";

export async function gzipFile(src, dest = `${src}.gz`, removeSrc = true) {
  return new Promise((resolve, reject) => {
    const gzip = createGzip();
    const input = createReadStream(src);
    const output = createWriteStream(dest);

    input.pipe(gzip).pipe(output);

    output.on("finish", async () => {
      if (removeSrc) {
        await rm(src, { force: true });
      }
      resolve();
    });

    output.on("error", reject);
  });
}

export const log = {
  red(message) {
    console.log(chalk.red(message));
  },
  green(message) {
    console.log(chalk.green(message));
  },
  yellow(message) {
    console.log(chalk.yellow(message));
  },
  blue(message) {
    console.log(chalk.blue(message));
  },
  magenta(message) {
    console.log(chalk.magenta(message));
  },
  cyan(message) {
    console.log(chalk.cyan(message));
  },
  white(message) {
    console.log(chalk.white(message));
  },
  gray(message) {
    console.log(chalk.gray(message));
  },

  // background colors (optional)
  bgRed(message) {
    console.log(chalk.bgRed(message));
  },
  bgGreen(message) {
    console.log(chalk.bgGreen(message));
  },
  bgBlue(message) {
    console.log(chalk.bgBlue(message));
  },
};

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function getVersion() {
  const pkgJsonPath = paths["@/package.json"];
  const pkg = JSON.parse(await readFile(pkgJsonPath, "utf8"));
  const version = pkg.version;
  if (typeof version !== "string") throw Error("version is not a string");
  return version;
}
