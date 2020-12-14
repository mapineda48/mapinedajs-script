import path from "path";
import fs from "fs-extra";

const files: File[] = [];

files.push({
  src: "README.md",
  dest: "dist/README.md",
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
