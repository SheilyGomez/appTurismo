import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, onSnapshot, doc, deleteDoc } from 'firebase/firestore'; // Importar 'doc' y 'deleteDoc'
import { db } from '../auth/firebaseConfig'; // Asegúrate de que la ruta sea correcta

// Paleta de colores
const COLORS = {
  primary: '#79B425',   // #79B425 (Verde principal)
  secondary: '#C0DE7B', // #C0DE7B (Verde claro)
  background: '#FFFFFF',
  text: '#054204',      // #054204 (Verde oscuro, para texto)
  button: '#1D6517',    // #1D6517 (Verde botón)
  accent: '#55A6C3',    // #55A6C3 (Azul acento)
};

// Función robusta para formatear fechas
const formatDate = (dateValue) => {
    // 1. Manejar valor nulo, indefinido o vacío
    if (!dateValue) return 'Fecha no definida';

    let date;

    // 2. Manejar objetos Timestamp de Firestore (tienen la función toDate)
    if (typeof dateValue === 'object' && dateValue.toDate) {
        date = dateValue.toDate();
    } 
    // 3. Manejar objetos Date de JavaScript (el formato que se guarda ahora)
    else if (dateValue instanceof Date) {
        date = dateValue;
    }
    // 4. Fallback: Si no es un objeto válido (ej: datos viejos o mal guardados), intenta parsear como string
    else {
        date = new Date(dateValue);
        if (isNaN(date.getTime())) {
            return 'Fecha no válida';
        }
    }
    
    // Formatea la fecha al formato deseado (DD/Mes/AAAA)
    return date.toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
};


const ItinerarioScreen = ({ navigation }) => {
  const [itinerarios, setItinerarios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // REFERENCIA A LA COLECCIÓN 'itinerarios'
    const q = query(collection(db, 'itinerarios'));
    
    // Listener en tiempo real para obtener los viajes
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const listaItinerarios = [];
      snapshot.forEach((doc) => {
        // Mapea los documentos a un array de objetos
        listaItinerarios.push({ id: doc.id, ...doc.data() });
      });
      setItinerarios(listaItinerarios);
      setLoading(false);
    }, (error) => {
      console.error("Error al obtener itinerarios: ", error);
      setLoading(false);
    });

    // Función de limpieza para desuscribirse del listener
    return () => unsubscribe();
  }, []);

  // ------------------------------------------
  // NUEVA FUNCIÓN PARA ELIMINAR
  // ------------------------------------------
  const handleDelete = (id) => {
    Alert.alert(
      "Confirmar Eliminación",
      "¿Estás seguro de que deseas eliminar este itinerario? Esta acción es irreversible.",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Eliminar",
          onPress: async () => {
            try {
              // Obtiene una referencia al documento específico
              const itinerarioDoc = doc(db, 'itinerarios', id);
              // Elimina el documento
              await deleteDoc(itinerarioDoc);
              console.log("Documento eliminado con ID: ", id);
              // Como usamos onSnapshot, la lista se actualizará automáticamente.
            } catch (error) {
              console.error("Error al eliminar el itinerario: ", error);
              Alert.alert("Error", "No se pudo eliminar el itinerario. Intenta de nuevo.");
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loading]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ color: COLORS.text }}>Cargando itinerarios...</Text>
      </View>
    );
  }

  // Componente para renderizar cada tarjeta de itinerario
 const renderItem = ({ item }) => (
    <View style={styles.itinerarioCard}>
        {/* Contenedor principal para la información (editable) */}
        <TouchableOpacity 
            style={styles.cardContent}
            // Navegación para "Digitar y Editar"
            onPress={() => navigation.navigate('CrearItinerarioScreen', { itinerario: item })}
        >
            <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.nombre || 'Itinerario de Viaje'}</Text>
                <Text style={styles.cardDetail}>🗺️ Destino: {item.destino || 'No especificado'}</Text>
                <Text style={styles.cardDetail}>
                    📅 Fechas: {formatDate(item.fechaInicio)} - {formatDate(item.fechaFin)}
                </Text>
            </View>
        </TouchableOpacity>
        
        {/* Botón de Eliminar */}
        <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item.id)}
        >
            <Ionicons name="trash-outline" size={24} color="#C0392B" />
        </TouchableOpacity>
    </View>
);


return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>✈️ Mis Itinerarios de Viaje</Text>
      {itinerarios.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="map-outline" size={80} color={COLORS.primary} />
          <Text style={styles.emptyText}>Aún no tienes itinerarios. ¡Empieza a planear tu próxima aventura!</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('CrearItinerarioScreen')}
            style={styles.addButton}
          >
            <Ionicons name="add-circle" size={24} color={COLORS.background} />
            <Text style={styles.addButtonText}>Crear Nuevo Viaje</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={itinerarios}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}
      
      {/* Botón Flotante para Crear */}
      {itinerarios.length >= 0 && ( // Mantenemos el FAB si la lista está vacía o tiene elementos
        <TouchableOpacity 
          style={styles.fabButton}
          onPress={() => navigation.navigate('CrearItinerarioScreen')}
        >
          <Ionicons name="add" size={28} color={COLORS.background} />
        </TouchableOpacity>
      )}
      
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
    flexDirection: 'row', // Para alinear el contenido y el botón de eliminar
    justifyContent: 'space-between', // Para empujar el botón a la derecha
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
  cardContent: {
    flex: 1, // Ocupa todo el espacio disponible
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  cardDetail: {
    fontSize: 14,
    color: COLORS.text,
    paddingVertical: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: COLORS.background,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.text,
    marginVertical: 25,
    textAlign: 'center',
  },
  fabButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: COLORS.accent, 
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8, 
    shadowColor: COLORS.text, 
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  addButton: {
    backgroundColor: COLORS.button,
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  addButtonText: {
    color: COLORS.background,
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 5,
  },
  deleteButton: {
    // Estilos del botón de eliminar (el ícono de la basura)
    paddingLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default ItinerarioScreen;