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

import path from "path";
import fs from "fs";
import { BunBuildConfig, BunServeConfig } from "./types";


export async function serve(config: BunServeConfig) {
    const headRewriter = new HTMLRewriter();

    headRewriter.on("head", {
        element(el) {
            console.log("appending");
            el.append(
                `
            <script>
                const reloadSocket = new WebSocket("ws://${config.devServer.host}:${wsPort}");
                reloadSocket.onmessage = () => {location.href = location.href}
            </script>
        `,
                { html: true },
            );
        },
    });

    Bun.serve({
        port: config.devServer.port,
        hostname: config.devServer.host,
        async fetch(req) {
            const url = new URL(req.url);
            if (path.isAbsolute(url.pathname) && config.buildConfig.outdir) {
                try {
                    const localPath = path.join(
                        config.buildConfig.outdir,
                        url.pathname,
                    );
                    if (
                        fs.existsSync(localPath) &&
                        fs.statSync(localPath).isFile()
                    ) {
                        return new Response(
                            Bun.file(
                                path.join(
                                    config.buildConfig.outdir,
                                    url.pathname,
                                ),
                            ),
                        );
                    }
                } catch (e) {
                    console.log(e);
                }
            }
            console.log("serving fallback");
            const index = headRewriter.transform(
                await Bun.file("./public/index.html").text(),
            );
            return new Response(index, {
                headers: {
                    "Content-Type": "text/html",
                },
            });
        },
    });

    const RELOAD_EVENT = "reload";
    const wsPort = 9000;
    const socketServer = Bun.serve({
        port: wsPort,
        fetch(req, server) {
            // upgrade the request to a WebSocket
            if (server.upgrade(req)) {
                return; // do not return a Response
            }
            return new Response("Upgrade failed :(", { status: 500 });
        },
        websocket: {
            message(ws, message) {
                // do nothing
            },
            open(ws) {
                ws.subscribe(RELOAD_EVENT);
            },
            close(ws) {
                ws.unsubscribe(RELOAD_EVENT);
            },
        }, // handlers
    });

    async function build(buildConfig: BunBuildConfig) {
        const start = Date.now();

        // buildConfig.plugins = buildConfig.plugins || [];
        //buildConfig.plugins.push(reloadPlugin);

        const results = await Bun.build(buildConfig);

        console.log(`Build took ${Date.now() - start}ms`);
        console.log("Build artifacts");
        results.outputs.forEach((output) => {
            const stats = fs.statSync(output.path);
            console.log(
                `${path.basename(output.path)} [${output.hash}] ${stats.size}`,
            );
        });
        console.log(results.logs);
        socketServer.publish(RELOAD_EVENT, "reload2");
    }

    fs.watch(config.devServer.watchDir, { recursive: true }).addListener(
        "change",
        () => {
            build(config.buildConfig);
        },
    );

    build(config.buildConfig);
}
