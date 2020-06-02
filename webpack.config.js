var webpack = require("webpack");
var path = require("path");
var PROD = (process.env.NODE_ENV === "production")
var LEGACY = (process.env.LEGACY)
var MINIMIZE = (process.env.MINIMIZE === "true")
var hostname = "localhost";
var port = 8080;

var filename = "[name].js";
var sourceMapFilename = "[name].js.map";
if (MINIMIZE) {
	filename = "[name].min.js";
	sourceMapFilename = "[name].min.js.map";
}
if (LEGACY) {
	filename = "[name].legacy.js";
	sourceMapFilename = "[name].legacy.js.map";
}
module.exports = {
	mode: process.env.NODE_ENV,
	entry: {
		"epub": "./src/epub.js",
	},
	devtool: PROD ? false : 'source-map',
	output: {
		path: path.resolve("./dist"),
		filename: filename,
		sourceMapFilename: sourceMapFilename,
		library: "ePub",
		libraryTarget: "umd",
		libraryExport: "default",
		publicPath: "/dist/"
	},
	optimization: {
		minimize: MINIMIZE
	},
	externals: {
		"jszip": "jszip",
		"xmldom": "xmldom"
	},
	plugins: [],
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
				exclude: /node_modules/,
				loader: "babel-loader",
				query: {
					presets: [["@babel/preset-env", {
						targets: LEGACY ? "defaults" : "> 0.5% and last 2 versions and not dead and not ie <=11"
					}]],
					plugins: [["@babel/plugin-transform-runtime", {
						corejs: 3,
						useESModules: true,
						bugfixes: true,
						modules: false
					}]],
				}
			}
		]
	},
	performance: {
		hints: false
	}
}
