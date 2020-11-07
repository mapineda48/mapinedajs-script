#!/usr/bin/env node

import path from "path";
import { readPackage, existsInLine, findValue } from "../..";

/**
 * minimal overwrite react-scripts config without eject
 */
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

if (start) {
  overwritePaths(start);
  require(src.start);
} else if (build) {
  overwritePaths(build);
  require(src.build);
}

/**
 *  Functions
 */
function parseBuild() {
  const script = "build";

  if (!existsInLine(script)) {
    return;
  }

  const paths: PathsArg = {};

  const entry = "--entry";

  const output = "--output";

  const url = "--url";

  const withConfig = !existsInLine([entry, output]);

  if (withConfig) {
    if (config?.entry) {
      paths.appIndexJs = path.resolve(config.entry);
    }

    if (config?.output) {
      paths.appBuild = path.resolve(config.output);
    }

    if (config?.url) {
      paths.publicUrlOrPath = config.url;
    }
  } else {
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

  if (config?.entry) {
    paths.appIndexJs = path.resolve(config.entry);
  }

  const target = findValue(script);

  if (target) {
    paths.appIndexJs = path.resolve(target);
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
