import yargs from "yargs";
import path from "path";
import {serve} from "../src/serve"

const opts = await yargs(process.argv).option("configPath", {
  alias: "c",
  type: "string",
  description: "Path to config file",
  default: path.join(process.cwd(), "./bunpack.config.ts")
}).parse();

try {
    const config = await import(opts.configPath)
    serve(config);
} catch (e) {
    console.error(e);
    throw new Error("Could not load config file");
}

