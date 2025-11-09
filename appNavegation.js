import React, { use, useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialIcons } from '@expo/vector-icons'; // Para los iconos de las pestañas
import { useTheme } from '@react-navigation/native'; // Para acceder al tema si usas @react-navigation/native >= 5.x y tienes un ThemeContext
import { ThemeContext } from './frontend/src/context/ThemeContext';


// Asegúrate de que estas rutas sean correctas para tu proyecto.
import LoginScreen from './frontend/src/screens/Auth/LoginScreen';
import RegisterScreen from './frontend/src/screens/Auth/RegisterScreen';
import HomeScreen from './frontend/src/screens/HomeScreen';
import ProfileScreen from './frontend/src/screens/ProfileScreen';
import SettingsScreen from './frontend/src/screens/SettingScreen';
import ForoListScreen from './frontend/src/screens/ForoListScreen';
import ForoDetailScreen from './frontend/src/screens/ForoDetailScreen';
import CrearForoScreen from './frontend/src/screens/CrearForoScreen'; // Corregido el typo "CrearForocreen" a "CrearForoScreen"
import EditProfileScreen from './frontend/src/screens/EditProfileScreen';
import MapScreen from './frontend/src/screens/MapScreen';
import DestinoDetailScreen from './frontend/src/screens/DestinoDetailScreen';
//EditProfileScreen

// --- Instancias de Navigators ---
const AuthStack = createStackNavigator();
const MainAppStack = createStackNavigator(); // Este Stack contendrá el Tab Navigator
const HomeStack = createStackNavigator();    // Stack para la pestaña de Inicio
const ForoStack = createStackNavigator();    // Stack para la pestaña de Foros
const ProfileStack = createStackNavigator(); // Stack para la pestaña de Perfil
const Tab = createBottomTabNavigator();      // Instancia del Bottom Tab Navigator
const MapStack = createStackNavigator();

// --- 1. Navegador de Autenticación (AuthNavigator) ---
// Pantallas accesibles solo antes de iniciar sesión
const AuthNavigator = () => {

  const {color} = useContext(ThemeContext);
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
};

// --- 2. Stacks individuales para cada pestaña (Tab Stacks) ---
// Cada uno gestiona su propia pila de navegación dentro de su pestaña.
// `screenOptions={{ headerShown: false }}` para que el encabezado lo gestione el componente Stack dentro del Tab
const HomeStackNavigator = () => {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeScreen" component={HomeScreen} />
      <HomeStack.Screen name="Profile" component={ProfileScreen} />
      <HomeStack.Screen name="Settings" component={SettingsScreen} />
      {/* Puedes agregar pantallas que se inicien desde la pantalla principal aquí,
          y que quieres que mantengan la misma pila de navegación de "Inicio". */}
      {/* <HomeStack.Screen name="DetalleNoticia" component={DetalleNoticiaScreen} /> */}
    </HomeStack.Navigator>
  );
};

const ForoStackNavigator = () => {
  return (
    <ForoStack.Navigator screenOptions={{ headerShown: false }}>
      <ForoStack.Screen name="ForoListScreen" component={ForoListScreen} />
      <ForoStack.Screen name="ForoDetail" component={ForoDetailScreen} />
      <ForoStack.Screen name="CrearForo" component={CrearForoScreen} />
    </ForoStack.Navigator>
  );
};

const ProfileStackNavigator = () => {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileScreen" component={ProfileScreen} />
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
      {/* `SettingsScreen` puede estar dentro de esta pila si se accede desde el perfil
          y quieres que el BottomTabNavigator siga visible. */}
      <ProfileStack.Screen name="Settings" component={SettingsScreen} />
    </ProfileStack.Navigator>
  );
};
const SettingsStackNavigator = () => {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="Settings" component={SettingsScreen} />
    </ProfileStack.Navigator>
  );
};

//Componente del Stack Navigator para el Mapa ---
const MapStackNavigator = () => {
    return (
        <MapStack.Navigator screenOptions={{ headerShown: false }}>
            <MapStack.Screen name="MapScreen" component={MapScreen} />
            <MapStack.Screen name="DestinoDetail" component={DestinoDetailScreen} />
        </MapStack.Navigator>
    );
};

