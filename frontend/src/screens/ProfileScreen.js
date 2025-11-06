import React, { useState, useContext, useEffect } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity,
  Switch, Alert, ScrollView, ActivityIndicator
} from 'react-native';

import Ionicons from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { useProfile } from '../context/PerfileContext';
import { ThemeContext } from '../context/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';


const ProfileScreen = ({ navigation }) => {
  const { profile, loading: profileLoading, isProfileSyncing } = useProfile();
  const {colors } = useContext(ThemeContext);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso requerido', 'Se necesita permiso para acceder a la galería.');
      }
    })();
  }, []);

  if (profileLoading || !profile) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.text, marginTop: 10 }}>
          {profileLoading ? "Cargando perfil..." : "Perfil no disponible."}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: colors.background },]}
    >
      <View style={[styles.headerPlaceholder, { backgroundColor: colors.primary }]} >
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <MaterialIcons name="settings" size={28} color="#fff" />
        </TouchableOpacity>
      </View>



      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          <Image
            source={
              profile?.profileImageUrl ? { uri: profile.profileImageUrl } : require('../../../assets/imagen3.jpeg')
            }
            style={styles.avatar}
          />
        </View>

        <Text style={[styles.nameText, { color: colors.text }]}>
          {profile?.nombreCompleto}
        </Text>

        <Text style={[styles.usernameText, { color: colors.text }]}>
          @{profile?.nombreUsuario}
        </Text>

        {isProfileSyncing && (
          <View style={styles.syncingIndicator}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={{ color: colors.subtext, marginLeft: 5 }}>Sincronizando...</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Text style={styles.editButtonText}>Editar perfil</Text>
        </TouchableOpacity>

      </View>

      <View style={[styles.infoContainer, { backgroundColor: colors.background }]}>

        <InfoItem label="Email" value={profile.email} color={colors.text} icon="mail-outline" />
        <InfoItem label="País" value={profile.pais} color={colors.text} icon="earth-outline" />
        <InfoItem label="Fecha Nacimiento" value={profile.fechaDeNacimiento} color={colors.text} icon="calendar-outline" />
        <InfoItem
          label="Preferencias de viaje"
          value={Array.isArray(profile.preferenciasViaje) ? profile.preferenciasViaje.join(', ') : profile.preferenciasViaje}
          color={colors.text}
          icon="compass-outline"
        />
        <InfoItem
          label="Intereses"
          value={Array.isArray(profile.intereses) ? profile.intereses.join(', ') : profile.intereses}
          color={colors.text}
          icon="sparkles-outline"
        />
        <InfoItem
          label="Actividades preferidas"
          value={Array.isArray(profile.actividadesPreferidas) ? profile.actividadesPreferidas.join(', ') : profile.actividadesPreferidas}
          color={colors.text}
          icon="walk-outline"
        />
      </View>

    </ScrollView>
  );
};


const InfoItem = ({ label, value, color, icon }) => (
  <View style={styles.infoItem}>
    {icon && <Ionicons name={icon} size={20} color={color} style={styles.infoIcon} />}
    <Text style={[styles.infoLabel, { color }]}>{label}:</Text>
    <Text style={[styles.infoValue, { color }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingBottom: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerPlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 20,
  },
  settingsButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    padding: 5,
  },
  profileSection: {
    alignItems: 'center',
    marginTop: -60,

  },
  avatarContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 114,
    height: 114,
    borderRadius: 57,
  },
  nameText: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 10,
    paddingHorizontal: 20,
  },
  usernameText: {
    fontSize: 16,
    marginTop: 4,
  },
  syncingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  editButton: {
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 25,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    marginTop: 25,
    width: '95%',
    borderRadius: 16,
    padding: 20,

  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  infoIcon: {
    marginRight: 10,
  },
  infoLabel: {
    fontWeight: '600',
    fontSize: 15,
    width: 120,

  },
  infoValue: {
    fontSize: 15,
    flex: 1,
  },
  switchContainer: {
    marginTop: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '85%',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
});


export default ProfileScreen;