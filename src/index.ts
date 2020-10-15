import fs from "fs-extra";
import path from "./path";

export function readConfig(key?: string) {
  if (!fs.existsSync(path.config)) {
    return {};
  }

  try {
    const config = fs.readJsonSync(path.config);

    if (!key) {
      return config;
    }

    return config[key];
  } catch (error) {
    console.log("invalid mapineda.json");
    return {};
  }
}

export function readPackage() {
  return fs.readJSONSync(path.package);
}

export function existsInLine(value: string | string[]) {
  if (!Array.isArray(value)) {
    return process.argv.includes(value);
  }

  const results = value.map((v) => process.argv.includes(v));

  /**
   * its like a operator logic or
   */
  return results.includes(true);
}

export function findIndex(value: string) {
  return process.argv.findIndex((v) => v === value);
}

export function findValue(flag: string) {
  const index = findIndex(flag);

  return process.argv[index + 1];
}
