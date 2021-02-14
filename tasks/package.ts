import path from "path";
import fs from "fs-extra";
import current from "../package.json";
import { version as tslib } from "tslib/package.json";

const json = path.resolve("dist", "package.json");

const {
  name,
  version,
  author,
  license,
  bugs,
  publishConfig,
  repository,
  dependencies,
} = current;

const bin = {
  mapineda: "bin/index.js",
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
  repository,
  bin,
  dependencies: {
    tslib: "^" + tslib,
    "fs-extra": dependencies["fs-extra"],
    "@popperjs/core": dependencies["@popperjs/core"],
  },
  peerDependencies: {
    "react-scripts": "^" + dependencies["react-scripts"],
    react: dependencies["react"],
    "react-dom": dependencies["react-dom"],
  },

  peerDependenciesMeta: {
    "@types/react": {
      optional: true,
    },
    "@types/react-dom": {
      optional: true,
    },
  },
};

fs.outputJSONSync(json, next);
