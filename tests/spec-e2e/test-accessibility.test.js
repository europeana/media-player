const target_url = 'http://127.0.0.1:8081/tests/fixture-data/index.html?language=pl';
const waitTime = 10000;
const selBtnFS = '.button-fullscreen';

module.exports = {
  beforeEach: (browser) => {
     browser.url(target_url)
     .waitForElementVisible(selBtnFS, waitTime);
  },
  'Accessibility Check': function (browser) {
    browser
      .initAccessibility()
      .assert.accessibility('.eups-player', {
        verbose: true
      })
      .end()
  }
};
