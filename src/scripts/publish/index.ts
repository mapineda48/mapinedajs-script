import path from "path";
import fs from "fs-extra";
import { execSync } from "child_process";
import { readPackage, existsInLine } from "../..";

/**
 * https://github.com/features/packages
 * https://docs.github.com/en/free-pro-team@latest/packages/using-github-packages-with-your-projects-ecosystem/configuring-npm-for-use-with-github-packages#authenticating-to-github-package-registry
 * https://github.com/Codertocat/hello-world-npm
 *
 */
const dist = path.resolve("dist");

const pckg = readPackage();

const {
  scripts: { build },
} = pckg;

if (!build) {
  console.log("missing script build in package.json");
  process.exit(1);
}

fs.removeSync(dist);

try {
  execIt(build);
} catch (error) {
  console.log(error);
  process.exit(1);
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
