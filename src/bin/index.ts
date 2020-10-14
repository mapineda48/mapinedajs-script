#!/usr/bin/env node
const { argv } = process;

const includes = (value: string) => argv.includes(value);

const react = includes("--react-scripts");

const publish = includes("--pack") || includes("--publish");

const init = includes("--init");

if (react) {
  require("./react-scripts");
} else if (publish) {
  require("./publish");
} else if (init) {
  require("./init");
}

export default null;
