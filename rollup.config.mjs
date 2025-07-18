import typescript from "rollup-plugin-typescript2";
import resolve from "@rollup/plugin-node-resolve";

export default {
  input: "main.ts",
  output: {
    dir: ".",
    format: "cjs"
  },
  external: ["obsidian"],
  plugins: [resolve(), typescript()]
};
