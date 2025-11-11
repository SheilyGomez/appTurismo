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
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { fetchDestinoByIdAPI } from "../api/apiDestinos";
import MapView, { Marker } from "react-native-maps";
import { 
  getResenasAPI, 
  createResenaAPI, 
  updateResenaAPI, 
  deleteResenaAPI 
} from "../api/apiResenas";
import { getRemoteProfile } from "../api/apiPerfil"; 

import * as ImagePicker from 'expo-image-picker';
const CLOUDINARY_CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

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

const InfoChip = ({ icon, text }) => (
  <View style={styles.chip}>
    <Ionicons name={icon} size={16} color="#6E4BFF" />
    <Text style={styles.chipText}>{text}</Text>
  </View>
);

const StarRatingDisplay = ({ rating, size = 16 }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <View style={styles.starsRow}>
      {[...Array(fullStars)].map((_, i) => (
        <Ionicons key={`full_${i}`} name="star" size={size} color="#FFCC5C" />
      ))}
      {hasHalfStar && (
        <Ionicons key="half" name="star-half" size={size} color="#FFCC5C" />
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <Ionicons key={`empty_${i}`} name="star-outline" size={size} color="#FFCC5C" />
      ))}
    </View>
  );
};

const StarRatingInput = ({ rating, setRating }) => {
  return (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity key={star} onPress={() => setRating(star)}>
          <Ionicons
            name={star <= rating ? "star" : "star-outline"}
            size={36}
            color={star <= rating ? "#6E4BFF" : "#8DA6A9"}
            style={{ marginRight: 10 }}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const ResenaCard = ({ resena, currentUser, onEdit, onDelete }) => {
  let fechaString;
  const fc = resena.fechaCreacion;
  if (!fc) {
    fechaString = "Fecha desconocida";
  } else if (fc.seconds) {
    fechaString = new Date(fc.seconds * 1000).toLocaleDateString('es-ES');
  } else if (fc._seconds) {
    fechaString = new Date(fc._seconds * 1000).toLocaleDateString('es-ES');
  } else {
    fechaString = new Date(fc).toLocaleDateString('es-ES');
  }
  if (fechaString === 'Invalid Date') {
    fechaString = 'Fecha inválida';
  }

  const esPropietario = currentUser && currentUser.uid === resena.usuarioId;

  return (
    <View style={styles.resenaCard}>
      <View style={styles.resenaHeader}>
        <View style={styles.resenaAvatar}>
          {resena.usuarioInfo?.profileImageUrl ? (
            <Image
              style={styles.resenaAvatarImage}
              source={{ uri: resena.usuarioInfo.profileImageUrl }}
            />
          ) : (
            <Ionicons name="person" size={20} color="#8DA6A9" />
          )}
        </View>

        <View style={styles.resenaHeaderInfo}>
          <Text style={styles.resenaUser}>{resena.usuarioInfo?.nombreUsuario || "Anónimo"}</Text>
          <Text style={styles.resenaDate}>{fechaString}</Text>
        </View>
        <StarRatingDisplay rating={resena.calificacion} />
      </View>
      <Text style={styles.resenaComment}>{resena.comentario}</Text>
      
      {resena.fotosURLs && resena.fotosURLs.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginTop: 10}}>
          {resena.fotosURLs.map((url, index) => (
            <Image key={index} source={{ uri: url }} style={styles.resenaFoto} />
          ))}
        </ScrollView>
      )}

      {esPropietario && (
        <View style={styles.resenaActions}>
          <TouchableOpacity style={styles.resenaButton} onPress={() => onEdit(resena)}>
            <Ionicons name="pencil-outline" size={16} color="#6E4BFF" />
            <Text style={styles.resenaButtonText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.resenaButton} onPress={() => onDelete(resena.id)}>
            <Ionicons name="trash-outline" size={16} color="#D9534F" />
            <Text style={[styles.resenaButtonText, {color: '#D9534F'}]}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};


const DestinoDetailScreen = ({ navigation }) => {
  const route = useRoute();
  const { destinoId } = route.params;

  const [destino, setDestino] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resenas, setResenas] = useState([]);
  const [loadingResenas, setLoadingResenas] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  const [currentUser, setCurrentUser] = useState(null);
  const [modalCrearVisible, setModalCrearVisible] = useState(false);
  const [modalEditarVisible, setModalEditarVisible] = useState(false);
  const [resenaSeleccionada, setResenaSeleccionada] = useState(null); // Para editar

  const [newResenaRating, setNewResenaRating] = useState(0);
  const [newResenaComment, setNewResenaComment] = useState("");
  const [newResenaFotos, setNewResenaFotos] = useState([]); 
  
  const [editResenaRating, setEditResenaRating] = useState(0);
  const [editResenaComment, setEditResenaComment] = useState("");


  useEffect(() => {
    const loadAllData = async () => {
      if (!destinoId) {
        setError("No se proporcionó un ID.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setLoadingResenas(true);

        const [destinoRes, resenasRes, profileRes] = await Promise.all([
          fetchDestinoByIdAPI(destinoId),
          getResenasAPI(destinoId),
          getRemoteProfile() // Cargar perfil del usuario logueado
        ]);

        setDestino(destinoRes.data);
        setResenas(resenasRes.data);
        setCurrentUser(profileRes); // Guardar el usuario

      } catch (err) {
        setError("Error al cargar los datos.");
        console.error(err);
      } finally {
        setLoading(false);
        setLoadingResenas(false);
      }
    };
    loadAllData();
  }, [destinoId]);

  const handleOpenCreateModal = () => {
    setNewResenaRating(0);
    setNewResenaComment("");
    setNewResenaFotos([]);
    setModalCrearVisible(true);
  };

  const handleSubirFoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos permiso para acceder a tu galería.');
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets) {
      setNewResenaFotos(prev => [...prev, ...result.assets.map(asset => asset.uri)]);
    }
  };

  const uploadImagesToCloudinary = async (imageUris) => {
    if (imageUris.length === 0) return [];
    
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      console.error("Cloudinary Cloud Name o Upload Preset no están definidos.");
      Alert.alert("Error de Configuración", "No se puede subir la imagen, faltan claves.");
      return null;
    }

    setIsUploadingImages(true);
    const uploadedUrls = [];
    
    try {
      await Promise.all(
        imageUris.map(async (uri) => {
          const formData = new FormData();
          const filename = uri.split('/').pop();
          const fileType = 'image/jpeg';
          formData.append('file', { uri: uri, name: filename, type: fileType });
          formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
          
          const response = await fetch(CLOUDINARY_UPLOAD_URL, {
            method: 'POST',
            body: formData,
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          const data = await response.json();
          if (data.secure_url) {
            uploadedUrls.push(data.secure_url);
          }
        })
      );
    } catch (error) {
      console.error("Error al subir una imagen a Cloudinary:", error);
      Alert.alert("Error", "No se pudieron subir algunas imágenes.");
      setIsUploadingImages(false);
      return null;
    }
    setIsUploadingImages(false);
    return uploadedUrls;
  };

  const handleSubmitResena = async () => {
    if (newResenaRating === 0 || !newResenaComment) {
      Alert.alert("Error", "Por favor, anade una calificacion y un comentario.");
      return;
    }
    setIsSubmitting(true);
    const fotosURLs = await uploadImagesToCloudinary(newResenaFotos);
    if (fotosURLs === null) {
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await createResenaAPI({
        destinoId: destinoId,
        comentario: newResenaComment,
        calificacion: newResenaRating,
        fotosURLs: fotosURLs,
      });

      setModalCrearVisible(false);
      Alert.alert("¡Gracias!", "Tu resena ha sido publicada.");
      
      setResenas(prevResenas => [res.data.resena, ...prevResenas]); // Añadir la nueva reseña al inicio
      const destinoResponse = await fetchDestinoByIdAPI(destinoId); // Solo refrescar el destino
      setDestino(destinoResponse.data);

    } catch (err) {
      Alert.alert("Error", "No se pudo publicar tu resena.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEditModal = (resena) => {
    setResenaSeleccionada(resena);
    setEditResenaRating(resena.calificacion);
    setEditResenaComment(resena.comentario);
    setModalEditarVisible(true);
  };

  const handleUpdateResena = async () => {
    if (!resenaSeleccionada) return;
    
    setIsSubmitting(true);
    try {
      await updateResenaAPI(resenaSeleccionada.id, {
        comentario: editResenaComment,
        calificacion: editResenaRating
      });

      setModalEditarVisible(false);
      setResenaSeleccionada(null);
      Alert.alert("Éxito", "Tu resena ha sido actualizada.");

      // Refrescar datos
      const [res, destinoRes] = await Promise.all([
        getResenasAPI(destinoId),
        fetchDestinoByIdAPI(destinoId)
      ]);
      setResenas(res.data);
      setDestino(destinoRes.data);

    } catch (err) {
      Alert.alert("Error", "No se pudo actualizar tu resena.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteResena = (resenaId) => {
    Alert.alert(
      "Eliminar Resena",
      "¿Estás seguro de que quieres eliminar tu resena? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive",
          onPress: async () => {
            try {
              await deleteResenaAPI(resenaId);
              Alert.alert("Éxito", "Tu resena ha sido eliminada.");

              // Refrescar datos
              const [res, destinoRes] = await Promise.all([
                getResenasAPI(destinoId),
                fetchDestinoByIdAPI(destinoId)
              ]);
              setResenas(res.data);
              setDestino(destinoRes.data);

            } catch (err) {
              Alert.alert("Error", "No se pudo eliminar tu resena.");
            }
          }
        }
      ]
    );
  };

  const Header = () => (
    <TouchableOpacity
      style={styles.backButton}
      onPress={() => navigation.goBack()}
    >
      <Ionicons name="arrow-back-outline" size={28} color="#FFFFFF" />
    </TouchableOpacity>
  );

  // Estados de Carga
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
          
          <View style={styles.ratingSummary}>
            <StarRatingDisplay rating={destino.valoracionPromedio || 0} size={20} />
            <Text style={styles.ratingText}>
              {destino.valoracionPromedio ? destino.valoracionPromedio.toFixed(1) : "N/A"}
              <Text style={styles.ratingCount}>
                {" "} ({destino.numReviews || 0} resenas)
              </Text>
            </Text>
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

          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Resenas</Text>
            <TouchableOpacity style={styles.writeReviewButton} onPress={handleOpenCreateModal}>
              <Text style={styles.writeReviewButtonText}>Escribir resena</Text>
            </TouchableOpacity>
          </View>

          {loadingResenas ? (
            <ActivityIndicator color="#6E4BFF" style={{marginTop: 20}} />
          ) : resenas.length === 0 ? (
            <Text style={styles.resenaEmpty}>Aun no hay resenas. ¡Se el primero!</Text>
          ) : (

            resenas.map((item, index) => (
              <ResenaCard 
                key={item.id || `resena_${index}`} 
                resena={item} 
                currentUser={currentUser}
                onEdit={handleOpenEditModal}
                onDelete={handleDeleteResena}
              />
            ))
          )}

          {mapRegion.latitude !== 0 && (
            <>
              <Text style={styles.sectionTitle}>Ubicación</Text>
              <View style={styles.mapContainer}>
                <MapView style={styles.map} initialRegion={mapRegion}>
                  <Marker coordinate={mapRegion} title={destino.nombre} />
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
        
        <View style={{height: 50}} />

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.reservarButton}
          onPress={() => navigation.navigate("ReservaScreen", { destino: destino })}
        >
          <Text style={styles.reservarButtonText}>Reservar Ahora</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalCrearVisible}
        onRequestClose={() => setModalCrearVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Escribe tu Resena</Text>
            
            <Text style={styles.modalLabel}>Tu Calificacion</Text>
            <StarRatingInput
              rating={newResenaRating}
              setRating={setNewResenaRating}
            />
            
            <Text style={styles.modalLabel}>Tu Comentario</Text>
            <TextInput
              style={styles.modalTextInput}
              placeholder="Comparte tu experiencia..."
              placeholderTextColor="#8DA6A9"
              multiline
              numberOfLines={4}
              value={newResenaComment}
              onChangeText={setNewResenaComment}
            />

            <Text style={styles.modalLabel}>Fotos (Opcional)</Text>
            <TouchableOpacity 
              style={styles.modalFotoButton} 
              onPress={handleSubirFoto} 
              disabled={isUploadingImages || isSubmitting}
            >
              {isUploadingImages ? (
                <ActivityIndicator size="small" color="#6E4BFF" />
              ) : (
                <Ionicons name="camera-outline" size={20} color="#6E4BFF" />
              )}
              <Text style={styles.modalFotoButtonText}>
                {isUploadingImages ? 'Subiendo...' : 'Subir Fotos'}
              </Text>
            </TouchableOpacity>

            {newResenaFotos.length > 0 && (
              <ScrollView horizontal style={styles.selectedPhotosContainer}>
                {newResenaFotos.map((uri, index) => (
                  <Image key={index} source={{ uri: uri }} style={styles.selectedPhoto} />
                ))}
              </ScrollView>
            )}

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonClose]}
                onPress={() => setModalCrearVisible(false)}
                disabled={isSubmitting || isUploadingImages}
              >
                <Text style={styles.modalButtonCloseText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSubmit]}
                onPress={handleSubmitResena}
                disabled={isSubmitting || isUploadingImages}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalButtonSubmitText}>Publicar</Text>
                )}
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalEditarVisible}
        onRequestClose={() => setModalEditarVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar tu Resena</Text>
            
            <Text style={styles.modalLabel}>Tu Calificacion</Text>
            <StarRatingInput
              rating={editResenaRating}
              setRating={setEditResenaRating}
            />
            
            <Text style={styles.modalLabel}>Tu Comentario</Text>
            <TextInput
              style={styles.modalTextInput}
              placeholder="Edita tu experiencia..."
              placeholderTextColor="#8DA6A9"
              multiline
              numberOfLines={4}
              value={editResenaComment}
              onChangeText={setEditResenaComment}
            />
            
            <Text style={styles.modalLabelSmall}>La edición de fotos no está disponible.</Text>

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonClose]}
                onPress={() => setModalEditarVisible(false)}
                disabled={isSubmitting}
              >
                <Text style={styles.modalButtonCloseText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSubmit]}
                onPress={handleUpdateResena}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalButtonSubmitText}>Guardar Cambios</Text>
                )}
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

