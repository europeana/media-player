# Europeana Media Player

Created as part of the Europeana Media Generic Services Project 

### First

Install deps from project root with `yarn` or `npm i`

### Start development server with:

`yarn start:dev` or `npm run start:dev`

It's possible to use a different port by specifying this first like so: 

`EUPS_PORT=7788 yarn start:dev` to start with port 7788. Same for npm just include `EUPS_PORT=7788` at the beginning.

Development mode will include a testdata component that allows for easy testing different sources

To open the editor mode in an external window specify `EDITOR=external` 

### Test with production environment 

`yarn start:prod` or `npm run start:prod`

To test without development testdata

### Build for production

`yarn build` or `npm run build`

### Embed player

To embed the player yourself first make sure to include the EuropeanaMediaPlayer

```
import EuropeanaMediaPlayer from './components/europeanamediaplayer';
```

The constructor of the EuropeanaMediaPlayer is

```
var player = new EuropeanaMediaPlayer(container, videoObject);
```

The constructor accepts two parameters

- **container** is the DOM element in which to create the player.
- **videoObject** is an object containing the video properties.

The videoObject has the following required properties

- **id** the identifier of the video object
- **source** the url source of the video file, the url source of a complete manifest or an EUscreen identifier
- **duration** the duration of the video file, in case of a manifest or EUscreen identifier this can be set to -1

Further the following optional properties can be specified

- **width** the width of the video file (default is 640)
- **height** the height of the video file (default is 480)
- **mediatype** the mediatype of the video file (default is mp4)

It's possible to override the following settings by providing them in the get parameters of the url

- **manifest** the manifest to open
- **eupsid** EUPS Id to identify same browser as on an other site
- **mode** allows to set *editor* as mode to open directly the editor along with the player
