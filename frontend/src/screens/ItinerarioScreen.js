import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../auth/firebaseConfig';
import { MapPin, Calendar, PlusCircle } from 'lucide-react-native';

// Paleta de colores
const COLORS = {
  primary: '#79B425',   // Verde principal
  secondary: '#C0DE7B', // Verde claro
  background: '#FFFFFF',
  text: '#054204',      // Verde oscuro (para texto)
  button: '#1D6517',    // Verde botón
  accent: '#55A6C3',    // Azul acento
};

const ItinerarioScreen = ({ navigation }) => {
  const [itinerarios, setItinerarios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'itinerarios'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const listaItinerarios = [];
      snapshot.forEach((doc) => {
        listaItinerarios.push({ id: doc.id, ...doc.data() });
      });
      setItinerarios(listaItinerarios);
      setLoading(false);
    }, (error) => {
      console.error("Error al obtener itinerarios: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, styles.loading]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ color: COLORS.text }}>Cargando itinerarios...</Text>
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity 
        style={styles.itinerarioCard} 
        onPress={() => {
            // navigation.navigate('DetalleItinerario', { itinerarioId: item.id });
        }}
    >
      <Text style={styles.cardTitle}>{item.nombre || 'Itinerario de Viaje'}</Text>
      <View style={styles.cardRow}>
        <MapPin color={COLORS.text} size={18} />
        <Text style={styles.cardDetail}>Destino: {item.destino || 'No especificado'}</Text>
      </View>
      <View style={styles.cardRow}>
        <Calendar color={COLORS.text} size={18} />
        <Text style={styles.cardDetail}>Fechas: {item.fechaInicio} - {item.fechaFin}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Mis Itinerarios de Viaje</Text>
      <FlatList
        data={itinerarios}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aún no tienes viajes planeados.</Text>
            <TouchableOpacity 
                style={styles.addButton}
                onPress={() => {
                    // navigation.navigate('CrearItinerario');
                }}
            >
              <PlusCircle color={COLORS.background} size={20} />
              <Text style={styles.addButtonText}>Nuevo Itinerario</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    paddingVertical: 15,
    backgroundColor: COLORS.secondary,
  },
  itinerarioCard: {
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    padding: 18,
    marginHorizontal: 15,
    marginVertical: 10,
    borderLeftWidth: 6, 
    borderLeftColor: COLORS.primary,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
  },
  cardDetail: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 6,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 25,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: COLORS.button,
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: COLORS.background,
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 8,
  },
});

export default ItinerarioScreen;
