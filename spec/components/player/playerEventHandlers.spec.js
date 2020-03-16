/*
import * as pEvents  from '../../../src/components/player/playerEventHandlers';
import Player from '../../../src/components/player/index';
const $ = require("jquery");

//const manifest = 'https://iiif.europeana.eu/presentation/08609/fe9c5449_9522_4a70_951b_ef0b27893ae9/manifest?format=3&wskey=api2demo';
//const manifestEditable = 'https://beta.qandr.eu/euscreenxlmanifestservlet/?videoid=http://stream4.noterik.com/progressive/stream4/domain/euscreen/user/eu_luce/video/1323/rawvideo/1/raw.mp4&ticket=83510250&duration=73&maggieid=/domain/euscreenxl/user/eu_luce/video/EUS_DD5A286675EE415894693ED77BCC41A5'
const manifestEditable = 'http://localhost:9876/base/spec/fixture-data/manifest.json';

describe('Event Handling', () => {

  const fixture = '<div class="eups-player"></div>';
  let player;
  beforeEach((done) => {
    $('.eups-player').remove();
    document.body.insertAdjacentHTML('afterbegin', fixture);
    let wrapperElement = $('.eups-player');
    wrapperElement.attr('id', Math.floor(Math.random() * (Number.MAX_SAFE_INTEGER - 1)));

    console.log('wrapperElement[0] ' + wrapperElement[0]);
    console.log('wrapperElement[0].id ' + wrapperElement[0].id);

    player = new Player(wrapperElement[0]);
    player.init({ manifest: manifestEditable }, manifestEditable, '');
    player.avcomponent.on('mediaready', function() {
      done();
    });
  });

  afterEach(() => {
    $('.eups-player').remove();
  });

  it('has a shortcut for fullscreen', () => {

    let sel = '.button-fullscreen';
    const spy = { cb: () => {}};
    spyOn(spy, 'cb');
    $(sel)[0].addEventListener('click', spy.cb);
    pEvents.keyEventHandler(player, { keyCode: 70 });
    expect(spy.cb).toHaveBeenCalled();
    //pEvents.keyEventHandler(player, { keyCode: 70 });
  });

  it('should handle errors', () => {
    [
      'Error: loading aborted',
      'Error: network error',
      'Error: decoding of media failed',
      'Error: media format not suppported by this browser',
      'Error: unknown'
    ].forEach((msg, index) => {
      $('.errormessage').remove();
      pEvents.mediaErrorHandler(player, { code: index + 1 });
      expect($('.errormessage').text()).toEqual(msg);
    })
    $('.errormessage').remove();
  });

  it('should mute and unmute', () => {
    expect($('.volume-mute').attr('title')).toEqual('Mute');
    pEvents.volumeChangedEventHandler(player, 0);
    expect($('.volume-mute').attr('title')).toEqual('Unmute');
    pEvents.volumeChangedEventHandler(player, 1);
    expect($('.volume-mute').attr('title')).toEqual('Mute');
  });

  it('should pause on space', () => {
    expect($('.playwrapper').is(':visible')).toBeTruthy();
    pEvents.keyEventHandler(player, { keyCode: 32 });
    expect($('.playwrapper').is(':visible')).toBeFalsy();
    pEvents.keyEventHandler(player, { keyCode: 32 });
  });

  it('should pause on K', () => {
    expect($('.playwrapper').is(':visible')).toBeTruthy();
    pEvents.keyEventHandler(player, { keyCode: 75 });
    expect($('.playwrapper').is(':visible')).toBeFalsy();
    pEvents.keyEventHandler(player, { keyCode: 75 });
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
    spyOn(window, 'open').and.callFake(() => {});
    const player = {
      editorurl: manifestEditable,
      manifesturl: manifestEditable
    };
    const e = {
      stopPropagation: () => {}
    };
    pEvents.openEditorTypeEventHandler(player, e, 'type')
    expect(window.open).toHaveBeenCalled();
  });

  it('should show the more menu', () => {
    const e = {
      preventDefault: () => {},
      stopPropagation: () => {}
    };
    player.addEditorOption(player);
    expect($('.moremenu').is(':visible')).toBeFalsy();
    pEvents.editorButtonEventHandler(player, e);
    expect($('.moremenu').is(':visible')).toBeTruthy();
    pEvents.editorButtonEventHandler(player, e);
    expect($('.moremenu').is(':visible')).toBeFalsy();
  });

});
*/
