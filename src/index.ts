import fs from "fs-extra";
import path from "./path";

export function readConfig() {
  if (!fs.existsSync(path.config)) {
    console.log("missing mapineda.json");
    process.exit(1);
  }

  try {
    return fs.readJsonSync(path.config);
  } catch (error) {
    console.log("invalid mapineda.json");
    console.log(error);
    process.exit(1);
  }
}

export function readPackage() {
  return fs.readJSONSync(path.package);
}

export function existsInLine(value: string) {
  return process.argv.includes(value);
}

export function findIndex(value: string) {
  return process.argv.findIndex((v) => v === value);
}

export function findValue(flag: string) {
  const index = findIndex(flag);

  return process.argv[index + 1];
}