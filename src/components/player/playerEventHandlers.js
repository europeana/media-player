/* global $ */

function playEventHandler(player) {
  $('#'+player.elem.id+' .playwrapper').hide();
  $('#'+player.elem.id+' .button-play').attr('title', player.banana.i18n('player-pause'));
}

function pauseEventHandler(player) {
  clearInterval(player.timeupdate);
  $('#'+player.elem.id+' .button-play').attr('title', player.banana.i18n('player-play'));
}

function volumeChangedEventHandler(player, value) {
  let muteType = value !== 0 ? 'player-mute' : 'player-unmute';
  $('#'+player.elem.id+' .volume-mute').attr('title', player.banana.i18n(muteType));
}

function keyEventHandler(player, e) {
  if (e.keyCode === 32 || e.keyCode === 75) {  //space bar, k button
    playPauseEventHandler(player);
  }
  if (e.keyCode === 70) { //f button
    $('#'+player.elem.id+' .button-fullscreen').click();
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
    //hide playcircle if showing
    if ($('#'+player.elem.id+' .playwrapper').is(':visible')) {
      $('#'+player.elem.id+' .playwrapper').hide();
    }
    player.avcomponent.canvasInstances[0].play();
  }
}

function fullScreenEventHandler(player) {
  $('#'+player.elem.id+' .moremenu').hide();
  $('#'+player.elem.id+' .subtitlemenu').hide();
}

function handleVolumeChange(player, rate) {
  let val = $('#'+player.elem.id+' .volume-slider').slider('option', 'value');
  val = determineNewVolume(val, rate);
  $('#'+player.elem.id+' .volume-slider').slider('value', val);
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
  toggleMenuOption(player, e, 'moremenu', 'More');
}

function toggleSubtitlesEventHandler(player, e) {
  toggleMenuOption(player, e, 'subtitlemenu', 'Subtitles');
}

function toggleMenuOption(player, e, cls, name) {
  e.preventDefault();

  if ($('#'+player.elem.id+' .'+cls).is(':visible')) {
    $('#'+player.elem.id+' .'+cls).hide();
  } else {
    $('#'+player.elem.id+' .'+cls).css({ bottom: $('#'+player.elem.id+' .options-container').height(), left: (($('#'+player.elem.id+' .btn[data-name="'+name+'"]').offset().left - $('#'+player.elem.id+' .player').offset().left) - ($('#'+player.elem.id+' .'+cls).width() / 2)) });
    $('#'+player.elem.id+' .'+cls).show();
  }
}

function subtitleMenuEventHandler(player,  e) {
  $('#'+player.elem.id+' .subtitlemenu').hide();
  let textTracks = $('#'+player.elem.id+' video')[0].textTracks;

  for (let i = 0; i < textTracks.length; i++) {
    if ($(e.target).data('language') === textTracks[i].language) {
      textTracks[i].mode = 'showing';
    } else {
      textTracks[i].mode = 'hidden';
    }
  }
  //prevent the play/pause handler to react
  e.stopPropagation();
}

function openEditorTypeEventHandler(player, e, type) {
  //prevent the play/pause handler to react
  e.stopPropagation();

  window.open(player.editorurl+'?manifest='+encodeURIComponent(player.manifesturl)+'#'+type, '_blank');
}

function mediaErrorHandler(player, error) {
  console.error('media error', error);

  $('#'+player.elem.id+' .player').removeClass('player--loading');
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

  $('#'+player.elem.id+' .canvas-container').append('<div class=\'anno errormessage\'>'+errormessage+'</div>');
}

module.exports = {
  playEventHandler, pauseEventHandler, volumeChangedEventHandler, keyEventHandler, playPauseEventHandler, fullScreenEventHandler, editorButtonEventHandler, toggleSubtitlesEventHandler, subtitleMenuEventHandler, openEditorTypeEventHandler, mediaErrorHandler
};
