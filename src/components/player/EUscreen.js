/* global $ */

const idPart = '?id=';

function handleEUscreenItem(player, helper) {
  return new Promise(((resolve, reject) => {
    let EUscreenitempage =  helper.manifest.__jsonld.items[0].items[0].items[0].body.id;
    let EUscreenId = EUscreenitempage.substring(EUscreenitempage.indexOf(idPart)+idPart.length);

    $.get('https://euscreen.embd.eu/'+EUscreenId, (response) => {
      helper.manifest.__jsonld.items[0].id = helper.manifest.__jsonld.id.substring(0, helper.manifest.__jsonld.id.lastIndexOf('/'))+'/canvas/p1';
      helper.manifest.__jsonld.items[0].type = 'Canvas';
      helper.manifest.__jsonld.items[0].height = response.height;
      helper.manifest.__jsonld.items[0].width = response.width;
      helper.manifest.__jsonld.items[0].duration = response.duration;

      helper.manifest.__jsonld.items[0].items[0].items[0].body.id = response.location;
      helper.manifest.__jsonld.items[0].items[0].items[0].body.format = response.format;

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
