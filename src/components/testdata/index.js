import * as css from './index.css'

export default class TestData {
    constructor (elem) {
        if (!elem) return
        this.elem = elem
        this.glue;
    }

    init(glue) {       
        this.glue = glue;
        this.render();
    }

    render() {
        if (this.elem) $(this.elem).before(`
        <header id="header">
            <h1>Europeana Media Player</h1>
        </header>
        <div id="testdata">        
            <section data-component="app">
                <button class="testItem" data-manifest="https://videoeditor.noterik.com/manifest/index.php?id=EUS_A34F8951257C4573B50A301AFDFEEF39">
                EUscreen: Holland. Electric taxis are tested to contrast pollution
                </button>
                <button class="testItem" data-manifest="https://videoeditor.noterik.com/manifest/index.php?id=EUS_DD3FEB690A8A4AC0920BDC89EFC29B10">
                EUscreen: Storm over Italy
                </button>
                <button class="testItem" data-manifest="https://videoeditor.noterik.com/manifest/index.php?id=EUS_E15D8C02E5FB1BDAB8C1D66D385081D8">
                EUscreen: Cars in the latest fashion
                </button>    
                <button class="testItem" data-manifest="https://iiif-commons.github.io/iiif-av-component/examples/data/bl/05_synchronised_av_text.json">
                IIIF Test video
                </button>     
            </section>
        </div>
        `);
        var that = this;
  
        $(".testItem").click(function () {
            that.glue.signal("testItem", "clicked", $(this).data("manifest"));
        });
    }    
}