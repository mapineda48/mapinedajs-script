import path from "path";
import root from "../../path";

const prepare = {
  package: resolve("package.json"),
  cra: {
    tsconfig: resolve("tsconfig.json"),
    public: resolve("public"),
  },
};

export default {
  prepare,
  root,
};

function resolve(...args: string[]) {
  return path.join(__dirname, ...args);
}
