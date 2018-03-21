var webpack = require("webpack");
var path = require('path');
var BabiliPlugin = require("babili-webpack-plugin");
var PROD = (process.env.NODE_ENV === 'production')
var LEGACY = (process.env.LEGACY)
var hostname = "localhost";
var port = 8080;
var enter = LEGACY ? {
		"epub.legacy": ["babel-polyfill", "./src/epub.js"]
	} : {
		"epub": "./src/epub.js",
		"epub.worker": "./src/workers/epub.worker.js"
	};

module.exports = {
	entry: enter,
	devtool: PROD ? false : 'source-map',
	output: {
		path: path.resolve("./dist"),
		filename: PROD ? "[name].min.js" : "[name].js",
		sourceMapFilename: "[name].js.map",
		library: "ePub",
		libraryTarget: "umd",
		globalObject: "typeof self !== \'undefined\' ? self : this",
		publicPath: "/dist/"
	},
	externals: {
		// "jszip": "JSZip",
		// "xmldom": "xmldom"
	},
	plugins: PROD ? [
		// new BabiliPlugin()
	] : [],
	resolve: {
		alias: {
			path: "path-webpack"
		}
	},
	devServer: {
		host: hostname,
		port: port,
		inline: true,
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Service-Worker-Allowed": "/",
		}
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules\/(?!(marks-pane)\/).*/,
				loader: "babel-loader",
				query: LEGACY ? {
					presets: ['es2015'],
					plugins: [
						"add-module-exports",
					]
				} : {
					presets: [["env", {
						"targets": {
							"chrome": 54,
							"safari" : 10,
							"firefox" : 50,
							"edge" : 14
						}
					}]],
					plugins: [
						"add-module-exports",
					]
				}
			}
		]
	}
}
