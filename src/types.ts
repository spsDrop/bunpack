import { TLSOptions } from 'bun'
import { BuildOptions } from "esbuild"

export type BunBuildConfig = Parameters<typeof Bun.build>[0]

export interface BunpackBundleOptions {
    // Right now bun doesn't create correct trailing sourcemap url comments
    // Turning this on will enable a patching of all files with sourcemaps
    // The serve sets the SourceMap header as well but not all browser support it
    patchSourceMaps?: boolean
    // Behaves like the html template plugin for webpack works for both serve and build
    htmlTemplate?: {
        templatePath?: string
        templateOutputPath?: string
        scriptTagArgs?: Record<string, string>
        styleTagArgs?: Record<string, string>
    }
}

export type BunpackBunBuildConfig = BunBuildConfig & BunpackBundleOptions
export type BunpackEsbuildBuildConfig = BuildOptions & BunpackBundleOptions

export interface BunpackConfig {
    bunBundleConfig?: BunpackBunBuildConfig
    esbuildBundleConfig?: BunpackEsbuildBuildConfig
    devServer: {
        watchDir: string
        port: number
        host?: string
        tls?: TLSOptions
        https: boolean // webpack style auto gen keys
    }
}
