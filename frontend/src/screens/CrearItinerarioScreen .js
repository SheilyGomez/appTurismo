import React, { useState, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  ActivityIndicator, 
  SafeAreaView, 
  Platform 
} from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../auth/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { addItinerario } from '../bd/ItinerarioSQLite';
import { ThemeContext } from '../context/ThemeContext';


const COLORS = {
  primary: '#79B425',
  secondary: '#C0DE7B',
  background: '#FFFFFF',
  text: '#054204',
  button: '#1D6517',
  accent: '#55A6C3',
};

const CrearItinerarioScreen = ({ navigation }) => {
  const { colors } = useContext(ThemeContext);
  const styles = createStyles(colors);

  const [nombre, setNombre] = useState('');
  const [destino, setDestino] = useState('');
  const [fechaInicio, setFechaInicio] = useState(new Date());
  const [fechaFin, setFechaFin] = useState(new Date());
  const [showInicioPicker, setShowInicioPicker] = useState(false);
  const [showFinPicker, setShowFinPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const generateId = () => {
    return 'itinerario_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  };

  const handleGuardarItinerario = async () => {
    if (!nombre || !destino) {
      Alert.alert('Error', 'Por favor, completa el nombre y el destino.');
      return;
    }

    if (fechaFin < fechaInicio) {
      Alert.alert('Error', 'La fecha de fin no puede ser anterior a la fecha de inicio.');
      return;
    }

    setLoading(true);
    try {
      const usuarioID = 'USUARIO_PRUEBA_001'; 
      const itinerarioId = generateId();

      const nuevoItinerario = {
        id: itinerarioId,
        nombre,
        destino,
        fechaInicio,
        fechaFin,
        usuarioID,
        fechaCreacion: new Date(),
      };

      // Guardar en SQLite
      await addItinerario(nuevoItinerario);

      // Opcional: También guardar en Firestore
      try {
        const docRef = await addDoc(collection(db, 'itinerarios'), nuevoItinerario);
        console.log("Itinerario guardado en Firestore con ID: ", docRef.id);
      } catch (firestoreError) {
        console.warn("No se pudo guardar en Firestore, pero se guardó localmente:", firestoreError);
      }

      Alert.alert('¡Éxito!', 'El itinerario ha sido guardado correctamente.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      console.error("Error al guardar itinerario: ", e);
      Alert.alert('Error', 'Hubo un problema al guardar el itinerario. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => date.toISOString().split('T')[0];

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

        <Text style={styles.title}>Nuevo Itinerario</Text>

        <View style={styles.card}>

          <View style={styles.section}>
            <Text style={styles.label}>Nombre del Viaje</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Aventura en Cusco"
              placeholderTextColor="#6C886C"
              value={nombre}
              onChangeText={setNombre}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Destino Principal</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Machu Picchu, Perú"
              placeholderTextColor="#6C886C"
              value={destino}
              onChangeText={setDestino}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Fecha de Inicio</Text>
            <TouchableOpacity style={styles.dateInput} onPress={() => setShowInicioPicker(true)}>
              <Text style={styles.dateText}>{formatDate(fechaInicio)}</Text>
            </TouchableOpacity>

            {showInicioPicker && (
              <DateTimePicker
                value={fechaInicio}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onChangeInicio}
                minimumDate={new Date()}
              />
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Fecha de Fin</Text>
            <TouchableOpacity style={styles.dateInput} onPress={() => setShowFinPicker(true)}>
              <Text style={styles.dateText}>{formatDate(fechaFin)}</Text>
            </TouchableOpacity>

            {showFinPicker && (
              <DateTimePicker
                value={fechaFin}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onChangeFin}
                minimumDate={fechaInicio}
              />
            )}
          </View>

        </View>

        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleGuardarItinerario} 
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.background} />
          ) : (
            <>
              <Ionicons name="save-outline" size={24} color={COLORS.background} />
              <Text style={styles.saveButtonText}>Guardar Itinerario</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.cancelButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 20, alignItems: 'center' },
  title: {
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 1,
    color: COLORS.primary,
    marginBottom: 20,
    textShadowColor: '#618F1E',
    textShadowRadius: 5
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.secondary,
    borderRadius: 18,
    padding: 20,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 6,
    marginBottom: 25
  },
  section: {
    marginBottom: 18
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6
  },
  input: {
    backgroundColor: "#F8FFE8",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1.4,
    borderColor: COLORS.primary,
    fontSize: 16,
    color: COLORS.text
  },
  dateInput: {
    backgroundColor: "#F8FFE8",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1.4,
    borderColor: COLORS.primary,
  },
  dateText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500'
  },
  saveButton: {
    backgroundColor: COLORS.accent,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    width: '100%',
    borderRadius: 12,
    elevation: 6,
    shadowColor: COLORS.accent,
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  saveButtonText: {
    color: COLORS.background,
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    marginTop: 15,
    paddingVertical: 10
  },
  cancelButtonText: {
    color: COLORS.text,
    fontSize: 16,
    opacity: 0.7
  }
});

export default CrearItinerarioScreen;