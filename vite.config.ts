import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "node:path";
import dts from "vite-plugin-dts";

export default defineConfig(({ command }) => {
  const isDev = command !== "build";
  return {
    plugins: [
      react(),
      dts({
        outDir: path.resolve(__dirname, "dist"),
        include: ["packages/**/*.ts", "packages/**/*.tsx"],
        insertTypesEntry: true,
        rollupTypes: true,
      }),
    ],
    root: isDev ? path.resolve(__dirname, "example") : undefined,
    server: {
      port: 3000,
      proxy: {
        "/lxwork/api": {
          // target: "http://172.16.190.144:8888/",
          target: "https://sso-dev.qdlxjt.cn",
          changeOrigin: true,
        },
        "/sso": {
          // target: "http://172.16.190.144:8888/",
          target: "https://sso-dev.qdlxjt.cn",
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: path.resolve(__dirname, "dist"),
      lib: {
        entry: path.resolve(__dirname, "packages/index.ts"),
        name: "ui",
        formats: ["es", "umd", "cjs", "iife"],
        fileName: (format: string) => `ui.${format}.js`,
      },
      rollupOptions: {
        external: ["react", "react-dom"],
        output: {
          globals: {
            react: "React",
            "react-dom": "ReactDOM",
          },
        },
      },
    },
  };
});
