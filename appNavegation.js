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
import PaymentScreen from './frontend/src/screens/PaymentScreen';
import DestinationDetailScreen from './frontend/src/screens/DestinationDetailScreen';
import SettingsScreen from './frontend/src/screens/SettingScreen';
import ForoListScreen from './frontend/src/screens/ForoListScreen';
import ForoDetailScreen from './frontend/src/screens/ForoDetailScreen';
import CrearForoScreen from './frontend/src/screens/CrearForoScreen'; // Corregido el typo "CrearForocreen" a "CrearForoScreen"
import EditProfileScreen from './frontend/src/screens/EditProfileScreen';
import MapScreen from './frontend/src/screens/MapScreen';
import DestinoDetailScreen from './frontend/src/screens/DestinoDetailScreen';
import ReservaScreen from './frontend/src/screens/ReservaScreen';
//EditProfileScreen

// --- Instancias de Navigators ---
const AuthStack = createStackNavigator();
const MainAppStack = createStackNavigator();
const HomeStack = createStackNavigator();
const ForoStack = createStackNavigator();
const ProfileStack = createStackNavigator();
const Tab = createBottomTabNavigator();
const MapStack = createStackNavigator();


const AuthNavigator = () => {

  const {color} = useContext(ThemeContext);
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
};


const HomeStackNavigator = () => {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeScreen" component={HomeScreen} />
      <HomeStack.Screen name="Profile" component={ProfileScreen} />
      <HomeStack.Screen name="Settings" component={SettingsScreen} />
      <HomeStack.Screen name="DestinoDetailScreen" component={DestinoDetailScreen} />
      <HomeStack.Screen name="ReservaScreen" component={ReservaScreen} />
      <HomeStack.Screen name="PaymentScreen" component={PaymentScreen} />
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
      <ProfileStack.Screen name="Home" component={HomeScreen} options={{ title: 'Bienvenido' }} />
      <ProfileStack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Mi Perfil' }} />
      <ProfileStack.Screen name="Payment" component={PaymentScreen} options={{ title: 'Pago' }} />
      <ProfileStack.Screen name="DestinationDetail" component={DestinationDetailScreen} options={{ title: 'Detalles' }} />
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


const AppTabNavigator = () => {
  const { colors } = useContext(ThemeContext);

  return (

    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
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
      <Tab.Screen
        name="InicioTab"
        component={HomeStackNavigator}
        options={{ title: 'Inicio' }}
      />
      <Tab.Screen
          name="MapaTab"
          component={MapStackNavigator}
          options={{ title: 'Mapa' }}
      />
      <Tab.Screen
        name="ForosTab"
        component={ForoStackNavigator}
        options={{ title: 'Foros' }}
      />
      <Tab.Screen
        name="PerfilTab"
        component={ProfileStackNavigator}
        options={{ title: 'Perfil' }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsStackNavigator} 
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
};

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

const AppOrAuthNavigator = ({ isAuthenticated }) => {
    return isAuthenticated ? <AppMainNavigator /> : <AuthNavigator />;
};

export default AppOrAuthNavigator;