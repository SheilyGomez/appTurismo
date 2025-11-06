import React, { useState, useContext, useEffect } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity, TextInput,
  Alert, ScrollView, ActivityIndicator, Switch
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useProfile } from '../context/PerfileContext';
import { ThemeContext } from '../context/ThemeContext';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { uploadImageToCloudinary } from '../api/cloudinaryConfig';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';
import DropDownPicker from 'react-native-dropdown-picker';


const EditProfileScreen = ({ navigation }) => {
  const { profile, loading: profileLoading, updateProfileData } = useProfile();
  const { colors } = useContext(ThemeContext);
  const styles = createStyles(colors);

  const [nombreCompleto, setNombreCompleto] = useState('');
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Para País (usando DropDownPicker con una única opción)
  const [openPais, setOpenPais] = useState(false);
  const [pais, setPais] = useState('El Salvador'); // Valor predeterminado y único
  const [itemsPais, setItemsPais] = useState([
    { label: 'El Salvador', value: 'El Salvador', icon: () => <Text style={{ marginRight: 5 }}>🇸🇻</Text> },
  ]);

  // Para DropDownPicker de Preferencias de Viaje
  const [openPreferencias, setOpenPreferencias] = useState(false);
  const [preferenciasViaje, setPreferenciasViaje] = useState([]); // Debe ser un array
  const [itemsPreferencias, setItemsPreferencias] = useState([
    { label: 'Aventura', value: 'aventura' },
    { label: 'Cultura', value: 'cultura' },
    { label: 'Relax', value: 'relax' },
    { label: 'Gastronomía', value: 'gastronomia' },
    { label: 'Naturaleza', value: 'naturaleza' },
    { label: 'Deportes', value: 'deportes' },
  ]);

  // Para DropDownPicker de Intereses
  const [openIntereses, setOpenIntereses] = useState(false);
  const [intereses, setIntereses] = useState([]); // Debe ser un array
  const [itemsIntereses, setItemsIntereses] = useState([
    { label: 'Playa', value: 'playa' },
    { label: 'Montaña', value: 'montaña' },
    { label: 'Museos', value: 'museos' },
    { label: 'Vida Nocturna', value: 'vida_nocturna' },
    { label: 'Compras', value: 'compras' },
    { label: 'Historia', value: 'historia' },
  ]);

  // Para DropDownPicker de Actividades Preferidas
  const [openActividades, setOpenActividades] = useState(false);
  const [actividadesPreferidas, setActividadesPreferidas] = useState([]); // Debe ser un array
  const [itemsActividades, setItemsActividades] = useState([
    { label: 'Senderismo', value: 'senderismo' },
    { label: 'Buceo', value: 'buceo' },
    { label: 'Esquí', value: 'esqui' },
    { label: 'Ciclismo', value: 'ciclismo' },
    { label: 'Fotografía', value: 'fotografia' },
    { label: 'Surf', value: 'surf' },
  ]);

  useEffect(() => {
    if (profile) {
      setNombreCompleto(profile.nombreCompleto || '');
      setNombreUsuario(profile.nombreUsuario || '');
      setPais(profile.pais || 'El Salvador');
      setPreferenciasViaje(Array.isArray(profile.preferenciasViaje) ? profile.preferenciasViaje : []);
      setIntereses(Array.isArray(profile.intereses) ? profile.intereses : []);
      setActividadesPreferidas(Array.isArray(profile.actividadesPreferidas) ? profile.actividadesPreferidas : []);

      setProfileImage(profile.profileImageUrl || null);
    }

  }, [profile]);

  const pickProfileImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Se necesita permiso para acceder a la galería.');
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    let newProfileImageUrl = profileImage;
    try {
      if (profileImage && !profileImage.startsWith('http') && profileImage !== profile?.profileImageUrl) {
        newProfileImageUrl = await uploadImageToCloudinary(profileImage, 'profile_pictures');
      }

      const updatedData = {
        uid: profile.uid,
        email: profile.email,
        nombreCompleto,
        nombreUsuario,
        pais,
        preferenciasViaje, // Ya es un array de strings (ej: ['aventura', 'cultura'])
        intereses,         // Ya es un array de strings (ej: ['playa', 'montaña'])
        actividadesPreferidas, // Ya es un array de strings (ej: ['senderismo', 'buceo'])
        profileImageUrl: newProfileImageUrl,
        fechaDeNacimiento: profile.fechaDeNacimiento,
        rol: profile.rol,
      };

      await updateProfileData(updatedData);
      Alert.alert('Éxito', 'Perfil actualizado correctamente.');
      navigation.goBack();
    } catch (error) {
      console.error('Error al guardar el perfil:', error);
      Alert.alert('Error', 'No se pudo actualizar el perfil. Inténtalo de nuevo.');
    } finally {
      setIsSaving(false);
    }

  };

  if (profileLoading || !profile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color='#037a85ff' />
        <Text style={{ color: '#E0E0E0', marginTop: 10 }}>Cargando perfil...</Text>
      </View>
    );
  }
  

  return (
    <View style={styles.conteinerBackground}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={pickProfileImage} style={styles.avatarContainer}>
            <Image
              source={profileImage ? { uri: profileImage } : require('../../../assets/imagen3.jpeg')}
              style={styles.avatar}
            />
            <View style={styles.cameraIcon}>
              <MaterialIcons name="photo-camera" size={22} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.emailText}>{profile.email}</Text>
        </View>

        <View style={styles.formCard}>
          <InputField
            icon="person-outline"
            value={nombreCompleto}
            placeholder="Nombre Completo"
            onChangeText={setNombreCompleto}
            styles = {styles}
            colors = {colors}
          />
          <InputField
            icon="at-outline"
            value={nombreUsuario}
            placeholder="Nombre de Usuario"
            onChangeText={setNombreUsuario}
            styles = {styles}
            colors = {colors}
          />

          <View style={[styles.dropdownContainer, { zIndex: openPais ? 4000 : 100 }]}>
            <Text style={[styles.dropdownTextStyle, { paddingLeft: 10, color: '#424242' }]}>
              País:
            </Text>
            <DropDownPicker
              open={openPais}
              value={pais}
              items={itemsPais}
              setOpen={setOpenPais}
              setValue={setPais}
              setItems={setItemsPais}
              placeholder="País"
              placeholderStyle={styles.placeholderText}
              style={styles.dropdownStyle}
              textStyle={styles.dropdownTextStyle}
              showArrowIcon={false}
              disableBorderRadius={true}
              listMode="SCROLLVIEW"
              badgeTextStyle={{ color: '#FFFFFF', fontSize: 14 }}
              badgeContainerStyle={{ marginHorizontal: 2 }}
              dropDownContainerStyle={styles.dropdownMenuContainer}
              selectedItemContainerStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
              scrollViewProps={{
                nestedScrollEnabled: true,
              }}
            />
          </View>
          <View style={[styles.dropdownContainer, { zIndex: openPreferencias ? 3000 : 1000 }]}>
            <Text style={[styles.dropdownTextStyle, { paddingLeft: 10, color: colors.text }]}>
              Preferencias de Viaje:
            </Text>
            <DropDownPicker
              open={openPreferencias}
              value={preferenciasViaje}
              items={itemsPreferencias}
              setOpen={setOpenPreferencias}
              setValue={setPreferenciasViaje}
              setItems={setItemsPreferencias}
              placeholder="Preferencias de Viaje"
              placeholderStyle={styles.placeholderText}
              style={styles.dropdownStyle}
              textStyle={styles.dropdownTextStyle}
              multiple={true}
              min={0}
              max={5}
              mode="BADGE"
              badgeColors={[colors.secondary,]}
              badgeDotColors={['white']}
              badgeTextStyle={{ color: '#ffffffff', fontSize: 14 }}
              badgeContainerStyle={{ marginHorizontal: 2 }}
              dropDownContainerStyle={styles.dropdownMenuContainer}
              selectedItemContainerStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
              tickIconStyle={[colors.secondary,]}
              itemSeparator={true}
              itemSeparatorStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
              listMode="SCROLLVIEW"
              scrollViewProps={{
                nestedScrollEnabled: true,
              }}
            />
          </View>
          <View style={[styles.dropdownContainer, { zIndex: openIntereses ? 2000 : 900 }]}>
            <Text style={[styles.dropdownTextStyle, { paddingLeft: 10, color: colors.text }]}>
              Intereses:
            </Text>
            <DropDownPicker
              open={openIntereses}
              value={intereses}
              items={itemsIntereses}
              setOpen={setOpenIntereses}
              setValue={setIntereses}
              setItems={setItemsIntereses}
              placeholder="Intereses"
              placeholderStyle={styles.placeholderText}
              style={styles.dropdownStyle}
              textStyle={styles.dropdownTextStyle}
              multiple={true}
              min={0}
              max={5}
              mode="BADGE"
              badgeColors={[colors.secondary,]}
              badgeDotColors={['white']}
              badgeTextStyle={{ color: '#ffffffff', fontSize: 14 }}
              badgeContainerStyle={{ marginHorizontal: 2 }}
              dropDownContainerStyle={styles.dropdownMenuContainer}
              selectedItemContainerStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
              tickIconStyle={[colors.secondary,]}
              itemSeparator={true}
              itemSeparatorStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
              listMode="SCROLLVIEW"
              scrollViewProps={{
                nestedScrollEnabled: true,
              }}
            />
          </View>


          <View style={[styles.dropdownContainer, { zIndex: openActividades ? 1000 : 800 }]}>
            <Text style={[styles.dropdownTextStyle, { paddingLeft: 10, color: colors.text }]}>
              Actividades Preferidas:
            </Text>
            <DropDownPicker
              open={openActividades}
              value={actividadesPreferidas}
              items={itemsActividades}
              setOpen={setOpenActividades}
              setValue={setActividadesPreferidas}
              setItems={setItemsActividades}
              placeholder="Actividades Preferidas"
              placeholderStyle={styles.placeholderText}
              style={styles.dropdownStyle}
              textStyle={styles.dropdownTextStyle}
              multiple={true}
              min={0}
              max={5}
              mode="BADGE"
              badgeColors={[colors.secondary,]}
              badgeDotColors={['white']}
              badgeTextStyle={{ color: '#ffffffff', fontSize: 14 }}
              badgeContainerStyle={{ marginHorizontal: 2 }}
              dropDownContainerStyle={styles.dropdownMenuContainer}
              selectedItemContainerStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
              tickIconStyle={[colors.secondary,]}
              itemSeparator={true}
              itemSeparatorStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
              listMode="SCROLLVIEW"
              scrollViewProps={{
                nestedScrollEnabled: true,
              }}
            />
          </View>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveProfile}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Guardar Cambios</Text>
            )}

          </TouchableOpacity>
          <TouchableOpacity

            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>

  );

};

