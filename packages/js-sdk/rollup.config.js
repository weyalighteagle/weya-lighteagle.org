import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";
import nodePolyfills from "rollup-plugin-polyfill-node";

export default [
  // 1. Build: NPM (lib/)
  {
    input: "src/index.ts",
    output: [
      {
        file: "lib/index.cjs.js",
        format: "cjs",
      },
      {
        file: "lib/index.esm.js",
        format: "esm",
      },
    ],
    plugins: [
      json(),
      resolve(),
      commonjs(),
      typescript({
        declaration: true,
        declarationDir: "lib",
        rootDir: "src",
      }),
    ],
    external: [
      "livekit-client",
      "webrtc-issue-detector",
      "events",
      "typed-emitter",
    ],
  },

  // 2. Build: Browser (dist/)
  {
    input: "src/index.ts",
    output: [
      {
        file: "dist/index.umd.js",
        format: "umd",
        name: "LiveAvatarSDK",
        sourcemap: true,
      },
      {
        file: "dist/index.esm.js",
        format: "esm",
        sourcemap: true,
      },
    ],
    plugins: [
      json(),
      nodePolyfills(),
      resolve({
        browser: true,
        preferBuiltins: false,
      }),
      commonjs(),
      typescript({
        declaration: false,
        rootDir: "src",
      }),
    ],
  },
];
