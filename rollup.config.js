import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

import license from "rollup-plugin-license";
import pkg from "./package.json";

const plugins = [
	nodeResolve(),
	commonjs(),
	license({
		banner: "@license Epub.js v<%= pkg.version %> | BSD-2-Clause | https://github.com/futurepress/epub.js",
	})
];

export default [
	{
		input: pkg.module,
		output: {
			name: "ePub",
			file: pkg.browser,
			format: "umd"
		},
		plugins: plugins
	},

	{
		input: pkg.module,
		output: {
			name: "ePub",
			file: "./dist/epub.esm.js",
			format: "es"
		},
		plugins: plugins
	}
];
