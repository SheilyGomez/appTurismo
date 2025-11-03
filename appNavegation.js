import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './frontend/src/screens/Auth/LoginScreen';
import RegisterScreen from './frontend/src/screens/Auth/RegisterScreen';
import HomeScreen from './frontend/src/screens/HomeScreen';
import ProfileScreen from './frontend/src/screens/ProfileScreen';
import SettingsScreen from './frontend/src/screens/SettingScreen';
import ForoListScreen from './frontend/src//screens/ForoListScreen'; // Nueva
import ForoDetailScreen from './frontend/src/screens/ForoDetailScreen'; // Nueva
import CrearForocreen from './frontend/src/screens/CrearForoScreen'; // Nueva


const AuthStack = createStackNavigator();
const MainAppStack = createStackNavigator();

const AuthNavigator = () => {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
};

const AppMainNavigator = () => {
  return (
    <MainAppStack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
      <MainAppStack.Screen name="Home" component={HomeScreen} options={{ title: 'Bienvenido' }} />
      <MainAppStack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Mi Perfil' }} />
      <MainAppStack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Configuración' }} />
      <MainAppStack.Screen name="ForoList" component={ForoListScreen} options={{ title: 'Foros' }} />
      <MainAppStack.Screen name="ForoDetail" component={ForoDetailScreen} options={{ title: 'Detalle del Foro' }} />
      <MainAppStack.Screen name="CrearForo" component={CrearForocreen} options={{ title: 'Crear Foro' }} /> 
      
    </MainAppStack.Navigator>
  );
};

// Este componente decide cuál de los navegadores mostrar
const AppOrAuthNavigator = ({ isAuthenticated }) => {
    // Si isAuthenticated es true, muestra el navegador de la aplicación principal.
    // De lo contrario, muestra el navegador de autenticación (Login/Register).
    return isAuthenticated ? <AppMainNavigator /> : <AuthNavigator />;
};

export default AppOrAuthNavigator;