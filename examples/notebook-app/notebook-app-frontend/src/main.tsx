import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { AuthProvider } from 'react-oidc-context';
import './index.css';
import App from './App.tsx';

const cognitoAuthConfig = {
    authority: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_u7btsbyLO",
    client_id: "6a7vkm488bfbsl68ulu2pgeucu",
    redirect_uri: "http://localhost:5173",
    response_type: "code",
    scope: "email openid phone",
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <BrowserRouter>
          <AuthProvider
              authority={cognitoAuthConfig.authority}
              client_id={cognitoAuthConfig.client_id}
              redirect_uri={cognitoAuthConfig.redirect_uri}
              response_type={cognitoAuthConfig.response_type}
              scope={cognitoAuthConfig.scope}
          >
            <App />
          </AuthProvider>
      </BrowserRouter>
  </StrictMode>
);
