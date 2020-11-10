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
  env:{
    src:path.resolve('env'),
    dest:path.resolve('.env')
  },
  gitignore:{
    src:path.resolve('gitignore'),
    dest:path.resolve('.gitignore')
  }
};

function resolve(...args: string[]) {
  return path.join(__dirname, ...args);
}
