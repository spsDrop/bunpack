#!/usr/bin/env bun
import yargs from "yargs";
import path from "path";
import { serve } from "../src/serve";
import type { BunpackConfig } from "../src";

const opts = await yargs(process.argv)
  .option("configPath", {
    alias: "c",
    type: "string",
    description: "Path to config file",
    default: "./bunpack.config.ts",
  })
  .parse();

try {
  const config = (
    await import(
      path.join(import.meta.dirname || process.cwd(), opts.configPath)
    )
  ).default as BunpackConfig;
  await Bun.build(config.buildConfig);
} catch (e) {
  console.error(e);
  throw new Error("Could not load config file");
}
