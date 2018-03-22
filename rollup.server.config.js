import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import alias from "rollup-plugin-alias";

import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'

import pkg from './package.json';

const plugins = [
	alias({
		path: 'path-webpack'
	}),
	resolve(),
	commonjs(),
	// babel({
	// 	exclude: ['node_modules/**'],
	// 	runtimeHelpers: true
	// })
];


export default [
	{
		input: 'src/index.js',
		output: {
			name: 'ePub',
			file: pkg.browser.replace('.js', '.dev.js'),
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
	},
	{
		input: 'src/workers/epub.worker.js',
		output: {
			name: 'ePubWorker',
			file: pkg.worker.replace('.js', '.dev.js'),
			format: 'umd',
			sourcemap: 'inline'
		},
		plugins: plugins
	}
];
