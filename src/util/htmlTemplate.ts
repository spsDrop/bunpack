import { BuildOutput } from "bun";
import { BunpackBunBuildConfig, BunpackBundleOptions } from "../types";
import path from "path";
import { BuildResult } from "esbuild";

function argsToString(opts: Record<string, string> = {}) {
  return Object.keys(opts)
    .map((key) => `${key}="${opts[key]}"`)
    .join(" ");
}

export function absoluteToRelative(absolutePath: string, outdir: string) {
    const root = path.join(process.cwd(), outdir || "./");
    return absolutePath.replace(root, "");
}

export async function htmlTemplate(
  outputs: string[],
  templateConfig: NonNullable<BunpackBundleOptions["htmlTemplate"]>,
  outdir: string,
) {
  const rewriter = new HTMLRewriter();
  rewriter.on("head", {
    element: (el) => {
      outputs
        .filter((output) => output.match(/js$/))
        .forEach((output) => {
          el.append(
            `<script src="${output }" ${argsToString(
              templateConfig.scriptTagArgs
            )}></script>`,
            {html: true}
          );
        });
      outputs
        .filter((output) => output.match(/css$/))
        .forEach((output) => {
          el.append(
            `<link rel="stylesheet" href="${output}" ${argsToString(
              templateConfig.styleTagArgs
            )}>`,
            {html: true}
          );
        });
    },
  });

  const transformedTemplate = rewriter.transform(
    await Bun.file(
      path.join(templateConfig.templatePath || "./index.html")
    ).text()
  );

  Bun.write(
    path.join(
      outdir || "./",
      templateConfig.templateOutputPath || "./index.html"
    ),
    transformedTemplate
  );
}
