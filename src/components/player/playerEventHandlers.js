/* global $ */

function playEventHandler(player) {
  player.elem.find('.playwrapper').hide();
  player.elem.find('.button-play').attr('title', player.banana.i18n('player-pause'));
}

function pauseEventHandler(player) {
  clearInterval(player.timeupdate);
  player.elem.find('.button-play').attr('title', player.banana.i18n('player-play'));
}

function volumeChangedEventHandler(player, value) {
  let muteType = value !== 0 ? 'player-mute' : 'player-unmute';
  player.elem.find('.volume-mute').attr('title', player.banana.i18n(muteType));
}

function keyEventHandler(player, e) {
  if (e.keyCode === 32 || e.keyCode === 75) {  //space bar, k button
    playPauseEventHandler(player);
  }
  if (e.keyCode === 70) { //f button
    player.elem.find('.button-fullscreen').click();
  }
  if (e.keyCode === 38) { //volume up by 10%
    handleVolumeChange(player, 0.1);
  }
  if (e.keyCode === 40) { //volume down by 10%
    handleVolumeChange(player, -0.1);
  }
}

function playPauseEventHandler(player) {
  if (player.avcomponent.canvasInstances[0]._isPlaying) {
    player.avcomponent.canvasInstances[0].pause();
  } else {
    // hide playcircle if showing
    const playerWrapper = player.elem.find('.playwrapper');
    if (playerWrapper.is(':visible')) {
      playerWrapper.hide();
    }
    player.avcomponent.canvasInstances[0].play();
  }
}

const hidePopups = (player, dataOpenerSelector = '[data-opener]') => {
  const openerNames = $(dataOpenerSelector);
  openerNames.each((i, el) => {
    const elMenu = $(el);
    elMenu.removeClass('showing');
    messagePopupOpener(elMenu, 'open-close', false);
  });
};

function fullScreenEventHandler(player, value) {
  hidePopups(player);
  const btnFullscreen = $('.av-icon-fullscreen');
  if (value === 'on') {
    btnFullscreen.addClass('exit');
  } else if (value === 'off') {
    btnFullscreen.removeClass('exit');
  }
}

const resizeEventHandler = (player) => {
  hidePopups(player);
};

function handleVolumeChange(player, rate) {
  let val = player.elem.find('.volume-slider').slider('option', 'value');
  val = determineNewVolume(val, rate);
  player.elem.find('.volume-slider').slider('value', val);
}

function determineNewVolume(val, rate) {
  if (rate < 0) {
    return decreaseVolume(val, rate);
  } else {
    return increaseVolume(val, rate);
  }
}

function decreaseVolume(val, rate) {
  return val < rate ? 0 : val + rate;
}

function increaseVolume(val, rate) {
  return val > rate + val > 1 ? 1 : val + rate;
}

function editorButtonEventHandler(player, e) {
  toggleMenuOption(player, e, 'moremenu');
}

function toggleSubtitlesEventHandler(player, e) {
  toggleMenuOption(player, e, 'subtitlemenu');
}

function toggleMenuOption(player, e, cls) {
  e.preventDefault();

  const elPlayer = player.elem;
  const elMenu = elPlayer.find('.' + cls);

  if (elMenu.is(':visible')) {
    hidePopups(player, '[data-opener=' + elMenu.data('opener') + ']');
  } else {
    const marginBottom = -6;
    const bottomVal = elPlayer.find('.options-container').height() + marginBottom;
    hidePopups(player);
    elMenu.css({ bottom: bottomVal, right: 16 });
    elMenu.addClass('showing');
    messagePopupOpener(elMenu, 'open-close', true);
  }
}

const messagePopupOpener = (elMenu, eventType, value) => {
  let openerName = elMenu.data('opener');
  if (openerName) {
    let opener = $('[data-name=' + openerName + ']');
    if (opener) {
      opener.trigger(eventType, [value]);
    }
  }
};

// clicks on a subtitle menu item

function subtitleMenuEventHandler(player,  e) {
  const elPlayer = player.elem;
  const selClass = 'selected';
  const textTracks = elPlayer.find('video')[0].textTracks;
  const tgt = $(e.target);
  const optionAlreadySelected = tgt.hasClass(selClass);
  const selLang = optionAlreadySelected ? '(clear)' : tgt.data('language');

  Array.from(textTracks).forEach((track) => {
    track.mode = selLang === track.language ? 'showing' : 'hidden';
  });
  toggleMenuOption(player, e, 'subtitlemenu');
  messagePopupOpener(elPlayer.find('.subtitlemenu-option').parent(), 'optionSet', !optionAlreadySelected);

  elPlayer.find('.subtitlemenu-option').removeClass(selClass);
  if (!optionAlreadySelected) {
    tgt.addClass(selClass);
  }

  e.stopPropagation();
  e.preventDefault();
}

function openEditorTypeEventHandler(player, e, type) {
  //prevent the play/pause handler to react
  e.stopPropagation();
  window.open(player.editorurl+'?manifest='+encodeURIComponent(player.manifesturl)+'#'+type, '_blank');
}

function mediaErrorHandler(player, error) {
  console.error('media error', error);

  player.elem.find('.player').removeClass('player--loading');
  let errormessage = player.banana.i18n('player-error')+': ';
  switch (error.code) {
    case 1:
      errormessage += player.banana.i18n('player-error-loading');
      break;
    case 2:
      errormessage += player.banana.i18n('player-error-network');
      break;
    case 3:
      errormessage += player.banana.i18n('player-error-decoding');
      break;
    case 4:
      errormessage += player.banana.i18n('player-error-format');
      break;
    default:
      errormessage += player.banana.i18n('player-error-unknown');
      break;
  }

  player.elem.find('.canvas-container').append('<div class=\'anno errormessage\'>'+errormessage+'</div>');
}

module.exports = {
  hidePopups,
  playEventHandler, pauseEventHandler, volumeChangedEventHandler, keyEventHandler, playPauseEventHandler, fullScreenEventHandler, editorButtonEventHandler, toggleSubtitlesEventHandler, subtitleMenuEventHandler, openEditorTypeEventHandler, mediaErrorHandler, resizeEventHandler
};
