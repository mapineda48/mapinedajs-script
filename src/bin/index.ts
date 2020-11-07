#!/usr/bin/env node
import { existsInLine } from "..";

if (existsInLine("prepare")) {
  require("../scripts/prepare");
}

if (existsInLine(["publish", "pack"])) {
  require("../scripts/publish");
}

if (existsInLine(["start", "build"])) {
  require("../scripts/react-scripts");
}
