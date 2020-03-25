/* global $ */

const idPart = '?id=';

function handleEUscreenItem(player, helper) {
  return new Promise(((resolve, reject) => {
    let canvas = helper.manifest.__jsonld.items[0];
    let EUscreenitempage =  canvas.items[0].items[0].body.id;
    let EUscreenId = EUscreenitempage.substring(EUscreenitempage.indexOf(idPart)+idPart.length);

    $.get('https://euscreen.embd.eu/'+EUscreenId, (response) => {
      canvas.id = helper.manifest.__jsonld.id.substring(0, helper.manifest.__jsonld.id.lastIndexOf('/'))+'/canvas/p1';
      canvas.type = 'Canvas';
      canvas.height = response.height;
      canvas.width = response.width;
      canvas.duration = response.duration;

      canvas.items[0].items[0].body.id = response.location;
      canvas.items[0].items[0].body.format = response.format;

      resolve(helper);
    })
      .fail(() => {
        console.error('Could not receive required iem information for '+EUscreenId);
        reject(helper);
      });
  }));
}

module.exports = {
  handleEUscreenItem
};
