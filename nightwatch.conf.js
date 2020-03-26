const chromedriver = require('chromedriver');
module.exports = {
  src_folders: ['spec-e2e'],
  output_folder: 'reports',
  custom_commands_path: '',
  custom_assertions_path: '',
  page_objects_path: '',
  globals_path: 'nightwatch-globals.js',
  selenium: {
    start_process: false
  },
  test_settings: {
    silent: false,
    default: {
      selenium_port: 9515,
      selenium_host: 'localhost',
      default_path_prefix : '',
      desiredCapabilities: {
        browserName: 'chrome',

        chromeOptions : {
          args: [
            '--no-sandbox',
            'start-fullscreen',
            'window-size=1280,800'
          ]
        },
        acceptSslCerts: true
      }
    }
  }
};
