// services/googleCalendarService.js
import * as Google from 'expo-auth-session/providers/google';
import { auth } from './firebaseConfig';
import { signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import Constants from 'expo-constants';

const CLIENT_ID = "345542873305-2raru5b4rmn2ll4oivsl4eofnvr7m6ci.apps.googleusercontent.com"; // ← Cámbialo

export const signInWithGoogle = async () => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: CLIENT_ID,
    redirectUri: Constants.appOwnership === 'standalone'
      ? 'com.tuapp://redirect'  // Si usas custom scheme
      : 'https://auth.expo.io/@tu-usuario/tu-proyecto', // Expo Go
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });

  if (response?.type === 'success') {
    const { id_token } = response.params;
    const credential = GoogleAuthProvider.credential(id_token);
    await signInWithCredential(auth, credential);
    return id_token;
  }
  return null;
};

export const createCalendarEvent = async (accessToken, event) => {
  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  });
  return await response.json();
};