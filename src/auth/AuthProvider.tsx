import { Auth0Provider } from '@auth0/auth0-react';
import type { ReactNode } from 'react';

const domain = import.meta.env.VITE_AUTH0_DOMAIN as string | undefined;
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID as string | undefined;
const audience = import.meta.env.VITE_AUTH0_AUDIENCE as string | undefined;

export function hasAuth0Config() {
  return Boolean(domain && clientId);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  if (!hasAuth0Config()) {
    return <>{children}</>;
  }

  return (
    <Auth0Provider
      domain={domain!}
      clientId={clientId!}
      authorizationParams={{
        redirect_uri: import.meta.env.VITE_AUTH0_CALLBACK_URL || window.location.origin,
        audience: audience || undefined,
      }}
      cacheLocation="localstorage"
      useRefreshTokens
    >
      {children}
    </Auth0Provider>
  );
}
