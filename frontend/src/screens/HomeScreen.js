// HomeScreen.js
import React, { useState, useEffect } from "react";
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
  Button,
} from "react-native";
import { Ionicons, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

const HomeScreen = ({ navigation }) => {
  // animaciones
  const fade = useState(new Animated.Value(0))[0];
  const slide = useState(new Animated.Value(20))[0];
  const scale = useState(new Animated.Value(0.98))[0];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  // datos de ejemplo con URLs
  const [destinosSugeridos] = useState([
    {
      destinoid: "1",
      nombre: "Atardecer Tropical",
      descripcion: "Atardeceres dorados sobre la playa — pura vibra veraniega.",
      ubicacion: "Bali, Indonesia",
      valoracionPromedio: 4.9,
      totalResenas: 342,
      fotos: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80&auto=format&fit=crop"],
      duracion: "7 Días",
      distancia: "3,200 km",
      precio: "$1,150",
      destacado: true,
      color: "#C7B2FF",
    },
    {
      destinoid: "2",
      nombre: "Bahía Turquesa",
      descripcion: "Aguas cristalinas turquesa y playas de arena suave.",
      ubicacion: "Tulum, México",
      valoracionPromedio: 4.8,
      totalResenas: 198,
      fotos: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?crop=entropy&cs=tinysrgb&fit=crop&w=1200&q=60"],
      duracion: "5 Días",
      distancia: "1,200 km",
      precio: "$980",
      destacado: true,
      color: "#A7E3F0",
    },
    {
      destinoid: "3",
      nombre: "Calles Coloniales",
      descripcion: "Calles empedradas, colores y cultura en cada esquina.",
      ubicacion: "Cartagena, Colombia",
      valoracionPromedio: 4.7,
      totalResenas: 145,
      fotos: ["https://images.unsplash.com/photo-1505765055605-4c22569c4a27?w=1200&q=80&auto=format&fit=crop"],
      duracion: "4 Días",
      distancia: "1,800 km",
      precio: "$760",
      destacado: false,
      color: "#FFD8B2",
    },
    {
      destinoid: "4",
      nombre: "Escapada a la Selva",
      descripcion: "Bosques llenos de vida, cascadas y senderos escondidos.",
      ubicacion: "Costa Rica",
      valoracionPromedio: 4.8,
      totalResenas: 212,
      fotos: ["https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80&auto=format&fit=crop"],
      duracion: "6 Días",
      distancia: "2,400 km",
      precio: "$1,050",
      destacado: true,
      color: "#CFF7E6",
    },
  ]);

  const [restaurantesCercanos] = useState([
    { id: "1", nombre: "Bocados del Atardecer", distancia: "0.6 km", rating: 4.7, tipo: "Mariscos", color: "#FDE7C8" },
    { id: "2", nombre: "Café Lavanda", distancia: "1.1 km", rating: 4.6, tipo: "Cafetería", color: "#E8D6FF" },
    { id: "3", nombre: "Parrilla del Océano", distancia: "2.0 km", rating: 4.5, tipo: "Parrilla", color: "#D6F3FF" },
  ]);

  const explorarMas = [
    { id: "e1", title: "Cascadas Escondidas", img: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=60&auto=format&fit=crop" },
    { id: "e2", title: "Pueblos Coloniales", img: "https://images.unsplash.com/photo-1505765055605-4c22569c4a27?w=800&q=60&auto=format&fit=crop" },
    { id: "e3", title: "Arrecifes de Coral", img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=60&auto=format&fit=crop" },
    { id: "e4", title: "Senderos del Bosque", img: "https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?w=800&q=60&auto=format&fit=crop" },
  ];

  const renderStars = (value) => {
    const full = Math.floor(value);
    const arr = [];
    for (let i = 0; i < 5; i++) {
      arr.push(<Ionicons key={i} name={i < full ? "star" : "star-outline"} size={12} color="#FFCC5C" style={{ marginRight: 3 }} />);
    }
    return <View style={{ flexDirection: "row" }}>{arr}</View>;
  };

  const QuickAction = ({ icon, label, color, onPress }) => (
    <TouchableOpacity style={[styles.quickActionBtn, { backgroundColor: color }]} onPress={onPress}>
      <View style={styles.quickIconWrap}>{icon}</View>
      <Text style={styles.quickLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView style={styles.screen} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* ENCABEZADO */}
        <Animated.View style={[styles.headerWrap, { opacity: fade, transform: [{ translateY: slide }, { scale }] }]}>
          <LinearGradient colors={["#D8C6FF", "#C5E8FF", "#FFF1D6"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.headerGradient}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.welcomeText}>Bienvenido a</Text>
                <Text style={styles.appName}>U P R I S E <Text style={styles.appNameShort}>T R A V E L</Text></Text>
              </View>

              <TouchableOpacity style={styles.profileBtn}>
                <Image source={{ uri: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80&auto=format&fit=crop" }} style={styles.profileImg} />
              </TouchableOpacity>
            </View>

            {/* BUSCADOR */}
            <View style={styles.searchWrap}>
              <View style={styles.searchBox}>
                <Ionicons name="search" size={18} color="#6A8B90" />
                <TextInput
                  placeholder="Buscar destinos, actividades..."
                  placeholderTextColor="#8DA6A9"
                  style={styles.searchInput}
                />
                <TouchableOpacity>
                  <Ionicons name="options-outline" size={18} color="#6A8B90" />
                </TouchableOpacity>
              </View>
            </View>

            {/* ACCESOS RÁPIDOS */}
            <View style={styles.quickRowWrap}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickScrollContent}>
                <QuickAction icon={<Ionicons name="map" size={20} color="#FFF" />} label="Itinerarios" color="#6E4BFF" />
                <QuickAction icon={<Ionicons name="calendar" size={20} color="#FFF" />} label="Reservas" color="#00A6D6" />
                <QuickAction icon={<Ionicons name="chatbubbles" size={20} color="#FFF" />} label="Foros" color="#FF8A65" />
                <QuickAction icon={<Ionicons name="heart" size={20} color="#FFF" />} label="Favoritos" color="#D7B6FF" />
                <QuickAction icon={<Ionicons name="person" size={20} color="#FFF" />} label="Perfil" color="#FFD59A" />
              </ScrollView>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* DESCUBRIR */}
        <Animated.View style={[styles.section, { opacity: fade, transform: [{ translateY: slide }] }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Descubrir</Text>
            <TouchableOpacity><Text style={styles.seeAll}>Ver todo</Text></TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.destinosScroll}>
            {destinosSugeridos.map((d) => (
              <Animated.View key={d.destinoid} style={{ marginRight: 18 }}>
                <TouchableOpacity activeOpacity={0.9} style={[styles.destCard, { borderColor: d.color }]}>
                  <View style={styles.destImageWrap}>
                    <Image source={{ uri: d.fotos[0] }} style={styles.destImage} resizeMode="cover" />
                    <LinearGradient colors={["transparent", "rgba(0,0,0,0.22)"]} style={styles.destOverlay} />
                    {d.destacado && <View style={[styles.pill, { backgroundColor: d.color }]}><Text style={styles.pillText}>Popular</Text></View>}
                  </View>

                  <View style={styles.destBody}>
                    <View style={styles.destRow}>
                      <Text style={[styles.destTitle, { color: d.color }]} numberOfLines={1}>{d.nombre}</Text>
                      <Text style={[styles.destPrice, { color: d.color }]}>{d.precio}</Text>
                    </View>

                    <View style={styles.locationRow}>
                      <Ionicons name="location" size={12} color="#6A8B90" />
                      <Text style={styles.locationText}>{d.ubicacion}</Text>
                    </View>

                    <Text style={styles.destDesc} numberOfLines={2}>{d.descripcion}</Text>

                    <View style={styles.metaRow}>
                      <View style={styles.metaItem}>
                        <Ionicons name="time" size={12} color="#6A8B90" />
                        <Text style={styles.metaText}>{d.duracion}</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <FontAwesome5 name="route" size={12} color="#6A8B90" />
                        <Text style={styles.metaText}>{d.distancia}</Text>
                      </View>
                    </View>

                    <View style={styles.ratingRow}>
                      {renderStars(d.valoracionPromedio)}
                      <Text style={styles.ratingText}>{d.valoracionPromedio.toFixed(1)} · {d.totalResenas}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </ScrollView>
        </Animated.View>

        {/* RESTAURANTES CERCANOS */}
        <Animated.View style={[styles.section, { opacity: fade, transform: [{ translateY: slide }] }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Restaurantes Cercanos</Text>
            <TouchableOpacity><Text style={styles.seeAll}>Ver todo</Text></TouchableOpacity>
          </View>

          <View style={styles.restContainer}>
            {restaurantesCercanos.map((r) => (
              <TouchableOpacity key={r.id} style={styles.restCard}>
                <View style={styles.restLeft}>
                  <Text style={styles.restName}>{r.nombre}</Text>
                  <Text style={styles.restType}>{r.tipo}</Text>
                  <View style={styles.restMeta}>
                    {renderStars(r.rating)}
                    <Text style={styles.restDistance}>{r.distancia}</Text>
                  </View>
                </View>
                <View style={[styles.restIcon, { backgroundColor: r.color }]}>
                  <MaterialIcons name="restaurant" size={20} color="#fff" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* PROMOCIÓN */}
        <Animated.View style={[styles.section, { opacity: fade, transform: [{ translateY: slide }] }]}>
          <View style={styles.promoCard}>
            <LinearGradient colors={["#E8D6FF", "#C5E8FF"]} style={styles.promoLeft}>
              <Text style={styles.promoTitle}>Avistamiento de Aves</Text>
              <Text style={styles.promoText}>Tours únicos al atardecer para ver aves exóticas y vuelos costeros.</Text>
              <TouchableOpacity style={styles.promoBtn}><Text style={styles.promoBtnText}>Explorar Ahora</Text></TouchableOpacity>
              <Button title="Explorar Ahora" onPress={() => navigation.navigate('Payment')} />
                <Button title="Explorar Ahora" onPress={() => navigation.navigate('DestinationDetail')} />
            </LinearGradient>
            <View style={styles.promoRight}>
              <Image source={{ uri: "https://images.unsplash.com/photo-1505765055605-4c22569c4a27?w=800&q=60&auto=format&fit=crop" }} style={styles.promoImg} />
            </View>
          </View>
        </Animated.View>

        {/* EXPLORAR MÁS */}
        <Animated.View style={[styles.section, { opacity: fade, transform: [{ translateY: slide }] }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Explorar Más</Text>
            <TouchableOpacity><Text style={styles.seeAll}>Más</Text></TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.exploreScroll}>
            {explorarMas.map((e) => (
              <TouchableOpacity style={styles.smallCard} key={e.id}>
                <Image source={{ uri: e.img }} style={styles.smallImg} />
                <Text style={styles.smallTitle} numberOfLines={1}>{e.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  screen: { flex: 1, backgroundColor: "#FFFFFF" },

  // HEADER
  headerWrap: { paddingHorizontal: 18, marginTop: 12 },
  headerGradient: {
    borderRadius: 26,
    padding: 16,
    paddingBottom: 18,
    shadowColor: "#9A8BFF",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 20,
    elevation: 6,
  },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  welcomeText: { color: "#5A6B6F", fontSize: 14, fontWeight: "400", },
  appName: { color: "#2F4750", fontSize: 28, fontWeight: "800", marginTop: 2 },
  appNameShort: { fontSize: 12, color: "#5A6B6F", fontWeight: "600" },

  profileBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  profileImg: { width: "100%", height: "100%" },

  // SEARCH
  searchWrap: { marginTop: 12 },
  searchBox: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#9BDAD9",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 16,
    elevation: 3,
  },
  searchInput: { flex: 1, marginLeft: 10, color: "#45686C" },

  // QUICK ACTIONS
  quickRowWrap: { marginTop: 12 },
  quickScrollContent: { paddingVertical: 8, paddingLeft: 2, paddingRight: 8 },
  quickActionBtn: {
    width: 110,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#B8AFFF",
    shadowOpacity: 0.09,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 18,
    elevation: 4,
  },
  quickIconWrap: { marginBottom: 6 },
  quickLabel: { color: "#fff", fontWeight: "700", fontSize: 13 },

  // SECTIONS
  section: { marginTop: 18, paddingHorizontal: 18 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  sectionTitle: { fontSize: 20, fontWeight: "800", color: "#23383A" },
  seeAll: { color: "#5E8B8F", fontWeight: "700" },

  // DESTINOS cards
  destinosScroll: { paddingLeft: 2, paddingBottom: 6 },
  destCard: {
    width: Math.round(width * 0.78),
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    shadowColor: "#A7BBCF",
    shadowOpacity: 0.09,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 20,
    elevation: 5,
  },
  destImageWrap: { height: 170, backgroundColor: "#F6FBFF" },
  destImage: { width: "100%", height: "100%" },
  destOverlay: { position: "absolute", left: 0, right: 0, bottom: 0, height: 70 },
  pill: { position: "absolute", top: 12, left: 12, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  pillText: { color: "#fff", fontWeight: "800" },

  destBody: { paddingHorizontal: 14, paddingVertical: 12 },
  destRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  destTitle: { fontSize: 18, fontWeight: "800" },
  destPrice: { fontSize: 16, fontWeight: "800" },

  locationRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  locationText: { fontSize: 12, color: "#6A8B90", marginLeft: 6 },
  destDesc: { marginTop: 8, color: "#556B6D", fontSize: 13 },

  metaRow: { flexDirection: "row", marginTop: 10, alignItems: "center" },
  metaItem: { flexDirection: "row", alignItems: "center", marginRight: 16 },
  metaText: { marginLeft: 6, color: "#6A8B90", fontSize: 12 },

  ratingRow: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  ratingText: { marginLeft: 8, color: "#6A8B90", fontSize: 12 },

  // RESTAURANTS
  restContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    shadowColor: "#C7EAE6",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 18,
    elevation: 4,
  },
  restCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#F2F6F6" },
  restLeft: {},
  restName: { fontSize: 15, fontWeight: "800", color: "#23383A" },
  restType: { color: "#6A8B90", marginTop: 4, fontSize: 12 },
  restMeta: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  restDistance: { marginLeft: 10, color: "#6A8B90" },
  restIcon: { width: 56, height: 56, borderRadius: 12, justifyContent: "center", alignItems: "center" },

  // PROMO
  promoCard: { flexDirection: "row", borderRadius: 18, overflow: "hidden", marginVertical: 6, shadowColor: "#CDEBF1", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 12 }, shadowRadius: 18, elevation: 5 },
  promoLeft: { flex: 1, padding: 16, justifyContent: "center" },
  promoRight: { width: 120, height: 120, alignItems: "center", justifyContent: "center", padding: 8, backgroundColor: "#fff" },
  promoImg: { width: 100, height: 100, borderRadius: 12 },
  promoTitle: { fontSize: 18, fontWeight: "800", color: "#23383A" },
  promoText: { marginTop: 6, color: "#556B6D" },
  promoBtn: { marginTop: 10, backgroundColor: "#23383A", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14, alignSelf: "flex-start" },
  promoBtnText: { color: "#fff", fontWeight: "800" },

  // EXPLORE MORE
  exploreScroll: { paddingVertical: 6 },
  smallCard: { width: 120, marginRight: 14, borderRadius: 14, overflow: "hidden", backgroundColor: "#fff", shadowColor: "#CFEFE8", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 10 }, shadowRadius: 16, elevation: 4 },
  smallImg: { width: "100%", height: 78 },
  smallTitle: { padding: 8, fontSize: 13, fontWeight: "700", color: "#23383A" },
});

export default HomeScreen;
