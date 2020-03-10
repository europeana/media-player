import * as pEvents  from '../../../src/components/player/playerEventHandlers';
import Player from '../../../src/components/player/index';
const $ = require("jquery");
import slider from 'jquery-ui/ui/widgets/slider'

const manifest = 'https://iiif.europeana.eu/presentation/08609/fe9c5449_9522_4a70_951b_ef0b27893ae9/manifest?format=3&wskey=api2demo';

describe('Event Handling', () => {

  const fixture = '<div id="eups-player-123" class="eups-player"></div>';
  let player;

  beforeEach((done) => {
    document.body.insertAdjacentHTML('afterbegin', fixture);
    let wrapperElement = $('.eups-player');

    console.log('wrapperElement[0] ' + wrapperElement[0]);

    player = new Player(wrapperElement[0]);
    player.init({ manifest: manifest }, '', '');

    player.avcomponent.on('mediaready', function() {
      done();
    });
  });

  it('should pause on space', () => {
    expect($('.playwrapper').is(':visible')).toBeTruthy();
    pEvents.keyEventHandler(player, { keyCode: 32 });
    expect($('.playwrapper').is(':visible')).toBeFalsy();
  });

  it('should pause on K', () => {
    expect($('.playwrapper').is(':visible')).toBeTruthy();
    pEvents.keyEventHandler(player, { keyCode: 75 });
    expect($('.playwrapper').is(':visible')).toBeFalsy();
  });

  it('should increase and decrease the volume', () => {
    const selSlider = '.volume-slider .ui-slider-range';
    expect($(selSlider).attr('style')).toEqual('width: 100%;');
    pEvents.keyEventHandler(player, { keyCode: 40 });
    expect($(selSlider).attr('style')).toEqual('width: 90%;');
    pEvents.keyEventHandler(player, { keyCode: 38 });
    expect($(selSlider).attr('style')).toEqual('width: 100%;');
  });

  it('should open types', () => {
    spyOn(window, 'open');
    const player = {
      editorurl: 'x',
      manifesturl: 'y'
    };
    const e = {
      stopPropagation: () => {}
    };
    pEvents.openEditorTypeEventHandler(player, e, 'type')
    expect(window.open).toHaveBeenCalled();
  });

});
