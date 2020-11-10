import path from "path";
import fs from "fs-extra";

// const files = [
//   "README.md",
//   "src/scripts/prepare/public",
//   "src/scripts/prepare/package.json",
//   "src/scripts/prepare/tsconfig.json",
// ];

const files: File[] = [];

files.push({
  src: "README.md",
  dest: "dist/README.md",
});

files.push({
  src: ".env",
  dest: "dist/scripts/prepare/template/env",
});

files.push({
  src: ".gitignore",
  dest: "dist/scripts/prepare/template/gitignore",
});

files.push({
  src: "package.json",
  dest: "dist/scripts/prepare/package.json",
});

files.push({
  src: "tsconfig.json",
  dest: "dist/scripts/prepare/template/tsconfig.json",
});

files.push({
  src: "tsconfig.dist.json",
  dest: "dist/scripts/prepare/template/tsconfig.dist.json",
});

files.push({
  src: "public",
  dest: "dist/scripts/prepare/template/public",
});

files.forEach((file) => {
  const src = path.resolve(file.src);
  const dest = path.resolve(file.dest);

  fs.copySync(src, dest, { overwrite: true });
});

/**
 * Types
 */
interface File {
  src: string;
  dest: string;
}
