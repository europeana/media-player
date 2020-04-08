const target_url = 'http://127.0.0.1:8081/tests/fixture-data/index.html';
const waitTime = 10000;
const outerHeight = 512;
const outerWidth = 1248;
const selBtnFS = '.button-fullscreen';
const selCanvas = '.canvas-container';

module.exports = {
  tags: ['skip-chrome-headless'],
  beforeEach: (browser) => {
     browser.url(target_url)
     .waitForElementVisible(selCanvas, waitTime)
     .resizeWindow(outerWidth, outerHeight)

     .getElementSize(selCanvas, function (result) {
       console.log(JSON.stringify(result.value.height))
     })
     .getElementSize('body', function (result) {
       console.log(JSON.stringify(result.value.height))
     })
  },
  'Should fill available width on fullscreen': (browser) => {
    browser
      .getElementSize(selCanvas, function (result) {
        this.assert.ok(result.value.width < outerWidth, `Check width (${result.value.width}) < ${outerWidth} before clicking fullscreen.`);
      })
      .click(selBtnFS)
      .getElementSize(selCanvas, function (result) {
        this.assert.ok(result.value.width > outerWidth, `Check width (${result.value.width}) > ${outerWidth} after clicking fullscreen.`);
      })
      .click(selBtnFS)
      .getElementSize(selCanvas, function (result) {
        this.assert.ok(result.value.width < outerWidth, `Check width (${result.value.width}) < ${outerWidth} after clicking fullscreen twice.`);
      })
      .end()
  },
  'Should fill available height on fullscreent': (browser) => {
    browser
      .getElementSize(selCanvas, function (result) {
        this.assert.ok(result.value.height < outerHeight, `Check height (${result.value.height}) < ${outerHeight} before clicking fullscreen.`);
      })
      .click(selBtnFS)
      .getElementSize(selCanvas, function (result) {
        this.assert.ok(result.value.height > outerHeight, `Check height (${result.value.height}) > ${outerHeight} after clicking fullscreen.`);
      })
      .click(selBtnFS)
      .getElementSize(selCanvas, function (result) {
        this.assert.ok(result.value.height < outerHeight, `Check height (${result.value.height}) < ${outerHeight} after clicking fullscreen twice.`);
      })
      .end()
  },
};
