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
	};

module.exports = {
	mode: process.env.NODE_ENV,
	entry: enter,
	devtool: PROD ? false : 'source-map',
	output: {
		path: path.resolve("./dist"),
		// path: "./dist",
		filename: PROD ? "[name].min.js" : "[name].js",
		sourceMapFilename: "[name].js.map",
		library: "ePub",
		libraryTarget: "umd",
		libraryExport: "default",
		publicPath: "/dist/"
	},
	externals: {
		"jszip": "jszip",
		"xmldom": "xmldom"
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
		inline: true
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules\/(?!(marks-pane)\/).*/,
				loader: "babel-loader",
				query: LEGACY ? {
					presets: ['@babel/preset-env'],
					plugins: [
						"babel-plugin-add-module-exports"
					]
				} : {
					presets: [["@babel/preset-env", {
						"targets": {
							"chrome": 54,
							"safari" : 10,
							"firefox" : 50,
							"edge" : 14
						}
					}]],
					plugins: [
						"babel-plugin-add-module-exports"
					]
				}
			}
		]
	}
}
