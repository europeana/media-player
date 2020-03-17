/* global $ */

function transcriptionAnnotation(player) {
    console.log(player.manifest.__jsonld);
    if (player.manifest.__jsonld.items[0].annotations != undefined) {
            console.log("got annotations "+player.manifest.__jsonld.items[0].annotations[0].id);
    }
}

module.exports = {
    transcriptionAnnotation
}