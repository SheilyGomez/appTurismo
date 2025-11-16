import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../auth/firebaseConfig';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect, useCallback,useContext } from 'react'; 
import { useIsFocused } from '@react-navigation/native'; 
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeContext } from '../context/ThemeContext';
import { 
  getAllItinerarios, 
  updateItinerarioGoogleSync, 
  initItinerarioDatabase 
} from '../bd/ItinerarioSQLite';

WebBrowser.maybeCompleteAuthSession();

const COLORS = {
  primary: '#79B425',
  secondary: '#C0DE7B',
  background: '#FFFFFF',
  text: '#054204',
  button: '#1D6517',
  accent: '#55A6C3',
};

const ItinerarioScreen = ({ navigation }) => {
  const { colors } = useContext(ThemeContext);
  const styles = createStyles(colors);
  const [itinerarios, setItinerarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncLoading, setSyncLoading] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const isFocused = useIsFocused()
  

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '816954616540-nojr18f1vjk6ured92mvatm0c90qb5e8.apps.googleusercontent.com',
    scopes: [
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/calendar'
    ],
    redirectUri: AuthSession.makeRedirectUri({
      useProxy: true
    }),
  });

  useEffect(() => {
  try {
    initItinerarioDatabase();
  } catch (error) {
    console.error("Error al inicializar la base de datos al montar:", error);
  }
}, []);

    const loadItinerarios = useCallback(() => {
        console.log("Pantalla en foco, recargando itinerarios...");
        try {
          // La llamada ya no necesita 'await' porque es síncrona
          const localItinerarios = getAllItinerarios();
          setItinerarios(localItinerarios);
        } catch (error) {
          console.error("Error cargando itinerarios:", error);
          Alert.alert("Error", "No se pudieron cargar los itinerarios.");
        } finally {
          setLoading(false);
        }
      }, []);
    useEffect(() => {
      if (isFocused) {
        loadItinerarios();
      }
    }, [isFocused, loadItinerarios]);


   useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      setAccessToken(authentication.accessToken);
      Alert.alert("Éxito", "Autenticación con Google exitosa");
    }
  }, [response]);

  

  
  const syncWithGoogleCalendar = async (itinerario) => {
    if (!accessToken) {
      Alert.alert("Error", "Primero debes autenticarte con Google");
      return;
    }

    setSyncLoading(true);
    try {
      const event = {
        summary: `Viaje: ${itinerario.nombre}`,
        description: `Itinerario de viaje a ${itinerario.destino}. Creado desde Mi App de Viajes.`,
        start: {
          dateTime: itinerario.fechaInicio.toISOString(),
          timeZone: 'America/Lima',
        },
        end: {
          dateTime: itinerario.fechaFin.toISOString(),
          timeZone: 'America/Lima',
        },
        location: itinerario.destino,
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 60 },
          ],
        },
      };

      const response = await axios.post(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        event,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      await updateItinerarioGoogleSync(itinerario.id, response.data.id);
      
      Alert.alert(
        "¡Éxito!", 
        `Evento "${itinerario.nombre}" sincronizado con Google Calendar`
      );
      
      loadItinerarios();
      
    } catch (error) {
      console.error('Error sincronizando con Google Calendar:', error);
      Alert.alert(
        "Error", 
        "No se pudo sincronizar con Google Calendar. Verifica tu conexión."
      );
    } finally {
      setSyncLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.itinerarioCard}>
      <Text style={styles.cardTitle}>{item.nombre || 'Itinerario de Viaje'}</Text>
      <Text style={styles.cardDetail}>🗺️ Destino: {item.destino || 'No especificado'}</Text>
      
      <Text style={styles.cardDetail}>
        📅 Fechas: {item.fechaInicio.toLocaleDateString()} - {item.fechaFin.toLocaleDateString()}
      </Text>

      <Text style={styles.cardDetail}>
        🕐 Creado: {item.fechaCreacion.toLocaleDateString()}
      </Text>

      {item.syncWithGoogle ? (
        <View style={styles.syncStatus}>
          <Text style={styles.syncedText}>✅ Sincronizado con Google Calendar</Text>
        </View>
      ) : (
        <TouchableOpacity 
          style={styles.syncButton}
          onPress={() => syncWithGoogleCalendar(item)}
          disabled={syncLoading}
        >
          <Text style={styles.syncButtonText}>
            {syncLoading ? 'Sincronizando...' : '📅 Sincronizar con Google Calendar'}
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.loading]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ color: COLORS.text }}>Cargando itinerarios...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>✈️ Mis Itinerarios de Viaje</Text>

      {!accessToken && (
        <View style={styles.authContainer}>
          <Text style={styles.authText}>Para sincronizar con Google Calendar:</Text>
          <TouchableOpacity
            style={styles.authButton}
            onPress={() => promptAsync()}
            disabled={!request}
          >
            <Text style={styles.authButtonText}>🔑 Iniciar Sesión con Google</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={itinerarios}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aún no tienes viajes planeados.</Text>
          </View>
        )}
      />

      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => navigation.navigate("CrearItinerario")}
      >
        <Text style={styles.addButtonText}>+ Nuevo Itinerario</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    paddingVertical: 15,
    backgroundColor: colors.textPrimary,
  },
  authContainer: {
    backgroundColor: colors.background,
    padding: 15,
    margin: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: colors.header,
  },
  authText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 10,
  },
  authButton: {
    backgroundColor: colors.header,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  authButtonText: {
    color: colors.text,
    fontWeight: 'bold',
  },
  itinerarioCard: {
    backgroundColor: colors.sub_background,
    borderRadius: 12,
    padding: 18,
    marginHorizontal: 15,
    marginVertical: 10,
    borderLeftWidth: 6,
    borderLeftColor: colors.textPrimary,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  cardDetail: {
    fontSize: 14,
    color: colors.text,
    paddingVertical: 2,
  },
  syncStatus: {
    marginTop: 10,
    padding: 8,
    backgroundColor: colors.background,
    borderRadius: 6,
  },
  syncedText: {
    color: '#2E7D32',
    fontSize: 12,
    fontWeight: 'bold',
  },
  syncButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: colors.text,
    borderRadius: 6,
    alignItems: 'center',
  },
  syncButtonText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  emptyText: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 25,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: colors.bottomItinerario,
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 30,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  addButtonText: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: "center"
  },
});

export default ItinerarioScreen;