import fs from "fs-extra";
import path from "../path";

if (fs.existsSync(path.config)) {
  console.log("found mapineda.json");
  process.exit();
}

const config = {
  "react-scripts": {},
  publish: {
    package: {},
    files: [],
    trashs: [],
  },
};

fs.outputJSONSync(path.config, config, { spaces: 2 });
console.log("init mapineda.json");
console.log("see: https://github.com/mapineda48/mapinedajs#configurations");
