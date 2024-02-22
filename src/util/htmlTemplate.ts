import { BuildOutput } from "bun";
import { BunpackBunBuildConfig } from "../types";
import path from "path";

function argsToString(opts: Record<string, string> = {}) {
  return Object.keys(opts)
    .map((key) => `${key}="${opts[key]}"`)
    .join(" ");
}

function absoluteToRelative(absolutePath: string, config: BunpackBunBuildConfig) {
    const root = path.join(process.cwd(), config.outdir || "./");
    return absolutePath.replace(root, "");
}

export async function htmlTemplate(
  build: BuildOutput,
  config: BunpackBunBuildConfig
) {
  const rewriter = new HTMLRewriter();
  rewriter.on("head", {
    element: (el) => {
      build.outputs
        .filter((output) => output.path.match(/js$/))
        .forEach((output) => {
          el.append(
            `<script src="${absoluteToRelative(output.path, config) }" ${argsToString(
              config.htmlTemplate?.scriptTagArgs
            )}></script>`,
            {html: true}
          );
        });
      build.outputs
        .filter((output) => output.path.match(/css$/))
        .forEach((output) => {
          el.append(
            `<link rel="stylesheet" href="${output.path}" ${argsToString(
              config.htmlTemplate?.styleTagArgs
            )}>`,
            {html: true}
          );
        });
    },
  });

  const transformedTemplate = rewriter.transform(
    await Bun.file(
      path.join(config.htmlTemplate?.templatePath || "./index.html")
    ).text()
  );

  Bun.write(
    path.join(
      config.outdir || "./",
      config.htmlTemplate?.templateOutputPath || "./index.html"
    ),
    transformedTemplate
  );
}
