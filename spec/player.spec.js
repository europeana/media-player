import * as index  from '../src/index';

let manifest = 'https://iiif.europeana.eu/presentation/08609/fe9c5449_9522_4a70_951b_ef0b27893ae9/manifest?format=3&wskey=api2demo';

describe('index functions', () => {

  beforeAll((done) => {
    const fixture = '<div class="player-wrapper"></div>';
    document.body.insertAdjacentHTML('afterbegin', fixture);

    console.log('initialise the player');

    let wrapperElement = document.querySelector('.player-wrapper');

    let videoObj = { manifest };
    let options = { mode: 'player' };
    options.manifest = manifest;

    index.init(wrapperElement, videoObj, options);

    setTimeout(done, 3000);
  });

  it('should load the player', () => {
    let playerElement = document.querySelector('.eups-player');
    expect(playerElement).toBeTruthy();
  });

  it('should contain a play button', () => {
    let playCircle = document.querySelector('.playcircle');
    expect(playCircle).toBeTruthy();
  });

  it('should have a duration of 1:00', () => {
    let duration = document.querySelector('.canvas-duration');
    expect(duration.textContent).toContain('01:00');
  });
});
