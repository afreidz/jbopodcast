import path from "path";

if (!process.env.HOME || process.env.USERPROFILE) {
  throw new Error("unable to load config file");
}

const CONFIG_FILE = path.resolve(
  (process.env.HOME || process.env.USERPROFILE)!,
  ".config",
  ".relaycastrc"
);

console.log("CONFIG AT:", CONFIG_FILE);

export default CONFIG_FILE;
