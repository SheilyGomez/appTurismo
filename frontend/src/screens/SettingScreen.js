// frontend/src/screens/SettingsScreen.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Switch, StyleSheet, Text, View, TouchableOpacity, ScrollView, Linking, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
//import { UserContext } from '../context/UserContext';

const SettingsScreen = () => {
  const { darkMode, toggleDarkMode, colors } = useContext(ThemeContext);

  const [user, setUser] = useState('');
  const navigation = useNavigation();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    useEffect(()=>{
      const loadUser = async()=>{
          const storedUser = await AsyncStorage.getItem('user');
          if(storedUser){
              setUser(storedUser);
          }
      }
      loadUser();
    },[]);


  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('token');
      setUser(null);
      navigation.replace('Login');
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  };

  const handlePhoneCall = () => {
    // número de teléfono simulado 
    const phoneNumber = '123-456-7890';
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleHelp = () => {
    Alert.alert(
      "Centro de Ayuda",
      "Próximamente tendremos una sección de preguntas frecuentes. Para asistencia, por favor llámanos."
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 20,
      backgroundColor: colors.background,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
    },
    section: {
      marginHorizontal: 20,
      marginTop: 20,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 10,
      textTransform: 'uppercase',
    },
    settingItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 15,
      backgroundColor: colors.sub_background,
      borderRadius: 10,
      paddingHorizontal: 15,
      marginBottom: 10,
    },
    settingText: {
      fontSize: 18,
      color: colors.text,
    },
    buttonDanger: {
      flexDirection: 'row',
      backgroundColor: colors.deletebutton,
      borderRadius: 10,
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: 20,
      marginTop: 30,
      marginBottom: 50,
    },
    buttonText: {
      marginLeft: 10,
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
    },
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>General</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingText}>Tema Oscuro</Text>
          <Switch
            value={darkMode}
            onValueChange={toggleDarkMode}
            trackColor={{ false: "#767577", true: colors.primary }}
            thumbColor={"#f4f3f4"}
          />
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingText}>Notificaciones</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={() => setNotificationsEnabled(previousState => !previousState)}
            trackColor={{ false: "#767577", true: colors.primary }}
            thumbColor={"#f4f3f4"}
          />
        </View>
      </View>

      {/* Sección de Cuenta y Soporte */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cuenta y Soporte</Text>
        <TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.settingText}>Perfil</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem} onPress={handleHelp}>
          <Text style={styles.settingText}>Ayuda</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem} onPress={handlePhoneCall}>
          <Text style={styles.settingText}>Llamar al Restaurante</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.buttonDanger} onPress={handleLogout}>
        <MaterialCommunityIcons name='logout' size={24} color={'#fff'} />
        <Text style={styles.buttonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default SettingsScreen;