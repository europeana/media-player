const target_url = 'http://127.0.0.1:8081/tests/fixture-data/index.html';
const waitTime = 10000;
const selTime = '.canvas-time';
const selPlay = '.button-play';

module.exports = {
   beforeEach: (browser) => {
     browser.url(target_url)
     .waitForElementVisible(selPlay, waitTime)
     .waitForElementVisible(selTime, waitTime);
   },
   'Clicking play': (browser) => {
     const extraWaitTime = 2000;
     browser
       .getText(selTime, function(result) {
         let initialValue = parseInt(result.value.split(':').pop());
         console.log(`${selTime} actual value = ${initialValue}`);
          browser.assert.ok(initialValue < 2);
      })
       .assert.attributeContains(selPlay, 'title', 'Play')
       .click(selPlay)
       .waitForElementVisible('.pause')
       .pause(extraWaitTime)
       .assert.attributeContains(selPlay, 'title', 'Pause')
       .getText(selTime, function(result) {
         let updatedValue = parseInt(result.value.split(':').pop());
         console.log(`${selTime} actual value = ${updatedValue}`);
          browser.assert.ok(updatedValue > 2);
        })
       .end()
   },
   'Clicking play and then pause': (browser) => {
     browser
       .click(selPlay)
       .assert.attributeContains(selPlay, 'title', 'Pause')
       .click(selPlay)
       .assert.attributeContains(selPlay, 'title', 'Play')
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
     'Subtitles are displayed.': (browser) => {
       const extraWaitTime = 1000;
       const selBtn = '.btn[data-name=Subtitles]';
       const selMenu = '.subtitlemenu-option';
       browser
         .waitForElementVisible(selBtn, waitTime)
         .assert.not.visible(selMenu)
         .pause(extraWaitTime)
         .click(selBtn)
         .waitForElementVisible(selMenu, waitTime)
         .assert.attributeEquals(selMenu, 'data-language', 'pl-PL')
         .assert.containsText(selMenu, 'Polski')
         .click(selMenu)
         .assert.not.visible(selMenu)
         .end()
     },
  after: (browser) => {
    browser.end();
  }
};
