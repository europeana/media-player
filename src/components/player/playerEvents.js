function handleKeyEvents(player, e) {
    if (e.keyCode === 32 || e.keyCode === 75) {  //space bar, k button
        player.handlePlayPause(player);
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

function handlePlayPauseEvent(player) {
    if (player.avcomponent.canvasInstances[0].isPlaying()) {
      player.avcomponent.canvasInstances[0].pause();
    } else {
      //hide playcircle if showing
      if ($('#'+player.elem.id+' .playwrapper').is(':visible')) {
        $('#'+player.elem.id+' .playwrapper').hide();
      }
      player.avcomponent.canvasInstances[0].play();
    }
  }

function handleFullScreenEvent(player) {
    $('#'+player.elem.id+' .moremenu').hide();
    $('#'+player.elem.id+' .subtitlemenu').hide();
  }

function handleVolumeChange(player, rate) {
    let val = $('#'+player.elem.id+' .volume-slider').slider('option', 'value');
    val = determineNewVolume(val, rate);
    $('#'+player.elem.id+' .volume-slider').slider('value', val);
}

function determineNewVolume( val, rate) {
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

function handleEditorButtonEvent(player, e) {
    toggleMenuOption(player, e, "moremenu", "More");
}

function toggleSubtitlesEvent(player, e) {
    toggleMenuOption(player, e, "subtitlemenu", "Subtitles");
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

function handleSubtitleMenuEvent(player, e) {
    $('#'+player.elem.id+' .subtitlemenu').hide();
    let textTracks = $('#'+player.elem.id+' video')[0].textTracks;

    for (let i = 0; i < textTracks.length; i++) {
      if ($(this).data('language') === textTracks[i].language) {
        textTracks[i].mode = 'showing';
      } else {
        textTracks[i].mode = 'hidden';
      }
    }
    //prevent the play/pause handler to react
    e.stopPropagation();
}

function openEditorTypeEvent(player, e, type) {
    //prevent the play/pause handler to react
    e.stopPropagation();

    window.open(player.editorurl+'?manifest='+encodeURIComponent(player.manifesturl)+'#'+type, '_blank');
}

module.exports = {
    handleKeyEvents, handlePlayPauseEvent, handleFullScreenEvent, handleEditorButtonEvent, toggleSubtitlesEvent, handleSubtitleMenuEvent, openEditorTypeEvent
};