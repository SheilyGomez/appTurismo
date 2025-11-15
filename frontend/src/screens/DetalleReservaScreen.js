import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, StatusBar } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ThemeContext } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const InfoRow = ({ icon, label, value, colors }) => (
  <View style={createStyles(colors).infoRow}>
    <Ionicons name={icon} size={20} color={colors.primary} style={{ marginRight: 15 }} />
    <View style={{ flex: 1 }}>
      <Text style={createStyles(colors).infoLabel}>{label}</Text>
      <Text style={createStyles(colors).infoValue}>{value}</Text>
    </View>
  </View>
);

const DetalleReservaScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { darkMode, homeColors } = useContext(ThemeContext);
  const styles = createStyles(homeColors);
  
  const { reserva } = route.params;

  const fecha = new Date(reserva.fechaReserva._seconds * 1000);
  const fechaFormateada = fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
  const horaFormateada = fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  return (
    <ScrollView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <Image
          source={{ uri: reserva.destinoInfo.imagenPrincipal || 'https://via.placeholder.com/400' }}
          style={styles.headerImage}
        />
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerOverlay} />
        <Text style={styles.headerTitle}>{reserva.destinoInfo.nombre}</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Tu Reserva</Text>
        
        <InfoRow icon="receipt-outline" label="Código de Reserva" value={reserva.codigoReserva || 'N/A'} colors={homeColors} />
        
        <InfoRow icon="calendar-outline" label="Fecha" value={fechaFormateada} colors={homeColors} />
        <InfoRow icon="time-outline" label="Hora" value={horaFormateada} colors={homeColors} />
        <InfoRow icon="people-outline" label="Personas" value={reserva.numeroPersonas} colors={homeColors} />
        <InfoRow icon="checkmark-circle-outline" label="Estado" value={reserva.estado.charAt(0).toUpperCase() + reserva.estado.slice(1)} colors={homeColors} />
        
        <InfoRow icon="flag-outline" label="Actividad" value={reserva.actividadReservada} colors={homeColors} />
        <InfoRow icon="cash-outline" label="Total Pagado" value={`$${(reserva.precioTotal || 0).toFixed(2)}`} colors={homeColors} />

        {reserva.comentarios && (
          <InfoRow icon="chatbubble-ellipses-outline" label="Comentarios" value={reserva.comentarios} colors={homeColors} />
        )}
      </View>
    </ScrollView>
  );
};

const createStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, },
  header: { height: 250, },
  headerImage: { width: '100%', height: '100%', },
  headerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', },
  backButton: { position: 'absolute', top: 50, left: 20, zIndex: 1, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, padding: 5, },
  headerTitle: { position: 'absolute', bottom: 20, left: 20, color: colors.white, fontSize: 28, fontWeight: 'bold', zIndex: 1, },
  content: { padding: 20, },
  sectionTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: colors.textPrimary,
    marginTop: 20, 
    marginBottom: 15, 
    borderBottomWidth: 1, 
    borderBottomColor: colors.border,
    paddingBottom: 10, 
  },
  infoRow: { 
    flexDirection: 'row', 
    alignItems: 'flex-start',
    marginBottom: 20, 
  },
  infoLabel: { 
    fontSize: 14, 
    color: colors.textSecondary, 
    marginBottom: 4, 
  },
  infoValue: { 
    fontSize: 16, 
    color: colors.textPrimary, 
    fontWeight: '500', 
    flexShrink: 1, 
  },
});

export default DetalleReservaScreen;