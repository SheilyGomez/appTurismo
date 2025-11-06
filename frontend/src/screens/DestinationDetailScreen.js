// DestinationDetailScreen.js
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TextInput,
  Dimensions,
  Animated,
  Easing,
  FlatList,
  Alert,
  Modal,
} from "react-native";
import { Ionicons, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

/*
  DestinationDetailScreen
  - Vista detallada para un lugar turístico (hotel / restaurante / parque / etc)
  - Muestra fotos, descripción, categorías, actividades, reseñas
  - Permite reservas (elegir fecha, personas) y simula pago
  - Las reseñas pueden incluir usuario, calificación, foto/video URL, tipo de viaje, presupuesto
  - Permite filtrar reseñas
*/

const sampleDestination = {
  id: "dest1",
  name: "Decameron Resort",
  category: "Hotel",
  location: "Playa Dorada, Costa Rica",
  rating: 4.7,
  reviewsCount: 312,
  priceLabel: "$120 / noche",
  heroImages: [
    "https://images.unsplash.com/photo-1501117716987-c8e6a7a6f3b0?w=1200&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1505765055605-4c22569c4a27?w=1200&q=80&auto=format&fit=crop",
  ],
  description:
    "Decameron Resort ofrece habitaciones frente a la playa, entretenimiento nocturno, caminatas guiadas, cenas gourmet y actividades familiares. Perfecto para una escapada de verano: piscina, spa y tours organizados.",
  activities: [
    { id: "a1", title: "Caminata en la Playa al Atardecer", type: "walk", duration: "2h", price: 20 },
    { id: "a2", title: "Excursión Guiada por la Jungla", type: "tour", duration: "4h", price: 45 },
    { id: "a3", title: "Cena Romántica", type: "dining", duration: "2h", price: 60 },
    { id: "a4", title: "Yoga junto a la Piscina", type: "wellness", duration: "1h", price: 15 },
    { id: "a5", title: "Reserva de Habitación (Estándar)", type: "hotel", duration: "noche", price: 120 },
  ],
};

// reseñas de ejemplo
const sampleReviews = [
  {
    id: "r1",
    user: "Maria M.",
    rating: 5,
    text: "Increíble experiencia. La cena en la playa fue mágica.",
    media: ["https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?w=800&q=60&auto=format&fit=crop"],
    mediaVideo: "",
    tripType: "Romántico",
    budget: 150,
    date: "2025-07-12",
  },
  {
    id: "r2",
    user: "Carlos R.",
    rating: 4,
    text: "Tours excelentes y guías preparados. Habitaciones cómodas.",
    media: [],
    mediaVideo: "",
    tripType: "Familiar",
    budget: 300,
    date: "2025-06-02",
  },
  {
    id: "r3",
    user: "Luz P.",
    rating: 5,
    text: "Perfecto para desconectarse. Hermosa playa y senderos.",
    media: ["https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=60&auto=format&fit=crop"],
    mediaVideo: "",
    tripType: "Aventura",
    budget: 90,
    date: "2025-05-18",
  },
];

// funciones auxiliares
const formatDateReadable = (d) => {
  const date = new Date(d);
  return date.toLocaleDateString();
};

export default function DestinationDetailScreen({ navigation, route }) {
  // el destino puede pasarse mediante route.params.item
  const dest = route?.params?.item || sampleDestination;

  // estado
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [dateSelected, setDateSelected] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  });
  const [peopleCount, setPeopleCount] = useState(2);
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // reseñas
  const [reviews, setReviews] = useState(sampleReviews);
  const [filters, setFilters] = useState({
    minRating: 0,
    tripType: "Todos",
    budgetMax: 10000,
  });

  // formulario para agregar reseña
  const [newReviewText, setNewReviewText] = useState("");
  const [newReviewUser, setNewReviewUser] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewMediaUrl, setNewReviewMediaUrl] = useState("");
  const [newReviewTripType, setNewReviewTripType] = useState("Ocio");
  const [newReviewBudget, setNewReviewBudget] = useState("");

  // animaciones
  const headerAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const sheen = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    Animated.stagger(120, [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 550,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(contentAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.timing(sheen, {
        toValue: 1,
        duration: 1600,
        easing: Easing.inOut(Easing.linear),
        useNativeDriver: true,
      })
    ).start();

    return () => sheen.stopAnimation();
  }, []);

  // manejadores del carrusel de imágenes
  const onNextImage = () => {
    setActiveImageIndex((i) => (i + 1) % dest.heroImages.length);
  };
  const onPrevImage = () => {
    setActiveImageIndex((i) => (i - 1 + dest.heroImages.length) % dest.heroImages.length);
  };

  // selector simple de fecha incrementar/decrementar
  const addDays = (days) => {
    setDateSelected((d) => {
      const next = new Date(d);
      next.setDate(next.getDate() + days);
      return next;
    });
  };

  const applyFilter = (partial) => setFilters((f) => ({ ...f, ...partial }));

  const filteredReviews = reviews.filter((r) => {
    if (r.rating < filters.minRating) return false;
    if (filters.tripType !== "Todos" && r.tripType !== filters.tripType) return false;
    if (r.budget > filters.budgetMax) return false;
    return true;
  });

  // flujo de reserva: abrir modal -> elegir fecha/personas -> simular pago
  const startReservation = (activity) => {
    setSelectedActivity(activity);
    setPeopleCount(2);
    setDateSelected(new Date());
    setShowReserveModal(true);
  };

  const confirmReservation = () => {
    // abrir modal de pago
    setShowReserveModal(false);
    setShowPaymentModal(true);
  };

  const payAndComplete = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowPaymentModal(false);
      Alert.alert("Reserva confirmada", `Tu reserva para ${selectedActivity.title} el ${formatDateReadable(dateSelected)} ha sido realizada.`);
      setSelectedActivity(null);
    }, 1800);
  };

  // agregar reseña
  const submitReview = () => {
    if (!newReviewUser || !newReviewText) {
      Alert.alert("Información faltante", "Por favor agrega tu nombre y texto de reseña.");
      return;
    }
    const newRev = {
      id: "r" + Math.random().toString(36).slice(2, 9),
      user: newReviewUser,
      rating: newReviewRating,
      text: newReviewText,
      media: newReviewMediaUrl ? [newReviewMediaUrl] : [],
      mediaVideo: newReviewMediaUrl && newReviewMediaUrl.includes("youtube") ? newReviewMediaUrl : "",
      tripType: newReviewTripType,
      budget: Number(newReviewBudget || 0),
      date: new Date().toISOString().split("T")[0],
    };
    setReviews((s) => [newRev, ...s]);
    // resetear
    setNewReviewUser("");
    setNewReviewText("");
    setNewReviewRating(5);
    setNewReviewMediaUrl("");
    setNewReviewTripType("Ocio");
    setNewReviewBudget("");
  };

  // traducción del brillo para el botón de pago
  const sheenTranslate = sheen.interpolate({
    inputRange: [-1, 1],
    outputRange: [-width * 0.9, width * 0.9],
  });

  // componentes pequeños de UI
  const RatingStars = ({ value, size = 14 }) => {
    const full = Math.floor(value);
    return (
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Ionicons key={i} name={i < full ? "star" : "star-outline"} size={size} color="#FFCD4A" style={{ marginRight: 3 }} />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerAnim,
            transform: [
              {
                translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] }),
              },
              {
                scale: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [0.995, 1] }),
              },
            ],
          },
        ]}
      >
        <LinearGradient colors={["#D8C6FF", "#C5E8FF", "#FFF1D6"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.headerGradient}>
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={20} color="#23383A" />
            </TouchableOpacity>
            <View style={{ flex: 1, paddingHorizontal: 12 }}>
              <Text style={styles.title}>{dest.name}</Text>
              <Text style={styles.subtitle}>{dest.location}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <RatingStars value={dest.rating} />
              <Text style={styles.smallMuted}>{dest.rating.toFixed(1)} · {dest.reviewsCount} reseñas</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Carrusel de imágenes */}
        <Animated.View style={[styles.imageCarousel, { opacity: contentAnim }]}>
          <Image source={{ uri: dest.heroImages[activeImageIndex] }} style={styles.heroImage} resizeMode="cover" />
          <View style={styles.carouselControls}>
            <TouchableOpacity onPress={onPrevImage} style={styles.carouselBtn}><Ionicons name="chevron-back" size={20} color="#fff" /></TouchableOpacity>
            <View style={styles.imageDots}>
              {dest.heroImages.map((_, i) => <View key={i} style={[styles.dot, i === activeImageIndex && styles.dotActive]} />)}
            </View>
            <TouchableOpacity onPress={onNextImage} style={styles.carouselBtn}><Ionicons name="chevron-forward" size={20} color="#fff" /></TouchableOpacity>
          </View>
        </Animated.View>

        {/* Descripción y categorías */}
        <Animated.View style={[styles.card, { opacity: contentAnim, transform: [{ translateY: contentAnim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }]}>
          <Text style={styles.sectionTitle}>Acerca de</Text>
          <Text style={styles.description}>{dest.description}</Text>

          <View style={{ flexDirection: "row", marginTop: 12, flexWrap: "wrap" }}>
            <View style={[styles.chip, { backgroundColor: "#F2E9FF" }]}><Text style={styles.chipText}>#{dest.category}</Text></View>
            <View style={[styles.chip, { backgroundColor: "#E8F7FF" }]}><Text style={styles.chipText}>#playa</Text></View>
            <View style={[styles.chip, { backgroundColor: "#FFF3E0" }]}><Text style={styles.chipText}>#familiar</Text></View>
            <View style={[styles.chip, { backgroundColor: "#E7FFF4" }]}><Text style={styles.chipText}>#aventura</Text></View>
          </View>
        </Animated.View>

        {/* Lista de actividades */}
        <Animated.View style={[styles.card, { opacity: contentAnim, marginTop: 14 }]}>
          <Text style={styles.sectionTitle}>Actividades</Text>
          {dest.activities.map((act) => (
            <View key={act.id} style={styles.activityRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.activityTitle}>{act.title}</Text>
                <Text style={styles.activityMeta}>{act.duration} • {act.type} • ${act.price}</Text>
              </View>
              <TouchableOpacity style={styles.bookBtn} onPress={() => startReservation(act)}>
                <LinearGradient colors={["#C7B2FF", "#FFD8B2"]} style={styles.bookGradient}>
                  <Text style={styles.bookText}>Reservar</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ))}
        </Animated.View>

        {/* Reseñas + filtros */}
        <Animated.View style={[styles.card, { opacity: contentAnim, marginTop: 14 }]}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={styles.sectionTitle}>Reseñas</Text>
            <Text style={styles.smallMuted}>{reviews.length} en total</Text>
          </View>

          {/* Fila de filtros */}
          <View style={styles.filtersRow}>
            <View style={styles.filterInput}>
              <Text style={styles.filterLabel}>Calificación mínima</Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {[0,1,2,3,4,5].map((r) => (
                  <TouchableOpacity key={r} onPress={() => applyFilter({ minRating: r })} style={{ marginRight: 6 }}>
                    <Text style={[styles.filterTag, filters.minRating === r && styles.filterTagActive]}>{r}★</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterInput}>
              <Text style={styles.filterLabel}>Tipo de viaje</Text>
              <View style={{ flexDirection: "row" }}>
                {["Todos","Ocio","Aventura","Familiar","Romántico"].map((t) => (
                  <TouchableOpacity key={t} onPress={() => applyFilter({ tripType: t })} style={{ marginRight: 6 }}>
                    <Text style={[styles.filterTag, filters.tripType === t && styles.filterTagActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={{ marginTop: 12 }}>
            {filteredReviews.length === 0 ? (
              <Text style={styles.smallMuted}>No hay reseñas para estos filtros.</Text>
            ) : (
              filteredReviews.map((rv) => (
                <View key={rv.id} style={styles.reviewRow}>
                  <View style={styles.avatarCircle}><Text style={{ color: "#fff", fontWeight: "800" }}>{rv.user[0]}</Text></View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                      <Text style={styles.reviewUser}>{rv.user}</Text>
                      <Text style={styles.smallMuted}>{rv.date}</Text>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}>
                      <RatingStars value={rv.rating} />
                      <Text style={{ marginLeft: 8, color: "#556B6D" }}>{rv.tripType} • ${rv.budget}</Text>
                    </View>
                    <Text style={styles.reviewText}>{rv.text}</Text>
                    {rv.media && rv.media.length > 0 && (
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                        {rv.media.map((m, i) => (
                          <Image key={i} source={{ uri: m }} style={styles.reviewMedia} />
                        ))}
                      </ScrollView>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Agregar reseña */}
          <View style={{ marginTop: 14 }}>
            <Text style={[styles.sectionTitle, { fontSize: 16 }]}>Agregar una reseña</Text>
            <TextInput placeholder="Tu nombre" value={newReviewUser} onChangeText={setNewReviewUser} style={styles.inputSimple} />
            <TextInput placeholder="Tu reseña" value={newReviewText} onChangeText={setNewReviewText} style={[styles.inputSimple, { height: 80 }]} multiline />
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
              <Text style={{ marginRight: 8 }}>Calificación:</Text>
              {[1,2,3,4,5].map((r) => (
                <TouchableOpacity key={r} onPress={() => setNewReviewRating(r)}>
                  <Ionicons name={r <= newReviewRating ? "star" : "star-outline"} size={22} color="#FFCD4A" style={{ marginRight: 6 }} />
                </TouchableOpacity>
              ))}
            </View>
            <TextInput placeholder="URL de foto o video (opcional)" value={newReviewMediaUrl} onChangeText={setNewReviewMediaUrl} style={styles.inputSimple} />
            <View style={{ flexDirection: "row", marginTop: 8 }}>
              <TextInput placeholder="Tipo de viaje" value={newReviewTripType} onChangeText={setNewReviewTripType} style={[styles.inputSimple, { flex: 1, marginRight: 8 }]} />
              <TextInput placeholder="Presupuesto" value={newReviewBudget} onChangeText={setNewReviewBudget} style={[styles.inputSimple, { width: 100 }]} keyboardType="numeric" />
            </View>
            <TouchableOpacity onPress={submitReview} style={[styles.smallPrimaryBtn, { marginTop: 10 }]}>
              <LinearGradient colors={["#C7B2FF", "#FFD8B2"]} style={styles.smallPrimaryGradient}>
                <Text style={{ fontWeight: "800", color: "#23383A" }}>Enviar reseña</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Espaciador */}
        <View style={{ height: 18 }} />
      </ScrollView>

      {/* Modal de Reserva */}
      <Modal visible={showReserveModal} animationType="slide" transparent onRequestClose={() => setShowReserveModal(false)}>
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalCard, { transform: [{ translateY: 0 }] }]}>
            <Text style={styles.sectionTitle}>Reservar: {selectedActivity?.title}</Text>
            <Text style={styles.smallMuted}>Elige fecha y número de personas</Text>

            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 12 }}>
              <TouchableOpacity style={styles.dateNav} onPress={() => addDays(-1)}><Ionicons name="chevron-back" size={20} color="#23383A" /></TouchableOpacity>
              <View style={{ flex: 1, alignItems: "center" }}>
                <Text style={{ fontWeight: "800" }}>{formatDateReadable(dateSelected)}</Text>
                <Text style={styles.smallMuted}>Toca las flechas para cambiar fecha</Text>
              </View>
              <TouchableOpacity style={styles.dateNav} onPress={() => addDays(1)}><Ionicons name="chevron-forward" size={20} color="#23383A" /></TouchableOpacity>
            </View>

            <View style={{ flexDirection: "row", marginTop: 14, alignItems: "center" }}>
              <Text style={{ marginRight: 12 }}>Personas</Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => setPeopleCount((p) => Math.max(1, p - 1))}><Text style={styles.qtyTxt}>-</Text></TouchableOpacity>
              <Text style={{ marginHorizontal: 12, fontWeight: "800" }}>{peopleCount}</Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => setPeopleCount((p) => Math.min(12, p + 1))}><Text style={styles.qtyTxt}>+</Text></TouchableOpacity>
            </View>

            <View style={{ flexDirection: "row", marginTop: 18 }}>
              <TouchableOpacity style={[styles.modalAction]} onPress={() => setShowReserveModal(false)}>
                <Text style={{ color: "#777" }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalAction, { marginLeft: 12 }]} onPress={confirmReservation}>
                <LinearGradient colors={["#C7B2FF", "#FFD8B2"]} style={{ paddingVertical: 10, paddingHorizontal: 20, borderRadius: 12 }}>
                  <Text style={{ fontWeight: "800", color: "#23383A" }}>Continuar al pago</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* Modal de Pago (simulado) */}
      <Modal visible={showPaymentModal} animationType="slide" transparent onRequestClose={() => setShowPaymentModal(false)}>
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalCard, { transform: [{ translateY: 0 }] }]}>
            <Text style={styles.sectionTitle}>Pago</Text>
            <Text style={styles.smallMuted}>Pagar por {selectedActivity?.title} • ${selectedActivity?.price} </Text>

            <View style={{ marginTop: 12 }}>
              <Text style={{ fontSize: 13, color: "#6A8B90" }}>Número de tarjeta</Text>
              <TextInput style={styles.inputSimple} placeholder="1234 5678 9012 3456" keyboardType="numeric" />
              <View style={{ flexDirection: "row", marginTop: 8 }}>
                <TextInput style={[styles.inputSimple, { flex: 1, marginRight: 8 }]} placeholder="MM/AA" />
                <TextInput style={[styles.inputSimple, { width: 100 }]} placeholder="CVV" keyboardType="numeric" />
              </View>
            </View>

            <View style={{ flexDirection: "row", marginTop: 18 }}>
              <TouchableOpacity style={[styles.modalAction]} onPress={() => setShowPaymentModal(false)}>
                <Text style={{ color: "#777" }}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.payNowBtn, { marginLeft: 12 }]} onPress={payAndComplete} disabled={isProcessing}>
                <LinearGradient colors={["#C7B2FF", "#FFD8B2"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ borderRadius: 12, overflow: "hidden" }}>
                  <View style={{ paddingVertical: 12, paddingHorizontal: 18 }}>
                    <View style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}>
                      <Animated.View style={[styles.sheen, { transform: [{ translateX: sheenTranslate }], opacity: 0.25 }]} />
                    </View>
                    <Text style={{ fontWeight: "900", color: "#23383A" }}>{isProcessing ? "Procesando..." : `Pagar $${selectedActivity?.price}`}</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* Estilos: tropical moderno (lavanda / celeste / dorado arena), limpio y tarjetas flotantes */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  screen: { flex: 1, backgroundColor: "#FFFFFF" },

  // encabezado
  header: { paddingHorizontal: 16, marginTop: 12 },
  headerGradient: {
    borderRadius: 18,
    padding: 14,
    shadowColor: "#A89BFF",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 6,
  },
  headerRow: { flexDirection: "row", alignItems: "center" },
  iconBtn: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(255,255,255,0.7)" },
  title: { fontSize: 18, fontWeight: "900", color: "#23383A" },
  subtitle: { color: "#6A8B90", fontSize: 12 },

  smallMuted: { color: "#7D8F90", fontSize: 12 },

  // carrusel
  imageCarousel: { marginTop: 12, width: "100%", height: 200, borderRadius: 16, overflow: "hidden", backgroundColor: "#F4FBFF" },
  heroImage: { width: "100%", height: "100%" },
  carouselControls: { position: "absolute", left: 10, right: 10, bottom: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  carouselBtn: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.25)" },
  imageDots: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.45)", marginHorizontal: 4 },
  dotActive: { backgroundColor: "#FFF" },

  // tarjeta flotante
  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 14,
    marginTop: 12,
    shadowColor: "#B7DADB",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 20,
    elevation: 6,
  },

  sectionTitle: { fontSize: 16, fontWeight: "900", color: "#23383A" },
  description: { color: "#556B6D", marginTop: 8, lineHeight: 18 },

  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, marginRight: 8, marginTop: 6 },
  chipText: { fontWeight: "800", color: "#23383A", fontSize: 12 },

  // actividades
  activityRow: { flexDirection: "row", alignItems: "center", marginBottom: 10, paddingVertical: 6 },
  activityTitle: { fontWeight: "800", color: "#23383A" },
  activityMeta: { color: "#6A8B90", marginTop: 4, fontSize: 12 },

  bookBtn: { marginLeft: 12, borderRadius: 12, overflow: "hidden" },
  bookGradient: { paddingHorizontal: 14, paddingVertical: 8, justifyContent: "center", alignItems: "center" },
  bookText: { fontWeight: "800", color: "#23383A" },

  // reseñas
  filtersRow: { marginTop: 12 },
  filterInput: { marginBottom: 8 },
  filterLabel: { fontWeight: "800", color: "#6A8B90", marginBottom: 6 },
  filterTag: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: 12, backgroundColor: "#F4F7F7", color: "#556B6D", fontWeight: "700", fontSize: 12 },
  filterTagActive: { backgroundColor: "#C7B2FF", color: "#23383A" },

  reviewRow: { flexDirection: "row", marginTop: 12, alignItems: "flex-start" },
  avatarCircle: { width: 44, height: 44, borderRadius: 12, backgroundColor: "#C7B2FF", justifyContent: "center", alignItems: "center" },
  reviewUser: { fontWeight: "900", color: "#23383A" },
  reviewText: { marginTop: 8, color: "#556B6D" },
  reviewMedia: { width: 120, height: 80, borderRadius: 10, marginRight: 8 },

  // inputs y botones pequeños
  inputSimple: {
    backgroundColor: "#F9FBFB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 8,
    color: "#23383A",
  },
  smallPrimaryBtn: { width: 160, borderRadius: 10, overflow: "hidden" },
  smallPrimaryGradient: { padding: 10, alignItems: "center", justifyContent: "center" },

  // modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "center", padding: 18 },
  modalCard: { backgroundColor: "#fff", borderRadius: 14, padding: 16 },
  dateNav: { width: 40, height: 40, borderRadius: 10, backgroundColor: "#F4F7F7", justifyContent: "center", alignItems: "center" },
  qtyBtn: { width: 36, height: 36, borderRadius: 8, backgroundColor: "#F4F7F7", justifyContent: "center", alignItems: "center" },
  qtyTxt: { fontWeight: "900" },
  modalAction: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "#FFF", borderWidth: 1, borderColor: "#F0F0F0" },

  // pagar ahora
  payNowBtn: { flex: 1, borderRadius: 12, overflow: "hidden" },

  // brillo superpuesto
  sheen: {
    position: "absolute",
    left: -width,
    top: 0,
    bottom: 0,
    width: width * 0.6,
    backgroundColor: "rgba(255,255,255,0.65)",
    transform: [{ rotate: "20deg" }],
  },
});