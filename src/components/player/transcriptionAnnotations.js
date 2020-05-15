/* global $ */

const languages = require('../languages/lang.js').default.locales;

function handleTranscriptionAnnotations(player) {
  if (player.manifest.__jsonld.items[0].annotations && player.manifest.__jsonld.items[0].annotations[0]) {
    fetchAnnotations(player);
  }
}

function fetchAnnotations(player) {
  $.get(player.manifest.__jsonld.items[0].annotations[0].id, (response) => {
    let textResource = response.resources.find((resource) => {
      return resource.dcType === 'Media';
    });

    fetchTextResource(player, response, textResource);
  });
}

function fetchTextResource(player, annotationResource, textResource) {
  //determine text, fetch, then loop over all entries and add them to a text track
  $.ajax({
    type: 'GET',
    url: textResource.resource['@id'],
    contentType: 'application/x-www-form-urlencoded;charset=utf-8',
    dataType: 'json',
    success: ((fullText) => {
      let track = player.elem.find('video')[0].addTextTrack('subtitles', 'subitles', languages.find(lang => lang.code === fullText.language).iso);

      annotationResource.resources.forEach(element => {
        if (element.dcType === 'Caption') {
          track.addCue(handleCaption(element, fullText));
        }
      });
      player.initLanguages(player.elem.find('video')[0].textTracks);
    })
  });
}

function handleCaption(element, fullText) {
  let characterRange = element.resource['@id'].substring(element.resource['@id'].lastIndexOf('=')+1);
  let charRange = characterRange.split(',');
  let subtitleString = fullText.value.substring(charRange[0], charRange[1]);
  let timeRange = element.on[0].substring(element.on[0].lastIndexOf('=')+1);
  let tRange = timeRange.split(',');

  let cue = new VTTCue(timeToSeconds(tRange[0]), timeToSeconds(tRange[1]), subtitleString);
  cue.id = element.resource['@id'];
  cue.line = -4;
  cue.size = 90;

  return cue;
}

function timeToSeconds(time) {
  let [hours, minutes, seconds] = time.split(':');
  hours = parseInt(hours);
  minutes = parseInt(minutes);
  let milliseconds;

  let parts = seconds.lastIndexOf('.') > -1 ? seconds.split('.') : [seconds, 0];
  seconds = parseInt(parts[0]);

  milliseconds = parts[1].length === 2 ? parseInt(parts[1]) * 10 : parseInt(parts[1]);

  return (hours * 3600 + minutes * 60 + seconds) +'.'+ milliseconds;
}

module.exports = {
  handleTranscriptionAnnotations
};
