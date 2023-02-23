import * as React from 'react';
import { styled, ThemeProvider } from '@mui/material/styles';
import Switch from '@mui/material/Switch';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Button from '@mui/material/Button';
import { muiTheme } from './theme/muiTheme';

const SubtitleSwitch = styled(Switch)(({ theme }) => ({
  width: 29,
  height: 18,
  padding: 0,
  display: 'flex',
  '&:active': {
    '& .MuiSwitch-thumb': {
      width: 15,
    },
    '& .MuiSwitch-switchBase.Mui-checked': {
      transform: 'translateX(9px)',
    },
  },
  '& .MuiSwitch-switchBase': {
    padding: "3px 0px",
    '&.Mui-checked': {
      transform: 'translateX(12px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: '#0a72cc',
        border: 'none',
      },
    },
    '&:not(.Mui-checked)': {
      '& .MuiSwitch-thumb': {
        border: '3px solid rgba(0,0,0,1)',
        marginTop: '-3px',
      },
    },
  },
  '& .MuiSwitch-thumb': {
    boxShadow: '0 2px 4px 0 rgb(0 35 11 / 20%)',
    width: 14,
    height: 12,
    borderRadius: 12,
    transition: theme.transitions.create(['width'], {
      duration: 200,
    }),
  },
  '& .MuiSwitch-track': {
    borderRadius: 17.5 / 2,
    border: '3px solid rgba(0,0,0,1)',
    opacity: 1,
    backgroundColor: 'rgba(255,255,255,.25)',
    boxSizing: 'border-box',
  },
}));

interface Props {
  tracks: TextTrack[],
  player: JQuery
}

interface menuItemRefs {
  [key: string]: React.RefObject<HTMLLIElement>;
}

export const SubtitleMenu = ({ tracks, player }: Props) => {
  const [languageSelectDisabled, setLanguageSelectDisabled] = React.useState(true);  
  const [selectedLanguage, setSelectedLanguage] = React.useState("");  
  const [showAccuracyText, setShowAccuracytext] = React.useState(false);

  const [openingStateLanguageSelectDisabled, setOpeningStateLanguageSelectDisabled] = React.useState(true);
  const [openingStateSelectedLanguage, setOpeningStateSelectedLanguage] = React.useState("");
  const [openingStateShowAccuracyText, setOpeningStateShowAccuracytext] = React.useState(false);

  const refs : menuItemRefs = {}
  tracks.forEach((track) => {
      refs[track.language] = React.createRef()
  });

  const handleSubtitleChange = (event: SelectChangeEvent) => {
    setSelectedLanguage(event.target.value);
    //Check if we need to show the accuracy text about the selected language
    if (refs[event.target.value].current?.innerText.endsWith("(auto-generated)")) {
      setShowAccuracytext(true);
    } else {
      setShowAccuracytext(false);
    }
  };
  
  const handleSubtitleSwitch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLanguageSelectDisabled(!event.target.checked);
  }

  const handleCancel = () => {
    setLanguageSelectDisabled(openingStateLanguageSelectDisabled);
    setSelectedLanguage(openingStateSelectedLanguage);
    setShowAccuracytext(openingStateShowAccuracyText);

    //hide non typescript menu wrapper
    document.getElementsByClassName("subtitledialogbox")[0].classList.remove("showing");
    document.querySelectorAll("[data-name='Subtitles']")[0].classList.remove("open");
  }

  const handleSave = () => {
    setOpeningStateLanguageSelectDisabled(languageSelectDisabled);
    setOpeningStateSelectedLanguage(selectedLanguage);
    setOpeningStateShowAccuracytext(showAccuracyText);

    //enable subtitle on video element
    const textTracks: TextTrackList = player.elem.find("video")[0].textTracks;

    Array.from(textTracks).forEach((track) => {
      track.mode = selectedLanguage === track.language ? 
        (languageSelectDisabled ? 'hidden' : 'showing') :
        'hidden';
    });

    //hide non typescript menu wrapper
    document.getElementsByClassName("subtitledialogbox")[0].classList.remove("showing");
    document.querySelectorAll("[data-name='Subtitles']")[0].classList.remove("open");
  }

  return (
    <div className='anno subtitledialogbox' data-opener="Subtitles">
      <div className='subtitledialogboxtoggleline'>
        Subtitles 
        <SubtitleSwitch 
          inputProps={{ 'aria-label': 'Toggle subtitles' }} 
          onChange={handleSubtitleSwitch}
          checked={!languageSelectDisabled}
        />
      </div>
      <div className='subtitledialogboxlanguage'>
        <span>Language</span>
        <ThemeProvider theme={muiTheme}>
          <FormControl fullWidth={true} sx={{ m: '8px 0', minWidth: 120}}>
            <Select
              value={selectedLanguage}
              onChange={handleSubtitleChange}
              displayEmpty
              inputProps={{ 'aria-label': 'Without label' }}
              disabled={languageSelectDisabled}
            >
              <MenuItem disabled value="" sx={{color: '#767676', fontSize: '14px'}}>-</MenuItem>
              {tracks.map(track => 
                <MenuItem 
                  ref={refs[track.language]}
                  key={track.language} 
                  value={track.language} 
                  sx={{color: '#767676', fontSize: '14px'}}
                >
                  {track.label}
                </MenuItem>
              )}
            </Select>
          </FormControl>
        </ThemeProvider>
      </div>
      {showAccuracyText &&
        <div className='subtitledialogboxaccuracytext'>
          The accuracy of auto-generated captions is not verified, and may vary depending on the language and audio quality.
        </div>
      }
      <ThemeProvider theme={muiTheme}>
        <div className='subtitledialogboxbuttons'>
          <Button 
          variant="outlined" 
          style={{
              borderRadius: 4,
              borderColor: "#0a72cc",
              color: "#0a72cc",
              padding: "9px",
              fontWeight: 600,
              lineHeight: "18px",
              height: "36px"
            }}
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button 
            variant="contained"
            style={{
              borderRadius: 4,
              backgroundColor: "#0a72cc",
              padding: "9px",
              fontWeight: 600,
              lineHeight: "18px",
              height: "36px"
            }}
            onClick={handleSave}
          >
            Save
          </Button>
        </div>
      </ThemeProvider>
    </div>
    );
};