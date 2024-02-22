#!/usr/bin/env bun

import yargs from 'yargs'
import path from 'path'
import type { BunpackConfig } from '../src'
import { htmlTemplate } from '../src/util/htmlTemplate'

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
    const results = await Bun.build(config.buildConfig)

    if (config.buildConfig.htmlTemplate) {
        htmlTemplate(results, config.buildConfig)
    }
} catch (e) {
    console.error(e)
    throw new Error('Could not load config file')
}
