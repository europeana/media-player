# Europeana Media Player

Created as part of the Europeana Media Generic Services Project 

### First

Install deps from project root with `yarn` or `npm i`

### Start development server with:

`yarn start:dev` or `npm run start:dev`

It's possible to use a different port by specifying this first like so: 

`EUPS_PORT=7788 yarn start:dev` to start with port 7788. Same for npm just include `EUPS_PORT=7788` at the beginning.

### Build for production

`yarn build` or `npm run build`

### Embed player

To embed the player yourself first make sure to include the EuropeanaMediaPlayer library

```
import EuropeanaMediaPlayer from 'europeanamediaplayer';
```

The constructor of the EuropeanaMediaPlayer is

```
var player = new EuropeanaMediaPlayer(container, videoObject, options);
```

The constructor accepts three parameters

- **container** is the DOM element in which to create the player.
- **videoObject** is an object containing the video properties.
- **options** is an object containing the player options.

The videoObject has the following required properties

- **id** the identifier of the video object
- **source** the url source of the video file, the url source of a complete manifest or an EUscreen identifier
- **duration** the duration of the video file, in case of a manifest or EUscreen identifier this can be set to -1

Further the following optional video object properties can be specified

- **width** the width of the video file (default is 640)
- **height** the height of the video file (default is 480)
- **mediatype** the mediatype of the video file (default is mp4)

It's possible to override the following settings by providing them in the options object

- **mode** allows to set *editor* as mode to open directly the editor along with the player, default is *player* mode that only shows the player with a more button that will open when clicked the annotation viewer / editor.
- **editor** url, allows to configure an external editor so that editing is not done on the page itself.
- **eupsid** EUPS Id to identify same browser as on an other site

### Example

```
var container = document.body;
var videoObj = { source : "EUS_DD3FEB690A8A4AC0920BDC89EFC29B10", duration: -1, id: "EUS_DD3FEB690A8A4AC0920BDC89EFC29B10" };
var options = { editor: "https://videoeditor.noterik.com", mode: "player" };
new EuropeanaMediaPlayer(container, videoObj, options);
```

## License

Licensed under the EUPL v1.2.

For full details, see [LICENSE.md](LICENSE.md).