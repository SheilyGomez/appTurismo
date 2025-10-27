import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './frontend/src/screens/Auth/LoginScreen';
import RegisterScreen from './frontend/src/screens/Auth/RegisterScreen';
import HomeScreen from './frontend/src/screens/HomeScreen';
import ProfileScreen from './frontend/src/screens/ProfileScreen';


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
    <MainAppStack.Navigator initialRouteName="Home">
      <MainAppStack.Screen name="Home" component={HomeScreen} options={{ title: 'Bienvenido' }} />
      <MainAppStack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Mi Perfil' }} />
      
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