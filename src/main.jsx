import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Auth0Provider } from '@auth0/auth0-react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Auth0Provider
      domain="dev-fir4couee0o8jsdl.us.auth0.com"
      clientId="cONfEqPt9ivEGqWHxQRsi55LxZlN89As"
      authorizationParams={{
        redirect_uri: window.location.origin
      }}
      cacheLocation='localstorage'
    >
      <BrowserRouter>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </BrowserRouter>
    </Auth0Provider>
  </StrictMode>
)


