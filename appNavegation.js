import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './frontend/src/screens/Auth/LoginScreen';
import RegisterScreen from './frontend/src/screens/Auth/RegisterScreen';
import HomeScreen from './frontend/src/screens/HomeScreen';
import ProfileScreen from './frontend/src/screens/ProfileScreen';
import PaymentScreen from './frontend/src/screens/PaymentScreen';
import DestinationDetailScreen from './frontend/src/screens/DestinationDetailScreen';
import ActivityFormScreen from './frontend/src/screens/ActivityFormScreen';
import PlanningScreen from './frontend/src/screens/PlanningScreen';

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
      <MainAppStack.Screen name="Payment" component={PaymentScreen} options={{ title: 'Pago' }} />
      <MainAppStack.Screen name="DestinationDetail" component={DestinationDetailScreen} options={{ title: 'Detalles' }} />
      {/* Agregar las nuevas pantallas */}
      <MainAppStack.Screen name="Planning" component={PlanningScreen} options={{ title: 'Mi Planificación' }} />
      <MainAppStack.Screen name="ActivityForm" component={ActivityFormScreen} options={{ title: 'Nueva Actividad' }} />
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