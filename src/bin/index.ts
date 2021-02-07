#!/usr/bin/env node

import fs from "fs-extra";
import path from "path";
import { execSync } from "child_process";

process.env.NODE_ENV = process.env.NODE_ENV || "development";

const src = {
  env: require.resolve("react-scripts/config/env"),
  paths: require.resolve("react-scripts/config/paths"),
  start: require.resolve("react-scripts/scripts/start"),
  build: require.resolve("react-scripts/scripts/build"),
};

/**
 * Important!!!
 * https://github.com/facebook/create-react-app/blob/025f2739ceb459c79a281ddc6e60d7fd7322ca24/packages/react-scripts/config/env.js#L15
 */
require(src.env);

const config = readPackage("react-scripts");

const start = parseStart();

const build = parseBuild();

if (build) {
  if (!Array.isArray(build)) {
    overwritePaths(build);
    require(src.build);
  } else {
    build.forEach((app) => {
      const command = process.argv.slice(0, 2);

      command.push("build");

      Object.entries(app).forEach(([opt, val]) =>
        command.push(`--${opt} ${val}`)
      );

      execSync(command.join(" "), { stdio: "inherit" });
    });
  }
} else if (start) {
  overwritePaths(start);
  require(src.start);
}

/**
 *  Functions
 */
function parseBuild() {
  const script = "build";

  if (!existsInLine(script)) {
    return;
  }

  if (existsInLine("apps")) {
    delete config.default;

    return Object.values(config) as App[];
  }

  const paths: PathsArg = {};

  const target = findValue(script);

  const isApp = target && !target.includes("--") && target !== "default";

  if (isApp) {
    const app = config[target];

    if (app) {
      if (app?.entry) {
        paths.appIndexJs = path.resolve(app.entry);
      }
      if (app?.output) {
        paths.appBuild = path.resolve(app.output);
      }
      if (app?.url) {
        paths.publicUrlOrPath = app.url;
      }
    }
  } else if (config?.default) {
    const app = config[config.default];

    if (app?.entry) {
      paths.appIndexJs = path.resolve(app.entry);
    }
    if (app?.output) {
      paths.appBuild = path.resolve(app.output);
    }
    if (app?.url) {
      paths.publicUrlOrPath = app.url;
    }
  } else {
    const entry = "--entry";

    const output = "--output";

    const url = "--url";

    if (existsInLine(entry)) {
      paths.appIndexJs = path.resolve(findValue(entry));
    }

    if (existsInLine(output)) {
      paths.appBuild = path.resolve(findValue(output));
    }
    if (existsInLine(url)) {
      paths.publicUrlOrPath = findValue(url);
    }
  }

  return paths;
}

function parseStart() {
  const script = "start";

  if (!existsInLine(script)) {
    return;
  }

  const paths: PathsArg = {};

  const target = findValue(script);

  if (target && target !== "default") {
    const app = config[target];

    if (app?.entry) {
      paths.appIndexJs = path.resolve(app.entry);
    } else {
      paths.appIndexJs = path.resolve(target);
    }
  } else if (config?.default) {
    const app = config[config.default];

    if (app?.entry) {
      paths.appIndexJs = path.resolve(app.entry);
    }
  }

  return paths;
}

/**
 * Update paths in cache with input
 * https://nodejs.org/api/modules.html#modules_require_cache
 * @param paths object
 * https://github.com/facebook/create-react-app/blob/6a51dcdfb84d1a47294fcbf9d7d569eaf1b4d571/packages/react-scripts/config/paths.js#L60
 */
function overwritePaths(_paths: PathsArg) {
  const paths: Paths = require(src.paths);

  const current = require.cache[src.paths];

  delete require.cache[src.paths];

  require.cache[src.paths] = {
    ...current,
    exports: {
      ...paths,
      ..._paths,
    },
  };
}

function readPackage(key = "") {
  const file = path.resolve("package.json");

  const json = fs.readJSONSync(file);

  if (!key) {
    return json;
  }

  return json[key];
}

function existsInLine(value: string | string[]) {
  if (!Array.isArray(value)) {
    return process.argv.includes(value);
  }

  const results = value.map((v) => process.argv.includes(v));

  /**
   * its like a operator logic or
   */
  return results.includes(true);
}

function findIndex(value: string) {
  return process.argv.findIndex((v) => v === value);
}

function findValue(flag: string) {
  const index = findIndex(flag);

  return process.argv[index + 1];
}

/**
 * Typings
 */

type PathsArg = Partial<Paths>;

interface Paths {
  dotenv: string;
  appPath: string;
  appBuild: string;
  appPublic: string;
  appHtml: string;
  appIndexJs: string;
  appPackageJson: string;
  appSrc: string;
  appTsConfig: string;
  appJsConfig: string;
  yarnLockFile: string;
  testsSetup: string;
  proxySetup: string;
  appNodeModules: string;
  publicUrlOrPath: string;
  ownPath: string;
  ownNodeModules: string;
  appTypeDeclarations: string;
  ownTypeDeclarations: string;
  moduleFileExtensions: string[];
}

interface App {
  entry: string;
  url: string;
  output: string;
}
