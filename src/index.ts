import type { AstroIntegration } from "astro";

import path from "path";
import url from "url";

const PKG_NAME = "astro-meta-tags";

const createPlugin = (): AstroIntegration => {
  return {
    name: PKG_NAME,

    hooks: {
      "astro:config:setup": async ({ command, addDevToolbarApp, logger }) => {
        if (command === "dev") {
          logger.info("[astro-meta-tags] Setting up");

          const importPath = path.dirname(url.fileURLToPath(import.meta.url));
          const pluginPath = path.join(importPath, "toolbar.ts");

          addDevToolbarApp(pluginPath);
        }
      },
    },
  };
};

export default createPlugin;
