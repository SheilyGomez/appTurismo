// services/googleCalendarClient.js
import * as AuthSession from 'expo-auth-session';

// Configuración - reemplaza con tu CLIENT_ID OAuth para Android/iOS/Expo
// Debes crear credenciales OAuth 2.0 en Google Cloud Console y añadir los redirect URIs de Expo.
// Para pruebas rápidas en Expo, puedes usar el "CLIENT_ID" de tipo "iOS/Android" o "Web" según corresponda.
const CLIENT_ID = "<TU_CLIENT_ID_GOOGLE>"; // <-- reemplaza
const SCOPES = ["https://www.googleapis.com/auth/calendar.events", "profile", "email"];

const discovery = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
};

export async function requestGoogleAuthAsync() {
  const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });
  const authUrl = `${discovery.authorizationEndpoint}?response_type=token&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(SCOPES.join(" "))}&prompt=consent`;

  const result = await AuthSession.startAsync({ authUrl });
  // result.type === 'success' and result.params.access_token
  if (result.type === "success") {
    // result.params.access_token
    return result.params.access_token;
  }
  throw new Error("Autenticación cancelada o fallida");
}

export async function crearEventoGoogle(accessToken, calendarId = "primary", event) {
  // event: objeto con start/end/summary/description
  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`;
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(event)
  });
  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`Error Google Calendar API: ${resp.status} ${txt}`);
  }
  return resp.json();
}
