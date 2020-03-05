const files = function() {
  let files = [
      { pattern: 'spec/*.js', watched: true, served: true, type: 'module', included: true },
      'https://code.jquery.com/jquery-3.4.1.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js'
  ];

  return files;
};

const client = function() {
  let client = {
    captureConsole: false,
    clearContext: false,
    jasmine: {
      random: false
    }
  };

  return client;
};

const customLaunchers = function() {
  let customLaunchers = {
    chromeTravisCi: {
      base: 'Chrome',
      flags: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-software-rasterizer']
    }
  };

  return customLaunchers;
};

const webpack = function() {
  let webpack = {
    module: {
      rules: 
        rules()
    }
  };

  return webpack;
};

const rules = function() {
  let rules =
    [
      jsRule(), cssRule()
    ];

  return rules;
};

const jsRule = function() {
  let jsRule = {
    test: /\.js$/i,
    exclude: /(node_modules)/,
    loader: 'babel-loader',
    options: {
      presets: ["babel-preset-es2015"].map(require.resolve)
    }
  };

  return jsRule;
};

const cssRule = function() {
  let cssRule = {
    test: /\.[s]?css$/,
    use: [
      'style-loader', {
        loader: 'css-loader',
        options: {
          sourceMap: true,
        }
      }
    ]
  };

  return cssRule;
};

const webpackMiddleware = function() {
  let webpackMiddleware = {
    //turn off webpack bash output when run the tests
    noInfo: true,
    stats: 'errors-only'
  };

  return webpackMiddleware;
}

const configuration = {
  basePath: '',
  exclude: [],
  files: files(),
  autoWatch: true,
  singleRun: true,
  failOnEmptyTestSuite: false,
  frameworks: ['jasmine'],
  browsers: ['Chrome' /*,'PhantomJS','Firefox','Edge','ChromeCanary','Opera','IE','Safari'*/],
  reporters: ['mocha', 'kjhtml'/*,'dots','progress','spec'*/],

  //address that the server will listen on, '0.0.0.0' is default
  listenAddress: '0.0.0.0',
  //hostname to be used when capturing browsers, 'localhost' is default
  hostname: 'localhost',
  //the port where the web server will be listening, 9876 is default
  port: 9876,
  //when a browser crashes, karma will try to relaunch, 2 is default
  retryLimit: 0,
  //how long does Karma wait for a browser to reconnect, 2000 is default
  browserDisconnectTimeout: 5000,
  //how long will Karma wait for a message from a browser before disconnecting from it, 10000 is default
  browserNoActivityTimeout: 10000,
  //timeout for capturing a browser, 60000 is default
  captureTimeout: 60000,

  client: client(),

  /* karma-webpack config
    pass your webpack configuration for karma
    add `babel-loader` to the webpack configuration to make
    the ES6+ code in the test files readable to the browser
    eg. import, export keywords */
  webpack: webpack(),

  preprocessors: {
    //add webpack as preprocessor to support require() in test-suits .js files
    './spec/*.js': ['webpack']
  },
  webpackMiddleware: webpackMiddleware(),

  /*karma-mocha-reporter config*/
  mochaReporter: {
    output: 'noFailures'  //full, autowatch, minimal
  },

  customLaunchers: customLaunchers()
};

if (process.env.TRAVIS) {
  configuration.browsers = ['chromeTravisCi'];
}

module.exports = function(config) {
  config.set(configuration);
};