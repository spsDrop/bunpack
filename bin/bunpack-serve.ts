#!/usr/bin/env bun

import yargs from 'yargs'
import path from 'path'
import { serve } from '../src/serve'

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
    serve(path.resolve(path.basename(opts.configPath)))
} catch (e) {
    console.error(e)
    throw new Error('Could not load config file')
}
