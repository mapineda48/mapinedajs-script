import path from "path";
import { execSync } from "child_process";
import { readConfig, existsInLine, findValue } from "..";

/**
 * minimal overwrite react-scripts config without eject
 */

process.env.NODE_ENV = "development";

const src = {
  env: require.resolve("react-scripts/config/env"),
  paths: require.resolve("react-scripts/config/paths"),
  start: require.resolve("react-scripts/scripts/start"),
  build: require.resolve("react-scripts/scripts/build"),
};

const paths = require(src.paths);

/**
 * Important!!!
 * https://github.com/facebook/create-react-app/blob/025f2739ceb459c79a281ddc6e60d7fd7322ca24/packages/react-scripts/config/env.js#L15
 */

require(src.env);

const config = readConfig()["react-scripts"];

let appIndexJs = paths.appIndexJs;

if (config?.entry) {
  const entry = config.entry;

  appIndexJs = path.resolve(entry);
}

const start = parseStart();

const build = parseBuild();

if (start) {
  overwritePaths(start);

  require(src.start);
} else if (build) {
  if (Array.isArray(build)) {
    const [bin] = process.argv;

    const _bin = bin.endsWith("ts-node") ? `${bin} -P tsconfig.dist.json` : bin;

    build.forEach((b) => {
      const command = `${_bin} ${__filename} build --entry ${b.entry} --build ${b.build}`;

      execSync(command, { stdio: "inherit" });
    });

    process.exit();
  }

  process.env.INLINE_RUNTIME_CHUNK = "false";

  overwritePaths(build);

  require(src.build);
}

function parseBuild() {
  const script = "build";

  if (!existsInLine(script)) {
    return;
  }

  if (existsInLine("--apps") && config?.apps) {
    return [...config.apps];
  }

  const publicUrlOrPath = "./";

  const entry = "--entry";

  const build = "--build";

  const isCustom = existsInLine(entry) && existsInLine(build);

  if (!isCustom) {
    let appIndexJs = paths.appIndexJs;
    let appBuild = paths.appBuild;

    if (config?.entry) {
      appIndexJs = path.resolve(config.entry);
    }

    if (config?.build) {
      appBuild = path.resolve(config.build);
    }

    return {
      appIndexJs,
      publicUrlOrPath,
      appBuild,
    };
  }

  const appIndexJs = path.resolve(findValue(entry));

  const appBuild = path.resolve(findValue(build));

  return {
    appIndexJs,
    publicUrlOrPath,
    appBuild,
  };
}

function parseStart() {
  const script = "start";

  if (!existsInLine(script)) {
    return;
  }

  const target = findValue(script);

  if (target) {
    return { appIndexJs: path.resolve(target) };
  }

  if (config?.entry) {
    const entry = config.entry;

    return { appIndexJs: path.resolve(entry) };
  }

  return { appIndexJs };
}

function overwritePaths(_paths: any) {
  const log = ["Overwrite paths\n"];

  Object.keys(_paths).forEach((key) => {
    log.push(`${key}: ${_paths[key]}`);
  });

  console.log(log.join("\n"));
  console.log();

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