// --- ❗️ 10. ESTILOS (Añadidos para botones de editar/eliminar y modal) ---
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
  
  // --- Estilos de Resenas ---
  starsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingSummary: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2F4750",
    marginLeft: 8,
  },
  ratingCount: {
    fontSize: 14,
    fontWeight: "400",
    color: "#5A6B6F",
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  writeReviewButton: {
    backgroundColor: '#F0EFFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  writeReviewButtonText: {
    color: '#6E4BFF',
    fontWeight: '600',
    fontSize: 14,
  },
  resenaEmpty: {
    textAlign: 'center',
    color: '#8DA6A9',
    marginTop: 20,
    fontStyle: 'italic',
  },
  resenaCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  resenaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  resenaAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  resenaAvatarImage: {
    width: '100%',
    height: '100%',
  },
  resenaHeaderInfo: {
    flex: 1,
  },
  resenaUser: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2F4750',
  },
  resenaDate: {
    fontSize: 12,
    color: '#8DA6A9',
  },
  resenaComment: {
    fontSize: 14,
    color: '#5A6B6F',
    lineHeight: 20,
  },
  resenaFoto: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: '#F0F0F0',
  },
  // ❗️ Nuevos estilos para botones de acción
  resenaActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    marginTop: 12,
    paddingTop: 12,
  },
  resenaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  resenaButtonText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#6E4BFF',
  },
  
  // --- Estilos del Modal ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2F4750',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2F4750',
    marginTop: 16,
    marginBottom: 10,
  },
  modalLabelSmall: {
    fontSize: 12,
    fontWeight: '400',
    color: '#8DA6A9',
    textAlign: 'center',
    marginTop: 16,
  },
  modalTextInput: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#2F4750',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  modalFotoButton: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalFotoButtonText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#6E4BFF',
  },
  selectedPhotosContainer: {
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 10,
  },
  selectedPhoto: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: '#E9ECEF',
    resizeMode: 'cover',
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonClose: {
    backgroundColor: '#F8F9FA',
    marginRight: 10,
  },
  modalButtonCloseText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2F4750',
  },
  modalButtonSubmit: {
    backgroundColor: '#6E4BFF',
    marginLeft: 10,
  },
  modalButtonSubmitText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },

});

export default DestinoDetailScreen;