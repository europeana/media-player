# Europeana Media Player Library

[![Build Status](https://travis-ci.com/europeana/media-player.svg?branch=develop)](https://travis-ci.com/europeana/media-player)
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

Generate a coverage report with:
* `npm run test:coverage`

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

The player has unbundled dependencies on [jQuery](https://www.npmjs.com/package/jquery) and [jQuery-UI](https://www.npmjs.com/package/webpack-jquery-ui) that have not been packed into this library. For jQuery-UI also [themes/base/jquery.ui.core.css](http://code.jquery.com/ui/1.10.1/themes/base/jquery.ui.core.css) and [themes/base/jquery.ui.slider.css](http://code.jquery.com/ui/1.10.1/themes/base/jquery.ui.slider.css) are required in order to show slider buttons.

Example:

```html
<link rel="stylesheet" type="text/css" href="http://code.jquery.com/ui/1.10.1/themes/base/jquery.ui.core.css"></link>
<link rel="stylesheet" type="text/css" href="http://code.jquery.com/ui/1.10.1/themes/base/jquery.ui.slider.css"></link>

<script src="https://code.jquery.com/jquery-3.4.1.min.js" type="text/javascript"></script>
<script src="https://code.jquery.com/ui/1.10.1/jquery-ui.min.js" type="text/javascript"></script>
```

Further [dashjs](https://www.npmjs.com/package/dashjs) is needed if you plan to stream MPEG DASH videos.
 
Example: 

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/dashjs/2.9.3/dash.all.min.js" type="text/javascript"></script>
```

### Embed player

To embed the player please firstyourself first make sure to include the Europeana Media Player Library

```javascript
import EuropeanaMediaPlayer from 'europeanamediaplayer';
```

or

```javascript
const EuropeanaMediaPlayer = require("europeanamediaplayer");
```

The constructor of the Europeana Media Player is

```javascript
var player = new EuropeanaMediaPlayer(container, videoObject[, options]);
```

The constructor accepts the following parameters

Name | Type | Description
---- | ---- | -----------
container| _DOM Element_ | the DOM element in which to create the player, mandatory
videoObject | _JSON Object_ | the object containing the video properties, mandatory
options | _JSON Object_ | an optional object containing the player options

The _videoObject_ accepts the following properties

Name | Type | Description
---- | ---- | -----------
manifest | _String_ / _JSON Object_ | the url of the IIIF manifest for the media item or the manifest itself as JSON object, mandatory
canvasId | _String_ | the canvasId of the canvas to show, can be used when having a manifest with multiple canvases, optional


The _options_ accepts the following properties

Name | Type | Description
---- | ---- | -----------
editor | _String_ | url, allows to configure an external editor so that embedding and other editorial options can be done on that page, optional
language | _String_ | 2 character [iso 639-1 language code](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes), all official languages of the European Union are supported. The default language is English, optional

### Examples

#### Basic example

This basic example contains only the required parameters.

```javascript
var container = document.body;
var videoObj = { manifest : "https://iiif.europeana.eu/presentation/2051906/data_euscreenXL_http___openbeelden_nl_media_9972/manifest?format=3" };
new EuropeanaMediaPlayer(container, videoObj);
```

#### Editor example

This example sets the editor to show the editorial option menu in the player.

```javascript
var container = document.body;
var videoObj = { manifest : "https://iiif.europeana.eu/presentation/2051906/data_euscreenXL_http___openbeelden_nl_media_9972/manifest?format=3" };
var options = { editor: "https://video-editor.eu" };
new EuropeanaMediaPlayer(container, videoObj, options);
```

#### Editor and language example

This example sets besides the editor the player interface language to Dutch

```javascript
var container = document.body;
var videoObj = { manifest : "https://iiif.europeana.eu/presentation/2051906/data_euscreenXL_http___openbeelden_nl_media_9972/manifest?format=3" };
var options = { editor: "https://video-editor.eu", language: "nl" };
new EuropeanaMediaPlayer(container, videoObj, options);
```

### Multiple canvases example

This example loads a manifest containing multiple canvas elements and loads the second canvas element (p2) on initialisation

```javascript
var container = document.body;
var videoObj = { manifest : "https://iiif.europeana.eu/presentation//2051921/data_euscreenXL_7081/manifest?format=3", canvasId: "https://iiif.europeana.eu/presentation/2051921/data_euscreenXL_7081/canvas/p2" };
new EuropeanaMediaPlayer(container, videoObj);
```

### Multiple canvases example via setCanvas

This example loads a manifest containing multiple canvas elements and loads the second canvas element(p2) when invoking the setCanvas() call

```javascript
var container = document.body;
var videoObj = { manifest : "https://iiif.europeana.eu/presentation//2051921/data_euscreenXL_7081/manifest?format=3" }
var emp = new EuropeanaMediaPlayer(container, videoObj);
....
emp.player.setCanvas("https://iiif.europeana.eu/presentation/2051921/data_euscreenXL_7081/canvas/p2");
```

### Multiple media items example

This example loads a manifest containing multiple canvas elements each containing a media item and loads the canvas containing the provided media item on initialisation

```javascript
var container = document.body;
var videoObj = { manifest : "https://iiif.europeana.eu/presentation//2051921/data_euscreenXL_7081/manifest?format=3", mediaItem: "http://thraki.mmb.org.gr/002_07.mpg" };
new EuropeanaMediaPlayer(container, videoObj);
```

### Multiple media items example via setMediaItem

This example loads a manifest containing multiple canvas elements each containing a media item and loads the canvas containing the provided media item when invoking the setMediaItem() call

```javascript
var container = document.body;
var videoObj = { manifest : "https://iiif.europeana.eu/presentation//2051921/data_euscreenXL_7081/manifest?format=3" }
var emp = new EuropeanaMediaPlayer(container, videoObj);
....
emp.player.setMediaItem("http://thraki.mmb.org.gr/002_07.mpg");
```

## License

Licensed under the EUPL v1.2.

For full details, see [LICENSE.md](LICENSE.md).
