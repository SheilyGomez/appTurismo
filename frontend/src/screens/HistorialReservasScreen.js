// frontend/src/screens/HistorialReservasScreen.js
import React, { useState, useCallback, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getMisReservasAPI } from '../api/apiReservas';
import { ThemeContext } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

// Componente para cada tarjeta de reserva en la lista
const ReservaCard = ({ item, onPress }) => {
  const { colors } = useContext(ThemeContext);
  const styles = createStyles(colors);

  const estadoColor = {
    confirmada: '#28A745',
    cancelada: '#DC3545',
    pendiente: '#FFC107',
  };

  // Formatear la fecha para que sea legible
  const fecha = new Date(item.fechaReserva._seconds * 1000);
  const fechaFormateada = fecha.toLocaleDateString('es-ES', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image
        source={{ uri: item.destinoInfo.imagenPrincipal || 'https://via.placeholder.com/150' }}
        style={styles.cardImage}
      />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.destinoInfo.nombre}</Text>
        <Text style={styles.cardSubtitle}>{fechaFormateada}</Text>
        <View style={[styles.statusBadge, { backgroundColor: estadoColor[item.estado] || '#6c757d' }]}>
          <Text style={styles.statusText}>{item.estado.charAt(0).toUpperCase() + item.estado.slice(1)}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward-outline" size={24} color={colors.text} style={styles.cardChevron} />
    </TouchableOpacity>
  );
};

const HistorialReservasScreen = () => {
  const { colors } = useContext(ThemeContext);
  const styles = createStyles(colors);
  const navigation = useNavigation();

  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReservas = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getMisReservasAPI();
      setReservas(response.data);
    } catch (error) {
      console.error("Error al cargar el historial de reservas:", error);
      // Alert.alert("Error", "No se pudo cargar tu historial.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // useFocusEffect se ejecuta cada vez que la pantalla está en foco
  useFocusEffect(
    useCallback(() => {
      fetchReservas();
    }, [fetchReservas])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchReservas();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando tu historial...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Mi Historial de Reservas</Text>
      <FlatList
        data={reservas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ReservaCard
            item={item}
            onPress={() => navigation.navigate('DetalleReserva', { reserva: item })}
          />
        )}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>Aún no tienes ninguna reserva.</Text>
            <Text style={styles.emptySubText}>¡Anímate a explorar y reservar tu próxima aventura!</Text>
          </View>
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ flexGrow: 1 }}
      />
    </View>
  );
};

const createStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: 60, paddingHorizontal: 20, },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: colors.text, marginBottom: 20, },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', },
  loadingText: { marginTop: 10, color: colors.text, },
  emptyText: { fontSize: 18, fontWeight: '600', color: colors.text, },
  emptySubText: { fontSize: 14, color: '#888', marginTop: 8, textAlign: 'center', paddingHorizontal: 30, },
  // Estilos de la Card
  card: { flexDirection: 'row', backgroundColor: colors.sub_background, borderRadius: 12, marginBottom: 15, padding: 10, alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, },
  cardImage: { width: 70, height: 70, borderRadius: 8, },
  cardContent: { flex: 1, marginLeft: 15, justifyContent: 'center', },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: colors.text, },
  cardSubtitle: { fontSize: 14, color: '#888', marginTop: 4, },
  statusBadge: { borderRadius: 20, paddingVertical: 4, paddingHorizontal: 10, alignSelf: 'flex-start', marginTop: 8, },
  statusText: { color: '#fff', fontSize: 12, fontWeight: 'bold', },
  cardChevron: { marginLeft: 'auto', },
});

export default HistorialReservasScreen;