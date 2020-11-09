import path from "path";
import fs from "fs-extra";
import pckg from "../package.json";

const json = path.resolve("dist", "package.json");

delete pckg.private;
delete pckg.devDependencies;
delete pckg.eslintConfig;
delete pckg.browserslist;
delete pckg.nodemonConfig;
delete pckg["react-scripts"];
delete pckg.scripts;

const _pckg = {
  ...pckg,
  homepage: "https://github.com/mapineda48/mapineda-react#readme",
  bin: {
    mapineda: "./bin/index.js",
  },
};

fs.outputJSONSync(json, _pckg);
