import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  FlatList,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { fetchDestinoByIdAPI } from "../api/apiDestinos";
import MapView, { Marker } from "react-native-maps"; 

const { width } = Dimensions.get("window");

const ImageGallery = ({ images }) => {
  if (!images || images.length === 0) {
    return (
      <View style={styles.galleryPlaceholder}>
        <Ionicons name="image-outline" size={60} color="#CED4DA" />
      </View>
    );
  }

  return (
    <FlatList
      data={images}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item, index) => index.toString()}
      renderItem={({ item }) => (
        <Image source={{ uri: item }} style={styles.galleryImage} />
      )}
    />
  );
};

// Componente para un "Tag" o "Chip" de categoría
const InfoChip = ({ icon, text }) => (
  <View style={styles.chip}>
    <Ionicons name={icon} size={16} color="#6E4BFF" />
    <Text style={styles.chipText}>{text}</Text>
  </View>
);

const DestinoDetailScreen = ({ navigation }) => {
  const route = useRoute();
  const { destinoId } = route.params;

  const [destino, setDestino] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      if (!destinoId) {
        setError("No se proporcionó un ID.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await fetchDestinoByIdAPI(destinoId);
        setDestino(res.data);
      } catch (err) {
        setError("Error al cargar el destino.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [destinoId]);

  const Header = () => (
    <TouchableOpacity
      style={styles.backButton}
      onPress={() => navigation.goBack()}
    >
      <Ionicons name="arrow-back-outline" size={28} color="#FFFFFF" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6E4BFF" />
      </View>
    );
  }

  if (error || !destino) {
    return (
      <SafeAreaView style={styles.centered}>
        <Header />
        <Text style={styles.errorText}>{error || "No se encontró el destino."}</Text>
      </SafeAreaView>
    );
  }

  const allImages = [
    destino.imagenPrincipal,
    ...(destino.galeriaImagenes || []),
  ].filter(Boolean); 

  const mapRegion = {
    latitude: parseFloat(destino.latitud) || 0,
    longitude: parseFloat(destino.longitud) || 0,
    latitudeDelta: 0.01, 
    longitudeDelta: 0.01,
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <Header />
      <ScrollView style={styles.container}>
        <View style={styles.galleryContainer}>
          <ImageGallery images={allImages} />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{destino.nombre}</Text>
          
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={18} color="#5A6B6F" />
            <Text style={styles.locationText}>{destino.ubicacion}</Text>
          </View>

          <View style={styles.chipsContainer}>
            {destino.categoriaViaje && (
              <InfoChip icon="paper-plane-outline" text={destino.categoriaViaje} />
            )}
            {destino.tipoViaje && (
              <InfoChip icon="time-outline" text={destino.tipoViaje} />
            )}
          </View>

          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.description}>{destino.descripcion}</Text>

          {mapRegion.latitude !== 0 && (
            <>
              <Text style={styles.sectionTitle}>Ubicación</Text>
              <View style={styles.mapContainer}>
                <MapView style={styles.map} initialRegion={mapRegion}>
                  <Marker
                    coordinate={mapRegion}
                    title={destino.nombre}
                  />
                </MapView>
              </View>
            </>
          )}

          {destino.categoriaActividades && destino.categoriaActividades.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Actividades</Text>
              <View style={styles.chipsContainer}>
                {destino.categoriaActividades.map((act) => (
                  <InfoChip key={act} icon="walk-outline" text={act} />
                ))}
              </View>
            </>
          )}

        </View>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.reservarButton} 
          onPress={() => navigation.navigate('ReservaScreen', { destino: destino })}
        >
          <Text style={styles.reservarButtonText}>Reservar Ahora</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  container: { flex: 1 },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  errorText: {
    fontSize: 16,
    color: "#D9534F",
  },
  
  galleryContainer: {
    width: width,
    height: width * 0.8,
    backgroundColor: "#F8F9FA",
  },
  galleryPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  galleryImage: {
    width: width,
    height: "100%",
    resizeMode: "cover",
  },
  

  backButton: {
    position: "absolute",
    top: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 50,
    left: 20,
    zIndex: 10,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  content: {
    padding: 20,
    paddingTop: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#2F4750",
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  locationText: {
    fontSize: 16,
    color: "#5A6B6F",
    marginLeft: 6,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2F4750",
    marginTop: 24,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: "#5A6B6F",
    lineHeight: 22,
  },

  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E9ECEF",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "600",
    color: "#2F4750",
  },

  // Mapa
  mapContainer: {
    height: 200,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  footer: {
    padding: 20,
    paddingTop: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 5,
  },
  reservarButton: {
    backgroundColor: '#6E4BFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reservarButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default DestinoDetailScreen;