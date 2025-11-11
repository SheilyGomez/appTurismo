import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, SafeAreaView, Platform } from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../auth/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const COLORS = {
  primary: '#79B425',
  secondary: '#C0DE7B',
  background: '#FFFFFF',
  text: '#054204',
  button: '#1D6517',
  accent: '#55A6C3',
};

const CrearItinerarioScreen = ({ navigation }) => {
  // Inicializamos los estados de fecha como objetos Date
  const [nombre, setNombre] = useState('');
  const [destino, setDestino] = useState('');
  const [fechaInicio, setFechaInicio] = useState(new Date());
  const [fechaFin, setFechaFin] = useState(new Date());
  const [showInicioPicker, setShowInicioPicker] = useState(false);
  const [showFinPicker, setShowFinPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGuardarItinerario = async () => {
    if (!nombre || !destino) {
      Alert.alert('Error', 'Por favor, completa el nombre y el destino.');
      return;
    }

    // Validación extra: La fecha de fin no debe ser anterior a la de inicio
    if (fechaFin < fechaInicio) {
        Alert.alert('Error', 'La fecha de fin no puede ser anterior a la fecha de inicio.');
        return;
    }

    setLoading(true);
    try {
      // NOTA: En una app real, aquí obtendrías el ID real del usuario autenticado
      const usuarioID = 'USUARIO_PRUEBA_001'; 

      // **Las fechas se guardan directamente porque ya son objetos Date.**
      const nuevoItinerario = {
        nombre,
        destino,
        fechaInicio: fechaInicio, // Objeto Date que se guarda como Timestamp
        fechaFin: fechaFin,       // Objeto Date que se guarda como Timestamp
        usuarioID,
        fechaCreacion: new Date(),
      };

      // Usamos 'itinerarios' como nombre de la colección
      const docRef = await addDoc(collection(db, 'itinerarios'), nuevoItinerario);
      console.log("Itinerario guardado con ID: ", docRef.id);

      Alert.alert(
        '¡Éxito!',
        'El itinerario ha sido guardado correctamente.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (e) {
      console.error("Error al añadir documento: ", e);
      Alert.alert('Error', 'Hubo un problema al guardar el itinerario. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Función para mostrar la fecha en formato AAAA-MM-DD
  const formatDate = (date) => date.toISOString().split('T')[0];

  // Handlers para el selector de fechas
  const onChangeInicio = (event, selectedDate) => {
    const currentDate = selectedDate || fechaInicio;
    setShowInicioPicker(Platform.OS === 'ios');
    setFechaInicio(currentDate);
  };

  const onChangeFin = (event, selectedDate) => {
    const currentDate = selectedDate || fechaFin;
    setShowFinPicker(Platform.OS === 'ios');
    setFechaFin(currentDate);
  };


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerTitle}>➕ Nuevo Itinerario</Text>

        <Text style={styles.label}>Nombre del Viaje</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Aventura en Cusco"
          placeholderTextColor="#8DA6A9"
          value={nombre}
          onChangeText={setNombre}
        />

        <Text style={styles.label}>Destino Principal</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Machu Picchu, Perú"
          placeholderTextColor="#8DA6A9"
          value={destino}
          onChangeText={setDestino}
        />

        {/* Selector de Fecha de Inicio */}
        <Text style={styles.label}>Fecha de Inicio</Text>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => setShowInicioPicker(true)}
        >
          <Text style={styles.dateText}>{formatDate(fechaInicio)}</Text>
        </TouchableOpacity>
        {showInicioPicker && (
          <DateTimePicker
            value={fechaInicio}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onChangeInicio}
            minimumDate={new Date()} // Opcional: solo permitir seleccionar desde hoy
          />
        )}

        {/* Selector de Fecha de Fin */}
        <Text style={styles.label}>Fecha de Fin</Text>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => setShowFinPicker(true)}
        >
          <Text style={styles.dateText}>{formatDate(fechaFin)}</Text>
        </TouchableOpacity>
        {showFinPicker && (
          <DateTimePicker
            value={fechaFin}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onChangeFin}
            minimumDate={fechaInicio} // Asegura que no sea antes de la fecha de inicio
          />
        )}

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleGuardarItinerario}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.background} />
          ) : (
            <>
              <Text style={styles.saveButtonText}>Guardar Itinerario</Text>
              <Ionicons name="checkmark-circle-outline" size={24} color={COLORS.background} style={{ marginLeft: 10 }} />
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: 20, alignItems: 'center' },
  headerTitle: { fontSize: 28, fontWeight: '800', color: COLORS.text, marginBottom: 30, alignSelf: 'stretch', textAlign: 'center' },
  label: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginTop: 15, marginBottom: 5, alignSelf: 'stretch' },
  input: { backgroundColor: COLORS.secondary, paddingHorizontal: 15, paddingVertical: 12, borderRadius: 8, fontSize: 16, color: COLORS.text, borderWidth: 1, borderColor: COLORS.primary, width: '100%', marginBottom: 10 },
  dateInput: { backgroundColor: COLORS.secondary, padding: 15, borderRadius: 8, width: '100%', borderWidth: 1, borderColor: COLORS.primary, justifyContent: 'center' },
  dateText: { fontSize: 16, color: COLORS.text },
  saveButton: { backgroundColor: COLORS.accent, paddingHorizontal: 25, paddingVertical: 15, borderRadius: 10, marginTop: 30, width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 6 },
  saveButtonText: { color: COLORS.background, fontWeight: 'bold', fontSize: 18 },
  cancelButton: { marginTop: 15, paddingVertical: 10 },
  cancelButtonText: { color: COLORS.text, fontSize: 16, opacity: 0.7 },
});

export default CrearItinerarioScreen;