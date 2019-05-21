import EuropeanaMediaPlayer from './components/europeanamediaplayer';

window.addEventListener('load', () => {
    var container = document.body;
    //var videoObj = { source: "https://videoeditor.noterik.com/manifest/05_synchronised_av_text.json", duration: 120, id: "05_synchronized_av_test.json" };
    //var videoObj = { source: "EUS_500AD7F6989B517AE4D55AF88F53D8CB", duration: -1, id: "EUS_500AD7F6989B517AE4D55AF88F53D8CB"};
    //var videoObj = { source: "EUS_FC3C684F3E28486CB77273AB9DEA3311", duration: -1, id: "EUS_FC3C684F3E28486CB77273AB9DEA3311" };
    var videoObj = { source : "EUS_DD3FEB690A8A4AC0920BDC89EFC29B10", duration: -1, id: "EUS_DD3FEB690A8A4AC0920BDC89EFC29B10" };
    new EuropeanaMediaPlayer(container, videoObj);

});
