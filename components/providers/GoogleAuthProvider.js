'use client';
import { GoogleOAuthProvider } from '@react-oauth/google';

export default function GoogleAuthProvider({ children }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId || clientId === 'your_google_client_id_here') {
    return <>{children}</>;
  }
  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
}
