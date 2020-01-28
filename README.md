# Europeana Media Player Library

Created as part of the [Europeana Media Project](https://pro.europeana.eu/project/europeana-media)

### First

Install deps from project root with `yarn` or `npm i`

### Build for production

`yarn build` or `npm run build`

### Embed player

To embed the player yourself first make sure to include the Europeana Media Player Library

```
import EuropeanaMediaPlayer from 'europeanamediaplayer';
```

or 

```
const EuropeanaMediaPlayer = require("europeanamediaplayer").default;
```

The constructor of the Europeana Media Player is

```
var player = new EuropeanaMediaPlayer(container, videoObject, options);
```

The constructor accepts three parameters

- **container** is the DOM element in which to create the player.
- **videoObject** is an object containing the video properties.
- **options** is an optional object containing the player options.

The videoObject has the following required properties

- **manifest** the url of the IIIF manifest for the media item

 It's possible to override the following settings by providing them in the options object

- **editor** url, allows to configure an external editor so that editing is not done on the page itself.

### Example

```
var container = document.body;
var videoObj = { manifest : "https://iiif.europeana.eu/presentation/2051906/data_euscreenXL_http___openbeelden_nl_media_9972/manifest?format=3" };
var options = { editor: "https://video-editor.eu" };
new EuropeanaMediaPlayer(container, videoObj, options);
```

## License

Licensed under the EUPL v1.2.

For full details, see [LICENSE.md](LICENSE.md).