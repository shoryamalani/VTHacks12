import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ThemeProvider, createTheme } from '@material-ui/core';

const theme = createTheme({
    palette: {
        type: 'dark',
    },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
<ThemeProvider theme={theme}><GoogleOAuthProvider clientId="533212748008-0n4tlu03uftr9dtshj0i14gokv2f6ijb.apps.googleusercontent.com">
<React.StrictMode><App /></React.StrictMode></GoogleOAuthProvider></ThemeProvider>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
