//frontend/src/screens/HomeScreen.js
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { useProfile } from '../context/PerfileContext';
import { ThemeContext } from '../context/ThemeContext';
import { useContext } from 'react';


const HomeScreen = ({ navigation }) => {
  const { colors } = useContext(ThemeContext);
  const { logout } = useAuth();
  const { profile, loading: profileLoading, error: profileError } = useProfile();
  const styles = makeStyles(colors);


  if (profileLoading) {
    return (
      <View style={styles.centered}>
        <Text>Cargando perfil...</Text>
      </View>
    );
  }

  if (profileError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error al cargar el perfil: {profileError.message || 'Desconocido'}</Text>
        <Button title="Cerrar Sesión" onPress={logout} color="red" />
      </View>
    );
  }



  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>¡Bienvenido, {profile?.nombreUsuario || profile?.nombreCompleto || profile?.email || 'usuario'}!</Text>
      <Text style={styles.detailText}>Email: {profile?.email || 'N/A'}</Text>
      <Text style={styles.detailText}>País: {profile?.pais || 'N/A'}</Text>
      <Text style={styles.detailText}>Preferencias: {Array.isArray(profile?.preferenciasViaje) ? profile.preferenciasViaje.join(', ') : profile?.preferenciasViaje || 'N/A'}</Text>


      <Button title="configuracion" onPress={() => navigation.navigate('Settings')} />
      <Button title="Cerrar Sesión" onPress={logout} color="red" />
    </View>
  );
};


function makeStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      backgroundColor: colors.background,
    },
    welcomeText: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
      color: colors.text,
    },
    detailText: {
      fontSize: 16,
      marginBottom: 10,
      color: '#34495e',
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorText: {
      color: 'red',
      fontSize: 16,
      marginBottom: 20,
      textAlign: 'center',
    }
  })
};


export default HomeScreen;