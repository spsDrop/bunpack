#!/usr/bin/env bun

import yargs from 'yargs'
import path from 'path'
import type { BunpackConfig } from '../src'
import { bunBuild, esbuildBuild } from '../src/builds'

const opts = await yargs(process.argv)
    .option('configPath', {
        alias: 'c',
        type: 'string',
        description: 'Path to config file',
        default: './bunpack.config.ts',
    })
    .parse()
    
process.chdir(path.dirname(path.resolve(opts.configPath)))
        
try {
    const config = (
        await import(
            path.resolve(path.basename(opts.configPath))
        )
    ).default as BunpackConfig

    if (config.bunBundleConfig !== undefined) {
        await bunBuild(config.bunBundleConfig);
    }

    if (config.esbuildBundleConfig) {
        await esbuildBuild(config.esbuildBundleConfig);
    }

} catch (e) {
    console.error(e)
    throw new Error('Could not load config file')
}
