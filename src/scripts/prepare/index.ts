import fs from "fs-extra";
import paths from "./paths";

const pckg = fs.readJSONSync(paths.root.package);

const { dependencies, eslintConfig, browserslist, engines } = fs.readJSONSync(
  paths.prepare.package
);

const _pckg = {
  ...pckg,
  private: true,
  license: "MIT",
  scripts: {
    start: "mapineda start",
    build: "mapineda build",
    test: "react-scripts test",
    eject: "react-scripts eject",
  },
  dependencies: {
    ...pckg.dependencies,
    ...dependencies,
  },
  eslintConfig,
  browserslist,
  engines,
  "react-scripts": {
    entry: "./src/index.tsx",
  },
};


fs.writeJSONSync(paths.root.package, _pckg, { spaces: 2 });

Object.values(paths.prepare.cra).forEach((path) => {
  const dest = path.replace(__dirname, paths.root.dirname);

  fs.copySync(path, dest, { overwrite: true });
});

console.log(
  "Your package.json has been populated with default values."
);
