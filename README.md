# Europeana Media Player Library

[![Build Status](https://travis-ci.com/europeana/media-player.svg?branch=master)](https://travis-ci.com/europeana/media-player)
[![Maintainability](https://api.codeclimate.com/v1/badges/034304037fa168609682/maintainability)](https://codeclimate.com/github/europeana/media-player/maintainability)

Created as part of the [Europeana Media Project](https://pro.europeana.eu/project/europeana-media)

### Build Setup

Install package dependencies:
* `npm install`

### Linting
To lint-check the `.js` run:
* `npm run lint`
* `npm run lint:fix`

To lint-check the `.scss` run:

* `npm run lint:style`
* `npm run lint:style:fix`

### Testing

Run unit tests with either of:
* `npm run test`
* `npm test`

Run end-to-end tests with:
* `npm run test:e2e`
(defaults to chrome) or with the browser-specific commands:
* `npm run test:e2e:chrome`
* `npm run test:e2e:firefox`
* `npm run test:e2e:chrome:headless`
* `npm run test:e2e:firefox:headless`
* `npm run test:e2e:headless`
* `npm run test:e2e:all`

### Build for production

Run:
* `npm run build:production`

### Publication

* publishes to [npm](https://www.npmjs.com/package/europeanamediaplayer) using a [web-action](actions?query=workflow%3A%22Node.js+Package%22)

### Dependencies

The player has unbundled dependencies on [jQuery](https://www.npmjs.com/package/jquery) and [jQuery-UI](https://www.npmjs.com/package/webpack-jquery-ui) that have not been packed into this library. Further [dashjs](https://www.npmjs.com/package/dashjs) is needed if you plan to stream MPEG DASH videos.

### Embed player

To embed the player please firstyourself first make sure to include the Europeana Media Player Library

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

 It's possible to set the following options to extend / change the default player

- **editor** url, allows to configure an external editor so that editing is not done on the page itself.
- **language** 2 character iso 639-1 language code, all official languages of the European Union are supported. The default language is English.

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
