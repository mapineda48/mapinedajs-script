import path from "path";
import fs from "fs-extra";
import current from "../package.json";

const json = path.resolve("dist", "package.json");

const {
  name,
  version,
  author,
  license,
  bugs,
  publishConfig,
  dependencies,
} = current;

const bin = {
  mapineda: "./bin/index.js",
};

const homepage = "https://github.com/mapineda48/mapineda-react#readme";

const next = {
  name,
  version,
  author,
  homepage,
  license,
  bugs,
  publishConfig,
  bin,
  dependencies: {
    "react-scripts": ">=3.4.x",
    "fs-extra": dependencies["fs-extra"],
    "@popperjs/core": dependencies["@popperjs/core"],
  },
};

fs.outputJSONSync(json, next);
