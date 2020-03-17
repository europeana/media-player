/* global $ */

const idPart = "?id=";

function handleEUscreenItem(player, helper, EUscreenitempage) {
    let EUscreenId = EUscreenitempage.substring(EUscreenitempage.indexOf(idPart)+idPart.length);

    console.log(helper);

    $.get( "https://euscreen.embd.eu/"+EUscreenId, function(response) {
        console.log(response);

        let canvas = {
            id: "",
            type: "Canvas",
            height: response.height,
            width: response.width,
            duration: response.duration
        }

        helper.manifest.__jsonld.items[0] = canvas;
    });
}

module.exports = {
    handleEUscreenItem
}