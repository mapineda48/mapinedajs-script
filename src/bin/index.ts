#!/usr/bin/env node
import { existsInLine } from "..";

const react = existsInLine("--react-scripts");

const publish = existsInLine("--pack") || existsInLine("--publish");

const init = existsInLine("--init");

if (react) {
  require("./react-scripts");
} else if (publish) {
  require("./publish");
} else if (init) {
  require("./init");
}

export default null;
