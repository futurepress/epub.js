import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

import pkg from "./package.json";

import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';

const plugins = [
	nodeResolve(),
	commonjs()
];

export default [
	{
		input: pkg.main,
		output: {
			name: 'ePub',
			file: pkg.browser,
			format: 'umd',
			globals: {
				jszip: 'JSZip',
				xmldom: 'xmldom'
			},
			sourcemap: 'inline'
		},
		plugins: plugins.concat([
			serve({
				port: 8080,
				contentBase: './',
				headers: {
					"Access-Control-Allow-Origin": "*",
					"Service-Worker-Allowed": "/",
				}
			}),
			livereload({
				watch: ['dist', 'examples']
			})
		]),
		external: ['jszip', 'xmldom'],
	}
];
