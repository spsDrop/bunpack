import { TLSOptions } from 'bun'

export type BunBuildConfig = Parameters<typeof Bun.build>[0]

export interface BunpackBunBuildConfig extends BunBuildConfig {
    htmlTemplate?: {
        templatePath?: string
        templateOutputPath?: string
        scriptTagArgs?: Record<string, string>
        styleTagArgs?: Record<string, string>
    }
}

export interface BunpackConfig {
    buildConfig: BunpackBunBuildConfig
    devServer: {
        watchDir: string
        port: number
        host?: string
        tls?: TLSOptions
        https: boolean // webpack style auto gen keys
    }
}
