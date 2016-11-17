var webpack = require("webpack");
var path = require('path');
var PROD = (process.env.NODE_ENV === 'production')
var hostname = "localhost";
var port = "8080";

module.exports = {
	entry: {
		epub: "./src/epub.js",
		polyfills: ["./node_modules/es6-promise/dist/es6-promise.auto.js", "./libs/url/url.js"]
	},
	devtool: 'source-map',
	output: {
		path: path.resolve("./dist"),
		// path: "./dist",
		filename: "[name].js",
		sourceMapFilename: "[name].js.map",
		library: "ePub",
		libraryTarget: "umd",
		publicPath: "/dist/"
	},
	externals: {
		"jszip": "JSZip",
		"xmldom": "xmldom"
	},
	plugins: [
		// new webpack.IgnorePlugin(/punycode|IPv6/),
	],
	resolve: {
		alias: {
			path: "path-webpack"
		}
	},
	devServer: {
		host: hostname,
		port: port,
		inline: true
	}
}
