const target_url = 'http://127.0.0.1:8081/tests/fixture-data/index.html';
const waitTime = 10000;

module.exports = {
   beforeEach: (browser) => {
     browser.url(target_url)
     .waitForElementVisible('.button-play', waitTime)
     .waitForElementVisible('.canvas-time', waitTime);
   },
   'Clicking play': (browser) => {
     browser
       .getText('.canvas-time', function(result) {
         console.log('.canvas-time: actual (1) = ' + JSON.stringify(result));
       })
       .assert.containsText('.canvas-time', '00:01')
       .assert.attributeContains('.button-play', 'title', 'Play')
       .click('.button-play')
       .waitForElementVisible('.pause')
       .assert.attributeContains('.button-play', 'title', 'Pause')
       .getText('.canvas-time', function(result) {
         console.log('.canvas-time: actual (2) = ' + JSON.stringify(result));
       })
       .assert.not.containsText('.canvas-time', '00:01')
       .end()
   },
   'Clicking play and then pause': (browser) => {
     browser
       .click('.button-play')
       .pause(2000)
       .assert.not.containsText('.canvas-time', '00:01')
       .assert.attributeContains('.button-play', 'title', 'Pause')
       .click('.button-play')
       .assert.attributeContains('.button-play', 'title', 'Play')
       .end()
   },
   'Maximising & minimising the player': (browser) => {
     browser
       .getElementSize('.canvas-container', function (result) {
         this.assert.ok(result.value.height < '500', 'Checking to see if the height of the element is smaller than 500px before clicking fullscreen.');
       })
       .click('.av-icon-fullscreen')
       .getElementSize('.canvas-container', function (result) {
         this.assert.ok(result.value.width > '1000', 'Checking to see if the width of the element is greater than 1000px after clicking fullscreen.');
         this.assert.ok(result.value.height > '500', 'Checking to see if the height of the element is greater than 500px after clicking fullscreen.');
       })
       .waitForElementVisible('.play')
       .click('.av-icon-fullscreen')
       .getElementSize('.canvas-container', function (result) {
         this.assert.ok(result.value.height < '500', 'Checking to see if the height of the element is smaller than 500px after leaving fullscreen.');
       })
       .end()
     },
     /*
     'Subtitles are displayed.': (browser) => {
       browser
         .pause(1000)
         .waitForElementVisible('.av-icon-subtitles')
         .click('.av-icon-subtitles')
         .waitForElementVisible('.subtitlemenu-option')
         .assert.attributeEquals('.subtitlemenu-option', 'data-language', 'pl-PL')
         .assert.containsText('.subtitlemenu-option', 'Polski')
         .click('.subtitlemenu-option')
         .click('.button-play')
         .assert.not.visible('.subtitlemenu-option')
         .end()
     },
     */
  after: (browser) => {
    browser.end();
  }
};
