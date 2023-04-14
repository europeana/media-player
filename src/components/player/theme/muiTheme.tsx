import { createTheme } from '@mui/material/styles';

const muiTheme = createTheme({
    typography: {
        allVariants: {
            fontSize: 14,
            fontFamily: ['"Open Sans"', '"Arial"', '"sans-serif"'].join(','),
            color: "#767676"
        }
    },
    shape: {
        borderRadius: 6,
    }, 
    components: {
        MuiInputBase: {
            styleOverrides: {
                root: {
                    fontFamily: ['"Open Sans"', '"Arial"', '"sans-serif"'].join(','),
                    color: "#767676"
                }
            }
        },
        MuiSelect: {
            styleOverrides: {
                select: {
                    padding: "14.5px 12px"
                },
                icon: {
                    color: "#4D4D4D"
                }
            }
        }
    }
});

export { muiTheme };