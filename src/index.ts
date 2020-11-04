import fs from "fs-extra";
import path from "./path";

export function readPublish() {
  if (!fs.existsSync(path.publish)) {
    return {};
  }

  try {
    const config = fs.readJsonSync(path.publish);

    return config;
  } catch (error) {
    console.log("invalid publish.json");
    return {};
  }
}

export function readPackage(key = "") {
  const json = fs.readJSONSync(path.package);

  if (!key) {
    return json;
  }

  return json[key];
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
