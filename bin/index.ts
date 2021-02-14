#!/usr/bin/env node

import fs from "fs-extra";
import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import type { Configuration, Entry } from "webpack";

/**
 * CLI
 */
const flag = {
  start: "--start",
  build: "--build",
  cleanBuild: "--clean-build",
  entry: "--entry",
  output: "--output",
  url: "--url",
};

/**
 * react scripts
 */
const src = {
  env: require.resolve("react-scripts/config/env"),
  paths: require.resolve("react-scripts/config/paths"),
  start: require.resolve("react-scripts/scripts/start"),
  build: require.resolve("react-scripts/scripts/build"),
  config: require.resolve("react-scripts/config/webpack.config"),
};

/**
 * Important!!!
 * https://github.com/facebook/create-react-app/blob/025f2739ceb459c79a281ddc6e60d7fd7322ca24/packages/react-scripts/config/env.js#L15
 */
(process as any).env.NODE_ENV = process.env.NODE_ENV || "development";
require(src.env);

const config = readPackage("react-scripts");

if (existsInLine(flag.start)) {
  const paths = parseStart();
  overwritePaths(paths);
  require(src.start);
} else if (existsInLine(flag.build)) {
  const build = parseBuild();

  if (!Array.isArray(build)) {
    overwritePaths(build);
    require(src.build);
  } else {
    const [apps, url] = build;

    /**
     * prevent process exit missing file
     * https://github.com/facebook/create-react-app/blob/025f2739ceb459c79a281ddc6e60d7fd7322ca24/packages/react-scripts/scripts/build.js#L59
     */
    const [app] = apps;
    overwritePaths({ appIndexJs: app.entry });

    overwriteConfig(apps, url);
    require(src.build);
  }
} else if (existsInLine(flag.cleanBuild)) {
  removeUnunsed();
}

/**
 *  Lib
 */

/**
 * Parse Build
 */
function parseBuild() {
  if (existsInLine("entrys")) {
    delete config.default;

    const entrys = Object.values(config) as App[];

    const url = findValue(flag.url);

    return [entrys, url] as [App[], string];
  }

  const paths: PathsArg = {};

  const target = findValue(flag.build);

  if (target) {
    const isApp = target !== "default" && config[target];

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
    } else {
      findValue(flag.build, (value) => {
        paths.appIndexJs = path.resolve(value);
      });

      findValue(flag.output, (value) => {
        paths.appBuild = path.resolve(value);
      });

      findValue(flag.url, (value) => {
        paths.publicUrlOrPath = value;
      });
    }
  } else if (config?.default && config[config.default]) {
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
  }

  return paths;
}

function parseStart() {
  const paths: PathsArg = {};

  const target = findValue(flag.start);

  if (target && target !== "default") {
    const app = config[target];

    if (app?.entry) {
      paths.appIndexJs = path.resolve(app.entry);
    } else {
      paths.appIndexJs = path.resolve(target);
    }
  } else if (config?.default && config[config.default]) {
    const app = config[config.default];

    if (app?.entry) {
      paths.appIndexJs = path.resolve(app.entry);
    }
  }

  return paths;
}

async function removeUnunsed() {
  const src = path.resolve("public");

  const build = path.resolve("build");

  let files: string[];

  try {
    files = await readdir(src);
  } catch (error) {
    console.log(error);
    return;
  }

  files
    .filter((file) => file !== "index.html" && file !== "favicon.ico")
    .map((file) => path.resolve(build, file))
    .forEach(async (file) => {
      try {
        await fs.remove(file);
      } catch (error) {
        console.log(error);
      }
    });
}

async function readdir(path: string) {
  return new Promise<string[]>((res, rej) => {
    fs.readdir(path, (err, files) => {
      if (err) return rej(err);
      res(files);
    });
  });
}

/**
 * Update webpack Config
 * https://github.com/facebook/create-react-app/blob/025f2739ceb459c79a281ddc6e60d7fd7322ca24/packages/react-scripts/config/webpack.config.js#L74
 */
