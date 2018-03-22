import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import alias from "rollup-plugin-alias";
import minify from 'rollup-plugin-babel-minify';

import pkg from './package.json';

const plugins = [
	alias({
		path: 'path-webpack'
	}),
	resolve(),
	commonjs()
];

const pluginsBabel = plugins.concat([
	babel({
		exclude: ['node_modules/**'],
		runtimeHelpers: true
	})
]);

const pluginsMinify = pluginsBabel.concat([
	minify()
]);

export default [
	{
		input: 'src/index.js',
		output: {
			name: 'ePub',
			file: pkg.browser,
			format: 'umd',
			globals: {
				jszip: 'JSZip',
				xmldom: 'xmldom'
			},
			sourcemap: true
		},
		plugins: pluginsBabel,
		external: ['jszip', 'xmldom'],
	},
	{
		input: 'src/workers/epub.worker.js',
		output: {
			name: 'ePubWorker',
			file: pkg.worker,
			format: 'umd',
			sourcemap: true
		},
		plugins: pluginsBabel
	},
	// native, no babel
	{
		input: 'src/index.js',
		output: {
			name: 'ePub',
			file: pkg.browser.replace('.js', '.native.js'),
			format: 'umd',
			globals: {
				jszip: 'JSZip',
				xmldom: 'xmldom'
			},
			sourcemap: true
		},
		plugins: plugins,
		external: ['jszip', 'xmldom'],
	},
	{
		input: 'src/workers/epub.worker.js',
		output: {
			name: 'ePubWorker',
			file: pkg.worker.replace('.js', '.native.js'),
			format: 'umd',
			sourcemap: true
		},
		plugins: plugins
	},
	// minified
	{
		input: 'src/index.js',
		output: {
			name: 'ePub',
			file: pkg.browser.replace('.js', '.min.js'),
			format: 'umd',
			globals: {
				jszip: 'JSZip',
				xmldom: 'xmldom'
			},
			sourcemap: true
		},
		plugins: pluginsMinify,
		external: ['jszip', 'xmldom'],
	},
	{
		input: 'src/workers/epub.worker.js',
		output: {
			name: 'ePubWorker',
			file: pkg.worker.replace('.js', '.min.js'),
			format: 'umd',
			sourcemap: true
		},
		plugins: pluginsMinify
	}
];
