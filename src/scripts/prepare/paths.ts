import fs from "fs-extra";
import path from "path";
import root from "../../path";

const templates = fs
  .readdirSync(resolve("template"))
  .map((file) => resolve("template", file));

export default {
  templates,
  template: resolve("template"),
  root,
};

function resolve(...args: string[]) {
  return path.join(__dirname, ...args);
}
