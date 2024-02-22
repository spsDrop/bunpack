/***************************************************************************
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 * Copyright 2024 Adobe
 * All Rights Reserved.
 *
 * NOTICE: All information contained herein is, and remains
 * the property of Adobe and its suppliers, if any. The intellectual
 * and technical concepts contained herein are proprietary to Adobe
 * and its suppliers and are protected by all applicable intellectual
 * property laws, including trade secret and copyright laws.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe.
 ***************************************************************************/

import path from 'path'
import fs from 'fs'
import { BunBuildConfig, BunpackConfig } from './types'
import { createKeys } from './key-gen'
import { htmlTemplate } from './util/htmlTemplate'

async function loadConfig(path: string): Promise<BunpackConfig> {
    const config = (await import(path)).default
    return config
}

export async function serve(configPath: string) {
    const config = await loadConfig(configPath)

    const socketProtocol =
        config.devServer.https || config.devServer.tls ? 'wss' : 'ws'

    const headRewriter = new HTMLRewriter()
    headRewriter.on('head', {
        element(el) {
            el.append(
                `<script>
                function connectToReloadSocket() {
                    const reloadSocket = new WebSocket("${socketProtocol}://${
                    config.devServer.host || 'localhost'
                }:${wsPort}");
                    reloadSocket.onmessage = () => {location.href = location.href};
                    reloadSocket.onclose = function(e) {
                        console.log('Reload Socket is closed. Reconnect will be attempted in 1 second.', e.reason);
                        setTimeout(function() {
                            connectToReloadSocket();
                        }, 5 * 1000);
                    };
                }
                connectToReloadSocket();
            </script>`,
                { html: true }
            )
        },
    })

    Bun.serve({
        port: config.devServer.port,
        hostname: config.devServer.host || 'localhost',
        tls: config.devServer.https ? await createKeys() : config.devServer.tls,
        async fetch(req) {
            const url = new URL(req.url)
            if (path.isAbsolute(url.pathname) && config.buildConfig.outdir) {
                try {
                    const localPath = path.join(
                        config.buildConfig.outdir,
                        url.pathname
                    )
                    if (
                        fs.existsSync(localPath) &&
                        fs.statSync(localPath).isFile()
                    ) {
                        const res = new Response(
                            Bun.file(
                                path.join(
                                    config.buildConfig.outdir,
                                    url.pathname
                                )
                            )
                        )
                        if (
                            url.pathname.match(/\.js$/) && 
                            await Bun.file(path.join(
                                config.buildConfig.outdir,
                                url.pathname+".map",
                            )).exists()
                        ) {
                            res.headers.append("SourceMap", url.pathname+".map")
                        }
                        return res
                    }
                } catch (e) {
                    console.log(e)
                }
            }
            console.log('serving fallback', {path: url.pathname})
            const index = headRewriter.transform(
                await Bun.file(
                    path.join(config.buildConfig.outdir || './', '/index.html')
                ).text()
            )
            return new Response(index, {
                headers: {
                    'Content-Type': 'text/html',
                },
            })
        },
    })

    console.log(
        `Dev server listening on ${
            config.devServer.https ? 'https' : 'http'
        }://${config.devServer.host || 'localhost'}:${config.devServer.port}`
    )

    const RELOAD_EVENT = 'reload'
    const wsPort = 9000
    const socketServer = Bun.serve({
        port: wsPort,
        hostname: config.devServer.host,
        tls: config.devServer.https ? await createKeys() : config.devServer.tls,
        fetch(req, server) {
            // upgrade the request to a WebSocket
            if (server.upgrade(req)) {
                return // do not return a Response
            }
            return new Response('Upgrade failed :(', { status: 500 })
        },
        websocket: {
            message(ws, message) {
                // do nothing
            },
            open(ws) {
                ws.subscribe(RELOAD_EVENT)
            },
            close(ws) {
                ws.unsubscribe(RELOAD_EVENT)
            },
        }, // handlers
    })

    async function build(buildConfig: BunBuildConfig) {
        const start = Date.now()

        const results = await Bun.build(buildConfig)

        console.log(`Build took ${Date.now() - start}ms`)
        console.log('Build artifacts')
        results.outputs.forEach((output) => {
            const stats = fs.statSync(output.path)
            console.log(
                `${path.basename(output.path)} [${output.hash}] ${stats.size}`
            )
        })
        console.log(results.logs)

        if (config.buildConfig.htmlTemplate) {
            htmlTemplate(results, config.buildConfig)
        }

        socketServer.publish(RELOAD_EVENT, 'reload2')
    }

    fs.watch(configPath).addListener('change', async () => {
        const configUpdate = await loadConfig(configPath)
        console.log({ configUpdate })
        config.buildConfig = configUpdate.buildConfig
        build(config.buildConfig)
    })

    fs.watch(config.devServer.watchDir, { recursive: true }).addListener(
        'change',
        () => {
            build(config.buildConfig)
        }
    )

    build(config.buildConfig)
}
