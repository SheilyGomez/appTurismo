import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from './frontend/src/context/ThemeContext';

// Pantallas
import LoginScreen from './frontend/src/screens/Auth/LoginScreen';
import RegisterScreen from './frontend/src/screens/Auth/RegisterScreen';
import HomeScreen from './frontend/src/screens/HomeScreen';
import ProfileScreen from './frontend/src/screens/ProfileScreen';
import PaymentScreen from './frontend/src/screens/PaymentScreen';
import DestinationDetailScreen from './frontend/src/screens/DestinationDetailScreen';
import SettingsScreen from './frontend/src/screens/SettingScreen';
import ForoListScreen from './frontend/src/screens/ForoListScreen';
import ForoDetailScreen from './frontend/src/screens/ForoDetailScreen';
import CrearForoScreen from './frontend/src/screens/CrearForoScreen';
import EditProfileScreen from './frontend/src/screens/EditProfileScreen';
import ItinerarioScreen from './frontend/src/screens/ItinerarioScreen';
import CrearItinerarioScreen from './frontend/src/screens/CrearItinerarioScreen';
import DestinoDetailScreen from './frontend/src/screens/DestinoDetailScreen';
import ReservaScreen from './frontend/src/screens/ReservaScreen';
import MapScreen from './frontend/src/screens/MapScreen';

// --- Instancias de Navigators ---
const AuthStack = createStackNavigator();
const MainAppStack = createStackNavigator();
const HomeStack = createStackNavigator();
const ForoStack = createStackNavigator();
const ProfileStack = createStackNavigator();
const Tab = createBottomTabNavigator();
const MapStack = createStackNavigator();
const ItinerarioStack = createStackNavigator();

// --- Stack de autenticación ---
const AuthNavigator = () => {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
};

// --- Stack del inicio ---
const HomeStackNavigator = () => {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeScreen" component={HomeScreen} />
      <HomeStack.Screen name="Profile" component={ProfileScreen} />
      <HomeStack.Screen name="Settings" component={SettingsScreen} />
      <HomeStack.Screen name="ItinerarioScreen" component={ItinerarioScreen} />
      <HomeStack.Screen name="DestinoDetailScreen" component={DestinoDetailScreen} />
      <HomeStack.Screen name="ReservaScreen" component={ReservaScreen} />
      <HomeStack.Screen name="PaymentScreen" component={PaymentScreen} />
    </HomeStack.Navigator>
  );
};

// --- Stack de foros ---
const ForoStackNavigator = () => {
  return (
    <ForoStack.Navigator screenOptions={{ headerShown: false }}>
      <ForoStack.Screen name="ForoListScreen" component={ForoListScreen} />
      <ForoStack.Screen name="ForoDetail" component={ForoDetailScreen} />
      <ForoStack.Screen name="CrearForo" component={CrearForoScreen} />
    </ForoStack.Navigator>
  );
};

// --- Stack de perfil ---
const ProfileStackNavigator = () => {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileScreen" component={ProfileScreen} />
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} />
    </ProfileStack.Navigator>
  );
};

// --- Stack para itinerarios (CORREGIDO) ---
const ItinerarioStackNavigator = () => {
  return (
    <ItinerarioStack.Navigator screenOptions={{ headerShown: false }}>
      <ItinerarioStack.Screen name="ItinerarioScreen" component={ItinerarioScreen} />
      <ItinerarioStack.Screen name="CrearItinerarioScreen" component={CrearItinerarioScreen} />
    </ItinerarioStack.Navigator>
  );
};

// --- Stack de ajustes ---
const SettingsStackNavigator = () => {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="Settings" component={SettingsScreen} />
      <ProfileStack.Screen name="Home" component={HomeScreen} options={{ title: 'Bienvenido' }} />
      <ProfileStack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Mi Perfil' }} />
      <ProfileStack.Screen name="Payment" component={PaymentScreen} options={{ title: 'Pago' }} />
      <ProfileStack.Screen name="DestinationDetail" component={DestinationDetailScreen} options={{ title: 'Detalles' }} />
    </ProfileStack.Navigator>
  );
};

// --- Stack del mapa ---
const MapStackNavigator = () => {
  return (
    <MapStack.Navigator screenOptions={{ headerShown: false }}>
      <MapStack.Screen name="MapScreen" component={MapScreen} />
      <MapStack.Screen name="DestinoDetail" component={DestinoDetailScreen} />
    </MapStack.Navigator>
  );
};

// --- Navegación principal con Tabs ---
const AppTabNavigator = () => {
  const { colors } = useContext(ThemeContext);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'InicioTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'MapaTab') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'ForosTab') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'PerfilTab') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'SettingsTab') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else if (route.name === 'ItinerarioTab') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.secondary,
        tabBarInactiveTintColor: colors.text,
        tabBarStyle: {
          backgroundColor: colors.sub_background,
          borderTopWidth: 0,
          elevation: 20,
          height: 70,
          paddingBottom: 20,
          paddingTop: 5,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          color: colors.text,
        },
      })}
    >
      <Tab.Screen name="InicioTab" component={HomeStackNavigator} options={{ title: 'Inicio' }} />
      <Tab.Screen name="MapaTab" component={MapStackNavigator} options={{ title: 'Mapa' }} />
      <Tab.Screen name="ForosTab" component={ForoStackNavigator} options={{ title: 'Foros' }} />
      <Tab.Screen name="PerfilTab" component={ProfileStackNavigator} options={{ title: 'Perfil' }} />
      <Tab.Screen name="SettingsTab" component={SettingsStackNavigator} options={{ title: 'Settings' }} />
      <Tab.Screen name="ItinerarioTab" component={ItinerarioStackNavigator} options={{ title: 'Itinerario' }} />
    </Tab.Navigator>
  );
};

// --- Navegador principal de la app ---
const AppMainNavigator = () => {
  return (
    <MainAppStack.Navigator screenOptions={{ headerShown: false }}>
      <MainAppStack.Screen name="MainTabs" component={AppTabNavigator} />
    </MainAppStack.Navigator>
  );
};

// --- Elección entre app o autenticación ---
const AppOrAuthNavigator = ({ isAuthenticated }) => {
  return isAuthenticated ? <AppMainNavigator /> : <AuthNavigator />;
};

export default AppOrAuthNavigator;
