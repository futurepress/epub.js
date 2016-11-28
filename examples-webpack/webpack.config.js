var webpack = require('webpack')
var path = require('path')

module.exports = {
  devtool: 'source-map',
  devServer: { inline: true },
  entry: {
    main: [
      './app/index.js',
      'webpack-dev-server/client?http://0.0.0.0:3001',
      'webpack/hot/only-dev-server'
    ]
  },
  output: {
    filename: 'bundle.js'
  },
  resolve: {
    alias: {
      'path': 'path-webpack'
    },
    extensions: ['', '.js', '.css']
  },
  resolveLoader: {
    fallback: [path.join(__dirname, 'node_modules')]
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        loader: 'babel-loader'
      },
      {
        test: /\.css$/,
        loader: 'style!css'
      },
      {
        test: /\.gif$/,
        loader: 'file'
      }
    ]
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.NoErrorsPlugin()
  ]
}
