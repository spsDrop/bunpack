import { BuildOptions, build as esbuild, context } from 'esbuild'
import path from 'path'
import { BunpackBunBuildConfig, BunpackEsbuildBuildConfig } from './types'
import { absoluteToRelative, htmlTemplate } from './util/htmlTemplate'
import { patchSourceMaps } from './util/patchSourceMaps'
import * as fs from 'fs'

const DEFAULT_OUT_DIR = './public'

export async function esbuildBuild(buildConfig: BunpackEsbuildBuildConfig) {
    const start = Date.now()

    const options = {
        ...buildConfig,
        metafile: true,
        bundle: true,
        absWorkingDir: process.cwd(),
    }
    delete options.htmlTemplate
    delete options.patchSourceMaps

    const results = await esbuild(options as BuildOptions)

    if (results.metafile) {
        console.log("use https://bundle-buddy.com/esbuild to analyze ./metafile.json");
        await fs.writeFile(
            './metafile.json',
            JSON.stringify(results.metafile),
            () => {}
        )
    }

    console.log(`Build took ${Date.now() - start}ms`)
    console.log('Build artifacts')
    Object.keys(results.metafile?.outputs || []).forEach((path) => {
        console.log(`${path} ${results.metafile?.outputs[path].bytes}`)
    })
    if (results.errors) {
        console.error(results.errors)
    }

    if (buildConfig.htmlTemplate && results.metafile) {
        const outdir = buildConfig?.outdir || DEFAULT_OUT_DIR
        const outputs: string[] = []
        Object.entries(results.metafile.outputs)
            .filter(([key, value]) => {
                return (
                    !!value.entryPoint &&
                    !value.entryPoint.match(/node_modules/)
                )
            })
            .forEach(([key, value]) => {
                outputs.push(
                    absoluteToRelative(path.join(process.cwd(), key), outdir)
                )
                if (value.cssBundle) {
                    outputs.push(
                        absoluteToRelative(
                            path.join(process.cwd(), value.cssBundle),
                            outdir
                        )
                    )
                }
            })
        htmlTemplate(outputs, buildConfig.htmlTemplate, outdir)
    }
}

export async function bunBuild(buildConfig: BunpackBunBuildConfig) {
    const start = Date.now()

    const results = await Bun.build(buildConfig)

    if (buildConfig.patchSourceMaps) {
        await patchSourceMaps(results)
    }

    console.log(`Build took ${Date.now() - start}ms`)
    console.log('Build artifacts')
    results.outputs.forEach((output) => {
        const stats = fs.statSync(output.path)
        console.log(
            `${path.basename(output.path)} [${output.hash}] ${stats.size}`
        )
    })
    console.log(results.logs)

    if (buildConfig.htmlTemplate) {
        const outdir = buildConfig?.outdir || DEFAULT_OUT_DIR
        const outputs = results.outputs.map((output) =>
            absoluteToRelative(output.path, outdir)
        )
        htmlTemplate(outputs, buildConfig.htmlTemplate, outdir)
    }
}