function overwriteConfig(apps: App[], url: string) {
  const paths: Paths = require(src.paths);

  const factory: FactoryConfig = require(src.config);

  const current = factory("production");

  const entry: Entry = {};

  /**
   * https://github.com/facebook/create-react-app/blob/025f2739ceb459c79a281ddc6e60d7fd7322ca24/packages/react-scripts/config/webpack.config.js#L592
   */
  const [
    ,
    InterpolateHtmlPlugin,
    ModuleNotFoundPlugin,
    DefinePlugin,
    MiniCssExtractPlugin,
    ,
    IgnorePlugin,
    ForkTsCheckerWebpackPlugin,
    ESLintWebpackPlugin,
  ] = current.plugins || [];

  const htmls: HtmlWebpackPlugin[] = [];

  apps.forEach((app, index) => {
    const html = path.join(app.output, "index.html").replace(/^build\//i, "");

    const chunk = index.toString();

    entry[chunk] = path.resolve(app.entry);

    htmls.push(createHTML(html, chunk, paths.appHtml));
  });

  const config: Configuration = {
    ...current,
    entry,
    output: {
      ...current.output,
      path: path.resolve("build"),
      publicPath: url,
    },
    plugins: [
      ...htmls,
      InterpolateHtmlPlugin,
      ModuleNotFoundPlugin,
      DefinePlugin,
      MiniCssExtractPlugin,
      IgnorePlugin,
      ForkTsCheckerWebpackPlugin,
      ESLintWebpackPlugin,
    ],
  };
  const rest = require.cache[src.config];

  delete require.cache[src.config];

  require.cache[src.config] = {
    ...rest,
    exports: function () {
      return config;
    },
  };

  return [entry, htmls, config] as const;
}

/**
 * CreateHTML
 * @param app App
 * https://github.com/facebook/create-react-app/blob/025f2739ceb459c79a281ddc6e60d7fd7322ca24/packages/react-scripts/config/webpack.config.js#L592
 */
function createHTML(filename: string, chunk: string, template: string) {
  return new HtmlWebpackPlugin({
    inject: true,
    filename,
    chunks: [chunk],
    template,
    minify: {
      removeComments: true,
      collapseWhitespace: true,
      removeRedundantAttributes: true,
      useShortDoctype: true,
      removeEmptyAttributes: true,
      removeStyleLinkTypeAttributes: true,
      keepClosingSlash: true,
      minifyJS: true,
      minifyCSS: true,
      minifyURLs: true,
    },
  });
}

/**
 * Update paths in cache with input
 * https://nodejs.org/api/modules.html#modules_require_cache
 * @param paths object
 * https://github.com/facebook/create-react-app/blob/6a51dcdfb84d1a47294fcbf9d7d569eaf1b4d571/packages/react-scripts/config/paths.js#L60
 */
function overwritePaths(paths: PathsArg) {
  const current: Paths = require(src.paths);

  const rest = require.cache[src.paths];

  delete require.cache[src.paths];

  require.cache[src.paths] = {
    ...rest,
    exports: {
      ...current,
      ...paths,
    },
  };

  return require(src.paths) as Paths;
}

function readPackage(key = "") {
  const file = path.resolve("package.json");

  const json = fs.readJSONSync(file);

  if (!key) {
    return json;
  }

  return json[key] || {};
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

function findValue(flag: string): string;
function findValue(flag: string, cb: (value: string) => void): void;
function findValue(flag: any, cb?: any) {
  const index = findIndex(flag);

  const value = process.argv[index + 1] || "";

  const isValid = value && !value.includes("--");

  if (cb) {
    if (isValid) cb(value);
    return;
  }

  if (isValid) return value;

  return "";
}

export = null;

/**
 * Types
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

type Env = Configuration["mode"];

type FactoryConfig = (env: Env) => Configuration;
