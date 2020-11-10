import fs from "fs-extra";
import paths from "./paths";
import foo from "./package.json";

const pckg = fs.readJSONSync(paths.root.package);

const {
  dependencies,
  devDependencies,
  eslintConfig,
  browserslist,
  engines,
  nodemonConfig,
} = foo;

const scripts = {
  start: "mapineda start",
  build: "mapineda build",
  test: "react-scripts test",
  eject: "react-scripts eject",
};

const _pckg = {
  ...pckg,
  private: true,
  license: "MIT",
  scripts,
  dependencies: {
    ...pckg.dependencies,
    ...dependencies,
    ...devDependencies,
  },
  eslintConfig,
  browserslist,
  engines,
  nodemonConfig,
  "react-scripts": {
    entry: "./src/index.tsx",
  },
};

fs.writeJSONSync(paths.root.package, _pckg, { spaces: 2 });

paths.templates.forEach((path) => {
  const dest = path.replace(paths.template, paths.root.dirname);

  fs.copySync(path, dest, { overwrite: true });
});

fs.moveSync(paths.env.src, paths.env.dest);

fs.moveSync(paths.gitignore.src, paths.gitignore.dest);


console.log("Your package.json has been populated with default values.");
