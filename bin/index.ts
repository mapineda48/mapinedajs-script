#!/usr/bin/env node

import path from "path";
import fs from "fs-extra";
import { execSync } from "child_process";
import { Command } from "commander";
import ManifestPlugin from "webpack-manifest-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import { version, description } from "../package.json";

import type { Configuration, Entry, Plugin } from "webpack";

/**
 * parse argv options
 */

const program = new Command();

program.version(version);

program
  .description(description)
  .option("-B, --build [path]", "react-scripts build")
  .option("-S, --start [path]", "react-scripts start")
  .option("-O, --output <path>", "output directory build")
  .option("-U, --url <path>", "the view of the Javascript / HTML page")
  .option("-C, --clean-build", "clean build path")
  .option("-E, --exp-build", "experimental build entrys");

program.parse();

const options: Options = program.opts() as any;

/**
 * Internals
 */
const internal = {
  BUILDENTRYS: "__BUILD_ENTRYS__",
};

/**
 * Get config
 */
const config: any = readPackage("react-scripts");

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
(process as any).env.NODE_ENV = process.env.NODE_ENV || "production";
require(src.env);

if (options.start) {
  const start = parseStart(options);

  overwritePaths(start);

  require(src.start);
} else if (options.build) {
  const build = parseBuild(options);

  if (!Array.isArray(build)) {
    overwritePaths(build);
  } else {
    const [apps, url] = build;

    /**
     * prevent process exit missing file
     * https://github.com/facebook/create-react-app/blob/025f2739ceb459c79a281ddc6e60d7fd7322ca24/packages/react-scripts/scripts/build.js#L59
     */
    const [app] = apps;
    overwritePaths({ appIndexJs: app.entry });

    overwriteConfig(apps, url);
  }

  require(src.build);
} else if (options.cleanBuild) {
  removeUnunsed();
} else if (options.expBuild) {
  try {
    parseBuild({ ...options, build: internal.BUILDENTRYS });
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }

  const build = ["mapineda", "-B", internal.BUILDENTRYS];

  if (options.url) {
    build.push("-U", options.url);
  }

  const commands = [build.join(" "), `mapineda -C`];

  commands.forEach((command) => {
    execSync(command, { stdio: "inherit" });
  });
}

/**
 * Lib
 */
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
 * overwrite react-scripts's webpack config
 * https://github.com/facebook/create-react-app/blob/025f2739ceb459c79a281ddc6e60d7fd7322ca24/packages/react-scripts/config/webpack.config.js#L74
 */
function overwriteConfig(apps: App[], url: string) {
  const paths: Paths = require(src.paths);

  const factory: FactoryConfig = require(src.config);

  const current = factory("production");

  const entry: Entry = {};

  const plugins = extractPlugins(current.plugins);

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
    plugins: [...htmls, ...plugins],
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
 * https://github.com/facebook/create-react-app/blob/025f2739ceb459c79a281ddc6e60d7fd7322ca24/packages/react-scripts/config/webpack.config.js#L592
 */
function extractPlugins(plugins: Plugin[] = []) {
  return plugins.filter(
    (plugin) =>
      !(plugin instanceof HtmlWebpackPlugin) &&
      !(plugin instanceof ManifestPlugin)
  );
}

/**
 * Parse Build
 */
function parseBuild(opt: Options) {
  const { build, url = "", output } = opt;

  const paths: PathsArg = {};

  if (!isString(build)) {
    if (config?.default && config[config.default]) {
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

  if (build === internal.BUILDENTRYS) {
    delete config.default;

    const entrys = Object.entries(config as Config).map(([app, config]) => {
      if (!config.entry) {
        throw new Error(`app "${app}" missing entry`);
      }

      if (!config.output) {
        throw new Error(`app "${app}" missing output`);
      }

      return config;
    });

    return [entrys, url] as [App[], string];
  }

  const isApp = build !== "default" && config[build];

  if (isApp) {
    const app = config[build];

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
    paths.appIndexJs = path.resolve(build);
  }

  if (output) {
    paths.appBuild = path.resolve(output);
  }

  if (url) {
    paths.publicUrlOrPath = url;
  }

  return paths;
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

/**
 * parse start paths
 * @param opt Options
 */
function parseStart(opt: Options) {
  const paths: PathsArg = {};

  if (!isString(opt.start)) {
    if (config?.default && config[config.default]) {
      const app = config[config.default];

      if (app?.entry) {
        paths.appIndexJs = path.resolve(app.entry);
      }
    }

    return paths;
  }

  const target = opt.start;

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

function isString(val: any): val is string {
  return typeof val === "string";
}

/**
 * read config from root project package.json
 */
function readPackage(key = "") {
  const file = path.resolve("package.json");

  const json = fs.readJSONSync(file);

  if (!key) {
    return json;
  }

  return json[key] || {};
}

export = null;

/**
 * Types
 */
type Env = Configuration["mode"];

type FactoryConfig = (env: Env) => Configuration;

interface Config {
  [K: string]: App;
}

interface App {
  entry: string;
  url: string;
  output: string;
}

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

interface Options {
  start?: true | string;
  build?: true | string;
  output?: string;
  url?: string;
  cleanBuild?: boolean;
  expBuild?: boolean;
}
