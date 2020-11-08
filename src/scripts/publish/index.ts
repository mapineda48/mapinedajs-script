import path from "path";
import fs from "fs-extra";
import { execSync } from "child_process";
import { readPublish, readPackage, existsInLine } from "../..";

/**
 * https://github.com/features/packages
 * https://docs.github.com/en/free-pro-team@latest/packages/using-github-packages-with-your-projects-ecosystem/configuring-npm-for-use-with-github-packages#authenticating-to-github-package-registry
 * https://github.com/Codertocat/hello-world-npm
 *
 * Warning this file should be load from packages management
 * npm / yarn
 */
const root = path.resolve();

const source = path.resolve("src");

const dist = path.resolve("dist");

const finalJson = path.resolve(dist, "package.json");

const pckg = readPackage();

const config = readPublish();

const {
  scripts: { build },
} = pckg;

if (!build) {
  console.log("tooljs missing script build in package.json");
  process.exit(1);
}

fs.removeSync(dist);

try {
  execIt(build);
} catch (error) {
  console.log("tooljs fail build script");
  console.log(error);
  process.exit(1);
}

/**
 * Packages Json Publish
 */
let finalPckg: any = {};

finalPckg.name = pckg.name || "unknown";
finalPckg.version = pckg.version || "0.0.0";
finalPckg.author = pckg.author || "Miguel Angel Pineda Vega";
finalPckg.license = pckg.license || "MIT";
finalPckg.homepage = pckg.homepage || "";
finalPckg.bugs = pckg.bugs || {};
finalPckg.publishConfig = pckg.publishConfig || {};
finalPckg.engines = pckg.engines || {};

if (config?.package) {
  finalPckg = { ...finalPckg, ...config.package };
}

fs.outputJSONSync(finalJson, finalPckg);

/**
 *  Copy Files
 */
if (config?.files) {
  const files = config.files;

  files.forEach((file: any) => {
    const src = path.resolve(file);
    const dest = src.includes(source)
      ? src.replace(source, dist)
      : src.replace(root, dist);

    fs.copySync(src, dest, { overwrite: true });
  });
}

if (config?.trashs) {
  const trashs = config.trashs;

  trashs.forEach((file: any) => {
    const src = path.resolve(file);

    fs.removeSync(src);
  });
}

/**
 * Only pack packages
 * https://docs.npmjs.com/cli-commands/pack.html
 */
if (existsInLine("pack")) {
  execIt("npm pack", { cwd: dist });
  process.exit();
}

/**
 * Publish
 * https://docs.npmjs.com/cli/publish
 */
execIt("npm publish", { cwd: dist });

fs.removeSync(dist);

function execIt(command: string, opt = {}) {
  execSync(command, { ...opt, stdio: "inherit" });
}