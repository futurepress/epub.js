var webpack = require("webpack");
var path = require('path');
var PROD = (process.env.NODE_ENV === 'production')
var hostname = "localhost";
var port = "8080";

module.exports = {
	entry: {
		epub: "./src/epub.js",
	},
	devtool: 'source-map',
	output: {
		path: path.resolve("./dist"),
		filename: "[name].js",
		sourceMapFilename: "[name].js.map",
		library: "ePub",
		libraryTarget: "umd"
	},
	externals: {
		"jszip": "JSZip",
		"xmldom": "xmldom"
	},
	plugins: [
		// new webpack.IgnorePlugin(/punycode|IPv6/),
	],
	devServer: {
		host: hostname,
		port: port,
		inline: true
	}
}
