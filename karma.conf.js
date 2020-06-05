let webpackConfig = require("./webpack.config.js");
webpackConfig.mode = "development";
webpackConfig.externals = {};
webpackConfig.module.rules.push({
  test: /\.xhtml$/i,
  use: 'raw-loader',
});

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha'],


    // list of files / patterns to load in the browser
    files: [

      {pattern: 'src/*.js', watched: true, included: false, served: false},

      {pattern: 'test/*.js', watched: false},

      {pattern: 'test/fixtures/**/*', watched: false, included: false, served: true},

      // {pattern: 'node_modules/jszip/dist/jszip.js', watched: false, included: true, served: true},

      // {pattern: 'node_modules/es6-promise/dist/es6-promise.auto.js', watched: false, included: true, served: true},

      // {pattern: 'libs/url/url-polyfill.js', watched: false, included: true, served: true}

    ],

    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      // add webpack as preprocessor
      'test/*.js': ['webpack', 'sourcemap'],
      // 'test/**/*.js': ['webpack', 'sourcemap']
    },

    webpack: webpackConfig, 
    
    // {
    //   mode: "development",
    //   externals: {
    //     "jszip": "JSZip"
    //     // "xmldom": "xmldom"
    //   },
    //   devtool: 'inline-source-map',
    //   resolve: {
    //     alias: {
    //       path: "path-webpack"
    //     }
    //   },
    //   module: {
    //     rules: [
    //       {
    //         test: /\.js$/,
    //         exclude: /node_modules/,
    //         loader: "babel-loader",
    //         query: {
    //           presets: [["@babel/preset-env", {
    //             targets: "defaults",
    //           }]],
    //         }
    //       },
    //       {
    //         test: /\.xhtml$/i,
    //         use: 'raw-loader',
    //       }
    //     ]
    //   }
    // },

    webpackMiddleware: {
      stats: 'errors-only'
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['mocha'],

    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['ChromeHeadless', 'ChromeHeadlessNoSandbox'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity,

    proxies: {
      "/fixtures/": "/base/test/fixtures/"
    },

    client: {
      config: {
        browserConsoleLogOptions: true
      },
      captureConsole: true,
      mocha: {
        reporter: 'html'
        // bail: true
      }
    },

    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox']
      }
    }

  })
}
