import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity, 
  StyleSheet,
  Alert,
  ImageBackground,
  Platform 
} from 'react-native';
import { useAuth } from '../../auth/AuthContext';
import Icon from 'react-native-vector-icons/FontAwesome'; 

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor, ingresa tu correo y contraseña.');
      return;
    }
    try {
      await login(email, password);
    } catch (error) {
      Alert.alert('Credenciales inválidas.');
    }
  };

  return (
    <ImageBackground
      source={require('../../../../assets/imagen2.jpeg')} 
      style={styles.background}
    >
      <View style={styles.overlay} /> 
      <View style={styles.container}>
        <Text style={styles.welcomeText}>¡Bienvenido de nuevo!</Text>
        <Text style={styles.subtitle}>Inicia sesión para continuar tu aventura</Text>

        <View style={styles.inputContainer}>
          <Icon name="envelope" size={20} color="#777" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Correo Electrónico"
            placeholderTextColor="#ffffffff"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon name="lock" size={20} color="#777" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor="#ffffffff"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={[styles.button, styles.loginButton]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? "Iniciando..." : "Iniciar Sesión"}</Text>
        </TouchableOpacity>

        <Text style={styles.orText}>o inicia sesión con</Text>

        <View style={styles.socialLoginContainer}>
          <TouchableOpacity style={[styles.socialButton, styles.googleButton]}>
            <Icon name="google" size={24} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.socialButton, styles.facebookButton]}>
            <Icon name="facebook" size={24} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.socialButton, styles.appleButton]}>
            <Icon name="apple" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.signupPrompt}>
          <Text style={styles.signupText}>¿No tienes cuenta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')} disabled={loading}>
            <Text style={styles.signupLink}>Regístrate</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.52)', // Capa oscura semitransparente
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 25,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'Roboto-Bold', 
  },
  subtitle: {
    fontSize: 18,
    color: '#ffffffff',
    marginBottom: 40,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Light' : 'Roboto-Light',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'rgba(168, 168, 168, 0.7)',
    borderRadius: 30,
    marginBottom: 20,
    paddingHorizontal: 15,
    height: 55,
  },
  inputIcon: {
    marginRight: 10,
    color: '#ffffffff', 
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    paddingVertical: 10,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'Roboto-Medium',
  },
  button: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  loginButton: {
    backgroundColor: '#FF6F61', 
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'Roboto-Bold',
  },
  orText: {
    color: '#ffffffff',
    fontSize: 16,
    marginBottom: 20,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'Roboto-Medium',
  },
  socialLoginContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '70%',
    marginBottom: 40,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  googleButton: {
    backgroundColor: '#DB4437', 
  },
  facebookButton: {
    backgroundColor: '#4267B2', 
  },
  appleButton: {
    backgroundColor: '#000000',
  },
  signupPrompt: {
    flexDirection: 'row',
    marginTop: 10,
  },
  signupText: {
    color: '#ffffffff',
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'Roboto-Medium',
  },
  signupLink: {
    color: '#FF6F61', 
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'Roboto-Bold',
  },
});

export default LoginScreen;