const InputField = ({ icon, value, placeholder, onChangeText, styles, colors }) => (
    <View style={styles.inputGroup}>
    <Ionicons name={icon} size={20} color={colors.text} style={styles.inputIcon} /> 
    <TextInput
      style={styles.input} // <-- Usa styles.input
      placeholder={placeholder}
      placeholderTextColor="#9E9E9E"
      value={value}
      onChangeText={onChangeText}
    />
  </View>
);

const createStyles = (colors) => StyleSheet.create({
  conteinerBackground: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop:40,
    paddingBottom: 5
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundColor, // Fondo blanco para la carga
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: colors.secondary, 
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundColor, 
    shadowColor: colors.secondary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  avatar: {
    width: 132,
    height: 132,
    borderRadius: 66,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.secondary, 
    borderRadius: 20,
    padding: 8,
    borderWidth: 2,
    borderColor: '#A0E7E2',
  },
  emailText: {
    color: colors.text, 
    fontSize: 16,
    marginTop: 10,
  },
  formCard: {
    backgroundColor: colors.sub_background, 
    width: '90%',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1, 
    shadowRadius: 8,
    elevation: 6,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  inputIcon: {
    marginRight: 10,
    color: colors.text,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    paddingVertical: 10,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  saveButton: {
    marginTop: 25,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary,
    shadowColor: colors.secondary,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  dropdownContainer: {
    marginBottom: 15,
  },
  dropdownStyle: {
    backgroundColor: colors.inputBackground, 
    borderColor: colors.inputBorder, 
    borderRadius: 12,
    minHeight: 50,
  },
  dropdownTextStyle: {
    color: colors.text, 
    fontSize: 15,
  },
  dropdownMenuContainer: {
    backgroundColor: colors.inputBackground, 
    borderColor: colors.inputBorder, // Borde gris claro
    borderRadius: 12,
  },
  cancelButton: {
    marginTop: 15, 
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cancelarbutton, 
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  cancelButtonText: {
    color: '#fff', 
    fontSize: 17,
    fontWeight: '600',
  },
  
});

export default EditProfileScreen;