//frontend/src/screens/ProfileScreen.js
import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Button } from 'react-native'; // Asegúrate de importar Button
import { useProfile } from '../context/PerfileContext'; 
import { ThemeContext } from '../context/ThemeContext';
import { useContext } from 'react';


const ProfileScreen = () => {
  const { profile, loading: profileLoading, error: profileError, refreshProfile } = useProfile();
 // const { profile, loading: profileLoading, error: profileError, loadAndSyncProfile } = useProfile();

  const {colors} = useContext(ThemeContext);
  const styles = makeStyles(colors);



  const formatField = (value) => {
    if (value == null || value === '') return 'N/A'; // Considerar cadenas vacías como N/A
    if (Array.isArray(value)) return value.length > 0 ? value.join(', ') : 'N/A';
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value !== null) {
      try {
        const vals = Object.values(value);
        if (vals.length) return vals.join(', ');
        return JSON.stringify(value);
      } catch {
        return String(value);
      }
    }
    return String(value);
  };

  if (profileLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Cargando perfil...</Text>
      </View>
    );
  }

  if (profileError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error al cargar el perfil: {profileError.message || 'Desconocido'}</Text>
        <Button title="Reintentar" onPress={refreshProfile} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.centered}>
        <Text>No hay datos de perfil disponibles.</Text>
        <Button title="Cargar Perfil" onPress={refreshProfile} />
      </View>
    );
  }
  console.log('Datos del perfil recibidos:', profile);
 
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Mi Perfil</Text>
      
      <View style={styles.profileImageContainer}>
        <Text style={styles.profileImageText}>{profile.nombreCompleto ? profile.nombreCompleto[0].toUpperCase() : 'U'}</Text>
      </View>
      
      <View style={styles.infoCard}>
        <Text style={styles.label}>UID:</Text>
        <Text style={styles.value}>{formatField(profile.id)}</Text> 
      </View>
      <View style={styles.infoCard}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{formatField(profile.email)}</Text>
      </View>
      <View style={styles.infoCard}>
        <Text style={styles.label}>Nombre de Usuario:</Text>
        <Text style={styles.value}>{formatField(profile.nombreUsuario)}</Text>
      </View>
      <View style={styles.infoCard}>
        <Text style={styles.label}>Nombre Completo:</Text>
        <Text style={styles.value}>{formatField(profile.nombreCompleto)}</Text>
      </View>
      <View style={styles.infoCard}>
        <Text style={styles.label}>País:</Text>
        <Text style={styles.value}>{formatField(profile.pais)}</Text>
      </View>
      <View style={styles.infoCard}>
        <Text style={styles.label}>Preferencias de Viaje:</Text>
        <Text style={styles.value}>{formatField(profile.preferenciasViaje)}</Text> 
      </View>
      <View style={styles.infoCard}>
        <Text style={styles.label}>Intereses:</Text>
        <Text style={styles.value}>{formatField(profile.intereses)}</Text> 
      </View>
      <View style={styles.infoCard}>
        <Text style={styles.label}>Actividades Preferidas:</Text>
        <Text style={styles.value}>{formatField(profile.actividadesPreferidas)}</Text>
      </View>
      {/* Noté que no tienes 'edad' directamente, pero sí 'fechaDeNacimiento' */}
      {profile.fechaDeNacimiento && (
        <View style={styles.infoCard}>
          <Text style={styles.label}>Fecha de Nacimiento:</Text>
          <Text style={styles.value}>{new Date(profile.fechaDeNacimiento).toLocaleDateString()}</Text>
          </View>
      )}
      <View style={styles.infoCard}>
        <Text style={styles.label}>Rol:</Text>
        <Text style={styles.value}>{formatField(profile.rol)}</Text>
      </View>
      <View style={styles.infoCard}>
        <Text style={styles.label}>Fecha de Creación:</Text>
        {profile.fechaCreacion && (
          <Text style={styles.value}>{new Date(profile.fechaCreacion).toLocaleDateString()}</Text>

        )}
      </View>
    </ScrollView>
  );

};

function makeStyles(colors) {
    return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    contentContainer: {
      padding: 20,
      paddingBottom: 40,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 20,
    },
    profileImageContainer: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: '#a0aec0',
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
      marginBottom: 20,
    },
    profileImageText: {
      fontSize: 40,
      fontWeight: 'bold',
      color: '#ffffff',
    },
    infoCard: {
      backgroundColor: '#ffffff',
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 10,
      marginBottom: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    label: {
      fontSize: 12,
      color: '#6b7280',
      marginBottom: 4,
      fontWeight: '600',
    },
    value: {
      fontSize: 16,
      color: '#111827',
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
  });

}
export default ProfileScreen;