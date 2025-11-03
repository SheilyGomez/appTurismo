import React, { useState, useContext, useEffect } from 'react';

import Ionicons from 'react-native-vector-icons/Ionicons';

import {  View, Text, StyleSheet, Image, TouchableOpacity, ImageBackground,
  Switch, Alert, ScrollView, } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useProfile } from '../context/PerfileContext';
import { ThemeContext } from '../context/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';

const ProfileScreen = ({ navigation }) => {

  const { profile } = useProfile();
  const { isDarkTheme, toggleTheme, colors } = useContext(ThemeContext);
  const [profileImage, setProfileImage] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState(require('../../../assets/_.jpeg'));

  useEffect(() => {

    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso requerido', 'Se necesita permiso para acceder a la galería.');
      }
    })();
  }, []);

  const pickProfileImage = async () => {

    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }

  };

  return (

    <ScrollView
      contentContainerStyle={[styles.container,{ backgroundColor: colors.background },]}
    >

      <ImageBackground
        source={backgroundImage}
        style={styles.headerBackground}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
      </ImageBackground>

      {/* Sección de perfil */}
      <View style={styles.profileSection}>
        <TouchableOpacity onPress={pickProfileImage} style={styles.avatarContainer}>
          <Image
            source={
              profileImage ? { uri: profileImage } : require('../../../assets/imagen3.jpeg')
            }
            style={styles.avatar}
          />

          <View style={styles.cameraIcon}>
            <MaterialIcons name="photo-camera" size={20} color="#fff" />
          </View>

        </TouchableOpacity>

        <Text style={[styles.nameText, { color: colors.text }]}>
          {profile?.nombreCompleto || 'Usuario'}
        </Text>

        <Text style={[styles.usernameText, { color: colors.subtext }]}>
          @{profile?.usuario || 'user123'}
        </Text>

        {/* Botón editar perfil */}
        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.editButtonText}>Editar perfil</Text>
        </TouchableOpacity>

      </View>

      {/* Información del usuario */}

        <View style={styles.seccion}>
          <View style={styles.infoItem}>
            <Ionicons name="call-outline" style={styles.infoIcon} />
            <Text style={styles.infoLabel}>pais:</Text>
            <Text style={styles.infoValue}> {profile.pais}</Text>
          </View>
        </View>

      <View style={styles.infoContainer}>

        {profile?.pais && (

          <InfoItem label="País" value={profile.pais} color={colors.text} />

        )}

        {profile?.preferenciasViaje && (

          <InfoItem

            label="Preferencias de viaje"
            value={profile.preferenciasViaje}
            color={colors.text}

          />

        )}

        {profile?.intereses && (

          <InfoItem
            label="Intereses"
            value={profile.intereses}
            color={colors.text}

          />

        )}

        {profile?.actividadesPreferidas && (
          <InfoItem
            label="Actividades preferidas"
            value={profile.actividadesPreferidas}
            color={colors.text}

          />

        )}

      </View>
    </ScrollView>

  );

};



const InfoItem = ({ label, value, color }) => (

  <View style={styles.infoItem}>
    <Text style={[styles.infoLabel, { color }]}>{label}:</Text>
    <Text style={[styles.infoValue, { color }]}>{value}</Text>
  </View>

);



const styles = StyleSheet.create({

  container: {
    alignItems: 'center',
    paddingBottom: 50,
  },

  headerBackground: {
    width: '100%',
    height: 180,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },infoItem: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: 10,
            paddingVertical: 15,
            paddingHorizontal: 15,
            marginBottom: 10,
        },
        infoIcon: {
            marginRight: 15,
            color: '#007AFF',
            fontSize: 24,
        },
        infoLabel: {
            fontSize: 16,
            color: '#3333',
            fontWeight: 'bold',
            width: 120,
        },
        infoValue: {
            fontSize: 16,
            color:'#3333' ,
            flex: 1,},
            
    profileSection: {
    alignItems: 'center',
    marginTop: -60,
  },

  avatarContainer: {
    position: 'relative',
  },

  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#fff',
  },

  cameraIcon: {

    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007AFF',
    borderRadius: 18,
    padding: 6,

  },

  nameText: {

    fontSize: 24,
    fontWeight: '700',
    marginTop: 10,

  },

  usernameText: {

    fontSize: 16,
    marginTop: 4,

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
    width: '85%',
    borderRadius: 16,
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  infoItem: {
    marginBottom: 10,
  },
  infoLabel: {
    fontWeight: '600',
    fontSize: 15,
  },
  infoValue: {
    fontSize: 15,
    marginTop: 2,
  },
  switchContainer: {

    marginTop: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '85%',

  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
  },

});


export default ProfileScreen;
