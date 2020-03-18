module.exports = {
  'Load local fixture': (browser) => {
    browser
      .url('http://127.0.0.1:8081/spec/fixture-data/index.html')
      .assert.visible('body')
      .end()
  },
  'Clicking play': (browser) => {
    browser.end()
  },
  'Clicking stop': (browser) => {
    browser.end()
  },
  'Clicking slider (timeline / scrubbing)': (browser) => {
    browser.end()
  },
  'Maximising & minimising the player (incl. key combinations)': (browser) => {
    browser.end()
  },
  'Volume controls (incl. key combinations - increase / decrease)': (browser) => {
    browser.end()
  },
  'Language switch': (browser) => {
    browser.end()
  },
  'Search Europeana': (browser) => {
    const parisText = `Paris as seen from the air . Showing the Place de L'etoile . 1 November 1928 | TopFoto.co.uk`;
    browser
      .url('https://www.europeana.eu/portal/en')
      .assert.visible('input[name=q]')
      .setValue('input[name=q]', 'paris')
      .pause(1000)
      .click('.search-submit')
      .pause(1000)
      .assert.containsText('ol.result-items li article .item-info h2 a', parisText)
      .pause(1000)
      .end()
  },
  after: (browser)=> {
      browser.end()
  }
};