// --- 3. Bottom Tab Navigator (AppTabNavigator) ---
// Contiene las pestañas principales de la aplicación.
const AppTabNavigator = () => {
  // Puedes usar useTheme() si has configurado un tema en React Navigation
  const { colors } = useContext(ThemeContext);

  return (

    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false, // Oculta el encabezado del propio Tab Navigator
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          let IconComponent = Ionicons; 

          if (route.name === 'InicioTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'MapaTab') {
              iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'ForosTab') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'PerfilTab') {
            iconName = focused ? 'person' : 'person-outline';
          }else if (route.name === 'SettingsTab') {
            iconName = focused ? 'settings' : 'settings-outline';
          }
          

          return <IconComponent name={iconName} size={size} color={color} />;
        },
        // Estilos para la barra de pestañas y sus elementos
        tabBarActiveTintColor: colors.secondary, // Color de los iconos y texto activo (azul por defecto)
        tabBarInactiveTintColor: colors.text, // Color inactivo
        tabBarStyle: {
          backgroundColor: colors.sub_background, // Color de fondo de la barra de pestañas
          borderTopWidth: 0,        // Eliminar línea superior si no la quieres
          elevation: 20,            // Sombra en Android
          height: 70,               // Altura de la barra
          paddingBottom: 20,         // Relleno inferior
          paddingTop: 5,            // Relleno superior
        },
        tabBarLabelStyle: {
            fontSize: 10,
            color: colors.text,
        },
      })}
    >
      <Tab.Screen
        name="InicioTab"
        component={HomeStackNavigator} // Se usa el Stack Navigator para Inicio
        options={{ title: 'Inicio' }}
      />
      <Tab.Screen
          name="MapaTab"
          component={MapStackNavigator} // Usamos el Stack Navigator del Mapa
          options={{ title: 'Mapa' }}
      />
      <Tab.Screen
        name="ForosTab"
        component={ForoStackNavigator} // Se usa el Stack Navigator para Foros
        options={{ title: 'Foros' }}
      />
      <Tab.Screen
        name="PerfilTab"
        component={ProfileStackNavigator} // Se usa el Stack Navigator para Perfil
        options={{ title: 'Perfil' }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsStackNavigator} 
        options={{ title: 'Settings' }}
      />
      {/* Agrega más `Tab.Screen` aquí para cada pestaña */}
    </Tab.Navigator>
  );
};

// --- 4. Navegador Principal de la Aplicación (AppMainNavigator) ---
// Aquí es donde anidamos el Tab Navigator.
// Las pantallas aquí NO tendrán el BottomTabNavigator si se navega directamente a ellas.
const AppMainNavigator = () => {
  return (
    <MainAppStack.Navigator screenOptions={{ headerShown: false }}>
      {/* La primera pantalla que se muestra en la aplicación es el Tab Navigator */}
      <MainAppStack.Screen name="MainTabs" component={AppTabNavigator} />

      {/* EJEMPLO: Si tuvieras una pantalla "GlobalSettings" que no debe tener tabs,
          y a la que se navega desde alguna parte dentro de los tabs:
          <MainAppStack.Screen name="GlobalSettings" component={GlobalSettingsScreen} />
          
          En este caso, "Settings" ya está dentro de ProfileStackNavigator,
          por lo que tiene los tabs. Si quieres que "Settings" NO tenga tabs,
          deberías moverla aquí y quitarla del ProfileStackNavigator.
      */}
    </MainAppStack.Navigator>
  );
};

// --- 5. Componente Root para decidir la navegación (AppOrAuthNavigator) ---
// Este componente de alto nivel decide si el usuario ve la autenticación o la app principal.
const AppOrAuthNavigator = ({ isAuthenticated }) => {
    return isAuthenticated ? <AppMainNavigator /> : <AuthNavigator />;
};

export default AppOrAuthNavigator;