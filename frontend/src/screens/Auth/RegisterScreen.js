//frontend/src/screens/Auth/RegisterScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import { useAuth } from '../../auth/AuthContext';

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [pais, setPais] = useState('');
  const [preferenciasViaje, setPreferenciasViaje] = useState(''); // Convertir a array si es múltiple
  const [intereses, setIntereses] = useState(''); // Convertir a array si es múltiple
  const [actividadesPreferidas, setActividadesPreferidas] = useState(''); // Convertir a array si es múltiple
  const [fechaDeNacimiento, setFechaDeNacimiento] = useState(''); // Formato YYYY-MM-DD
  const { register, loading } = useAuth();

  const handleRegister = async () => {
    // Validaciones básicas de campos
    if (!email || !password || !nombreUsuario || !nombreCompleto || !pais || !fechaDeNacimiento) {
      Alert.alert('Error', 'Por favor, completa todos los campos obligatorios.');
      return;
    }

    // Validar formato de fecha (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(fechaDeNacimiento)) {
      Alert.alert('Error', 'Formato de fecha de nacimiento inválido. Usa YYYY-MM-DD.');
      return;
    }

    const userData = {
      email,
      password,
      nombreUsuario,
      nombreCompleto,
      pais,
      preferenciasViaje: preferenciasViaje.split(',').map(item => item.trim()), // Ejemplo para convertir a array
      intereses: intereses.split(',').map(item => item.trim()),
      actividadesPreferidas: actividadesPreferidas.split(',').map(item => item.trim()),
      fechaDeNacimiento,
    };

    try {
      await register(userData);
      Alert.alert('Registro Exitoso', 'Tu cuenta ha sido creada. ¡Ahora puedes iniciar sesión!');
      navigation.navigate('Login'); // Navegar a la pantalla de login
    } catch (error) {
      Alert.alert('Error de Registro', error.message || 'Hubo un problema al registrarte.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Registrarse</Text>
      <TextInput style={styles.input} placeholder="Correo Electrónico" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry />
      <TextInput style={styles.input} placeholder="Nombre de Usuario" value={nombreUsuario} onChangeText={setNombreUsuario} />
      <TextInput style={styles.input} placeholder="Nombre Completo" value={nombreCompleto} onChangeText={setNombreCompleto} />
      <TextInput style={styles.input} placeholder="País" value={pais} onChangeText={setPais} />
      <TextInput style={styles.input} placeholder="Preferencias de Viaje (ej: aventura, cultura)" value={preferenciasViaje} onChangeText={setPreferenciasViaje} />
      <TextInput style={styles.input} placeholder="Intereses (ej: playa, museos)" value={intereses} onChangeText={setIntereses} />
      <TextInput style={styles.input} placeholder="Actividades Preferidas (ej: senderismo, buceo)" value={actividadesPreferidas} onChangeText={setActividadesPreferidas} />
      <TextInput style={styles.input} placeholder="Fecha de Nacimiento (YYYY-MM-DD)" value={fechaDeNacimiento} onChangeText={setFechaDeNacimiento} />

      <Button title={loading ? "Registrando..." : "Registrar"} onPress={handleRegister} disabled={loading} />
      <Button
        title="Ya tengo cuenta"
        onPress={() => navigation.navigate('Login')}
        disabled={loading}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
});

export default RegisterScreen;