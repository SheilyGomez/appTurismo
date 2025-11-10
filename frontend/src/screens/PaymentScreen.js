import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { crearReservaAPI } from '../api/apiReservas'; 


const wait = (timeout) => {
  return new Promise(resolve => setTimeout(resolve, timeout));
};

const PaymentScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();


  const { reservaData, pagoData } = route.params;


  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardHolder, setCardHolder] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  const formatCardNumber = (text) => {

    const A = text.replace(/\D/g, '').match(/.{1,4}/g);
    setCardNumber(A ? A.join(' ') : '');
  };


  const formatExpiryDate = (text) => {
    const digits = text.replace(/\D/g, '');


    if (text.length < expiryDate.length && expiryDate.length === 3) {
       setExpiryDate(digits);
       return;
    }

    if (digits.length >= 2) {
      const mm = digits.slice(0, 2);
      const yy = digits.slice(2, 4);
      setExpiryDate(`${mm}/${yy}`);
    } else {

      setExpiryDate(digits);
    }
  };


  const handlePagar = async () => {
    if (!cardNumber || !expiryDate || !cvc || !cardHolder) {
      Alert.alert("Formulario incompleto", "Por favor, completa todos los datos de la tarjeta.");
      return;
    }
    
    const rawCardNumber = cardNumber.replace(/\D/g, ''); 
    if (rawCardNumber.length < 15 || rawCardNumber.length > 16) {
        Alert.alert("Tarjeta Inválida", "El número de tarjeta parece incorrecto. Debe tener 15 o 16 dígitos.");
        return;
    }

    setLoading(true);
    setError(null);

    try {

      await wait(2500); // Espera 2.5 segundos
      
      await crearReservaAPI(reservaData);

      Alert.alert(
        "¡Reserva y Pago Exitosos!",
        `Tu reserva en ${pagoData.destinoNombre} por $${pagoData.precioTotal.toFixed(2)} ha sido confirmada.`,
        [
          { text: "OK", onPress: () => {
              navigation.pop(2); 
            }
          }
        ]
      );

    } catch (err) {
      console.error("Error al crear la reserva:", err.response?.data || err.message);
      setError(err.response?.data?.message || "No se pudo completar la reserva.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back-outline" size={28} color="#2F4750" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Simulación de Pago</Text>
        </View>

        <ScrollView style={styles.container}>
          <View style={styles.resumenCard}>
            <Text style={styles.resumenText}>Pagarás por {pagoData.numeroPersonas} persona(s) en</Text>
            <Text style={styles.resumenDestino}>{pagoData.destinoNombre}</Text>
            <Text style={styles.resumenTotal}>${pagoData.precioTotal.toFixed(2)}</Text>
          </View>
          
          <View style={styles.form}>
            <Text style={styles.label}>Nombre en la Tarjeta</Text>
            <TextInput
              style={styles.input}
              placeholder="Juan Pérez"
              placeholderTextColor="#8DA6A9"
              value={cardHolder}
              onChangeText={setCardHolder}
            />

            <Text style={styles.label}>Número de Tarjeta</Text>
            <View style={styles.inputIcon}>
              <TextInput
                style={{flex: 1, fontSize: 16}}
                placeholder="0000 0000 0000 0000"
                placeholderTextColor="#8DA6A9"
                value={cardNumber}
                onChangeText={formatCardNumber}
                keyboardType="numeric"
                maxLength={19} 
              />
              <Ionicons name="card-outline" size={20} color="#8DA6A9" />
            </View>
            
            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.label}>Vencimiento</Text>
                <TextInput
                  style={styles.input}
                  placeholder="MM/YY"
                  placeholderTextColor="#8DA6A9"
                  value={expiryDate}
                  onChangeText={formatExpiryDate} 
                  keyboardType="numeric"
                  maxLength={5} // MM/YY
                />
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>CVC</Text>
                <TextInput
                  style={styles.input}
                  placeholder="123"
                  placeholderTextColor="#8DA6A9"
                  value={cvc}
                  onChangeText={setCvc}
                  keyboardType="numeric"
                  maxLength={3}
                  secureTextEntry
                />
              </View>
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>

        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
            onPress={handlePagar} 
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Pagar ${pagoData.precioTotal.toFixed(2)}</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, padding: 20 },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  backButton: { marginRight: 16 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#2F4750' },
  
  resumenCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  resumenText: { fontSize: 16, color: '#5A6B6F' },
  resumenDestino: { fontSize: 18, fontWeight: '600', color: '#2F4750', marginVertical: 4 },
  resumenTotal: { fontSize: 32, fontWeight: '700', color: '#6E4BFF' },

  form: { flex: 1 },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2F4750',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    fontSize: 16,
    color: '#2F4750',
  },
  inputIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  col: { flex: 1, marginRight: 8 },
  
  errorText: {
    fontSize: 14,
    color: '#D9534F',
    textAlign: 'center',
    marginTop: 16,
  },

  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#E9ECEF' },
  submitButton: {
    backgroundColor: '#6E4BFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: { backgroundColor: '#BDBDBD' },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default PaymentScreen;