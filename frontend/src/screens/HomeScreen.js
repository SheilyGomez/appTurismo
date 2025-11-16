import React, { useState, useEffect, useMemo, useCallback, useContext } from "react"; 
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
    ActivityIndicator,
    Modal,
    Button,
    Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { fetchDestinosAPI } from "../api/apiDestinos";
import { getUsuarioProfileLocal } from "../bd/UsuarioSQLite";
import { useFocusEffect } from '@react-navigation/native';
import { ThemeContext } from "../context/ThemeContext"; 

const { width } = Dimensions.get("window");


const createStyles = (colors) => StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    screen: { flex: 1, backgroundColor: colors.background },
    headerWrap: { paddingHorizontal: 20 },
    header: { backgroundColor: colors.background, paddingVertical: 16, },
    welcomeTitle: { fontSize: 24, fontWeight: "700", color: colors.textPrimary, marginBottom: 16, },
    welcomeSection: { marginBottom: 20, },
    welcomeText: { fontSize: 16, color: colors.textSecondary, marginBottom: 4, },
    appName: { fontSize: 28, fontWeight: "700", },
    upriseText: { color: colors.primary, },
    travelText: { color: colors.textPrimary, },
    searchContainer: { marginBottom: 20, },
    searchBox: { backgroundColor: colors.surfaceLight, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: colors.border, },
    searchInput: { flex: 1, marginLeft: 10, marginRight: 10, color: colors.textPrimary, fontSize: 16, },
    separator: { height: 1, backgroundColor: colors.border, marginVertical: 16, },
    quickActions: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 16,
        gap: 12,
    },
    quickActionBtn: {
        flex: 1,
        alignItems: "center",
        paddingVertical: 16,
        borderRadius: 18,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    quickLabel: {
        marginTop: 8,
        fontSize: 13,
        color: colors.white,
        fontWeight: "600",
    },
    section: { marginTop: 24, paddingHorizontal: 20, },
    sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16, },
    sectionTitle: { fontSize: 20, fontWeight: "700", color: colors.textPrimary, },
    seeAll: { color: colors.primary, fontWeight: "600", fontSize: 14, },
    locationText: { fontSize: 14, color: colors.textTertiary, marginLeft: 6, },
    ratingContainer: { flexDirection: "row", alignItems: "center", },
    starsRow: { flexDirection: "row", alignItems: "center", marginRight: 6, },
    ratingText: { fontSize: 12, color: colors.textTertiary, marginRight: 4, fontWeight: "600", },
    reviewsText: { fontSize: 12, color: colors.textTertiary, },
    activityCard: { backgroundColor: colors.primary, borderRadius: 16, padding: 20, },
    activityTitle: { fontSize: 18, fontWeight: "700", color: colors.white, marginBottom: 8, },
    activityDescription: { fontSize: 14, color: colors.white, opacity: 0.9, lineHeight: 20, marginBottom: 16, },
    exploreNowButton: { backgroundColor: colors.white, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, alignSelf: "flex-start", },
    exploreNowText: { color: colors.primary, fontWeight: "700", fontSize: 14, },
    exploreScroll: { paddingBottom: 6, },
    exploreCard: { width: 120, alignItems: "center", marginRight: 16, },
    exploreIcon: { width: 60, height: 60, backgroundColor: colors.surfaceLight, borderRadius: 16, justifyContent: "center", alignItems: "center", marginBottom: 8, },
    exploreTitle: { fontSize: 12, fontWeight: "600", color: colors.textPrimary, textAlign: "center", },
    destinosScroll: {
        paddingBottom: 6,
        alignItems: 'flex-start',
    },
    destCard: {
        width: Math.round(width * 0.78),
        borderRadius: 16,
        backgroundColor: colors.surface,
        marginRight: 16,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    destImageWrap: {
        height: 160,
        backgroundColor: colors.surfaceLight,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        overflow: 'hidden',
    },
    destImage: { width: "100%", height: "100%", },
    destBody: { padding: 12, },
    destTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: colors.textPrimary,
        marginBottom: 4,
        minHeight: 40,
    },
    destDesc: {
        fontSize: 12,
        color: colors.textSecondary,
        lineHeight: 16,
        marginTop: 6,
        numberOfLines: 2,
    },
    ratingRow: { marginTop: 8, },

    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 24,
        width: "90%",
        maxHeight: "80%",
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: colors.textPrimary,
        marginBottom: 20,
        textAlign: "center",
    },
    modalButtonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingTop: 16,
    },
    collapsibleSection: {
        marginBottom: 8,
    },
    collapsibleHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.surfaceLight,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },
    collapsibleTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    collapsibleContent: {
        padding: 12,
        backgroundColor: colors.surfaceLight,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderColor: colors.border,
    },
    collapsibleEmpty: {
        fontSize: 14,
        color: colors.textMuted,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    checkboxContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
    },
    checkboxLabel: {
        marginLeft: 10,
        fontSize: 16,
        color: colors.textPrimary,
    },

    resultsContainer: {
        paddingHorizontal: 10,
    },
    resultsGridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 5,
    },
    resultsEmpty: {
        fontSize: 16,
        color: colors.textTertiary,
        textAlign: "center",
        marginTop: 40,
    },
    resultCard: {
        width: (width - 40) / 2 - 5,
        margin: 5,
        backgroundColor: colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    resultImage: {
        width: "100%",
        height: 110,
        backgroundColor: colors.surfaceLight,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        overflow: 'hidden',
    },
    resultBody: {
        padding: 10,
    },
    resultTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: colors.textPrimary,
        paddingTop: 0,
        minHeight: 38,
    },
    resultLocationRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
    },
    resultLocationText: {
        fontSize: 12,
        color: colors.textTertiary,
        marginLeft: 4,
    },
    resultCategory: {
        fontSize: 12,
        fontWeight: "600",
        color: colors.primary,
        paddingVertical: 8,
        paddingBottom: 0,
    },
    resultsHeaderContainer: {
        paddingHorizontal: 10,
        marginVertical: 16,
    },
    resultsTitleText: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.textPrimary,
        marginBottom: 12,
    },
    filterTagContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: 8,
    },
    filterTagLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.textSecondary,
        marginRight: 8,
    },
    filterTag: {
        backgroundColor: colors.border,
        borderRadius: 16,
        paddingVertical: 4,
        paddingHorizontal: 10,
        marginRight: 5,
        marginBottom: 5,
    },
    filterTagChipText: {
        fontSize: 14,
        color: colors.textPrimary,
        fontWeight: '500',
    },

    cardActionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    cardButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardButtonPrimary: {
        backgroundColor: colors.primary,
        marginRight: 5,
    },
    cardButtonSecondary: {
        backgroundColor: colors.border,
        marginLeft: 5,
    },
    cardButtonText: {
        color: colors.white,
        fontWeight: '600',
        fontSize: 14,
    },
    cardButtonTextSecondary: {
        color: colors.textPrimary,
        fontWeight: '600',
        fontSize: 14,
    },
});

const CheckboxItem = ({ label, isChecked, onPress }) => {
    // Usar la paleta homeColors
    const { homeColors } = useContext(ThemeContext);
    const styles = createStyles(homeColors);

    return (
        <TouchableOpacity style={styles.checkboxContainer} onPress={onPress}>
            <Ionicons
                name={isChecked ? "checkbox" : "checkbox-outline"}
                size={24}
                color={isChecked ? homeColors.primary : homeColors.textMuted}
            />
            <Text style={styles.checkboxLabel}>{label}</Text>
        </TouchableOpacity>
    );
};

const CollapsibleFilterSection = ({ title, options, selectedOptions, onToggle }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    // Usar la paleta homeColors
    const { homeColors } = useContext(ThemeContext);
    const styles = createStyles(homeColors);

    return (
        <View style={styles.collapsibleSection}>
            <TouchableOpacity
                style={styles.collapsibleHeader}
                onPress={() => setIsExpanded(!isExpanded)}
            >
                <Text style={styles.collapsibleTitle}>{title}</Text>
                <Ionicons
                    name={isExpanded ? "chevron-up-outline" : "chevron-down-outline"}
                    size={22}
                    color={homeColors.textPrimary}
                />
            </TouchableOpacity>
            {isExpanded && (
                <View style={styles.collapsibleContent}>
                    {options.length > 0 ? (
                        options.map((option) => (
                            <CheckboxItem
                                key={option}
                                label={option}
                                isChecked={selectedOptions.includes(option)}
                                onPress={() => onToggle(option)}
                            />
                        ))
                    ) : (
                        <Text style={styles.collapsibleEmpty}>No hay opciones</Text>
                    )}
                </View>
            )}
        </View>
    );
};


const FilterResultCard = ({ destino, onPress }) => {
    const { homeColors } = useContext(ThemeContext);
    const styles = createStyles(homeColors);

    return (
        <TouchableOpacity style={styles.resultCard} onPress={onPress} activeOpacity={0.9}>
            <Image
                source={{ uri: destino.imagenPrincipal }}
                style={styles.resultImage}
            />
            <View style={styles.resultBody}>
                <Text style={styles.resultTitle} numberOfLines={2}>{destino.nombre}</Text>
                <View style={styles.resultLocationRow}>
                    <Ionicons name="location-outline" size={12} color={homeColors.textTertiary} />
                    <Text style={styles.resultLocationText} numberOfLines={1}>{destino.ubicacion}</Text>
                </View>
                <Text style={styles.resultCategory} numberOfLines={1}>{destino.categoriaViaje}</Text>
            </View>
        </TouchableOpacity>
    );
};

const FilterModal = ({
    visible,
    onClose,
    onApply,
    onClear,
    currentFilters,
    options,
}) => {
    const [localFilters, setLocalFilters] = useState(currentFilters);
    // Usar la paleta homeColors
    const { homeColors } = useContext(ThemeContext);
    const styles = createStyles(homeColors);

    useEffect(() => {
        setLocalFilters(currentFilters);
    }, [currentFilters]);

    const toggleFilterValue = (key, value) => {
        setLocalFilters(prev => {
            const currentValues = prev[key] || [];
            const newValues = currentValues.includes(value)
                ? currentValues.filter(v => v !== value)
                : [...currentValues, value];
            return { ...prev, [key]: newValues };
        });
    };

    const handleApply = () => {
        onApply(localFilters);
        onClose();
    };

    const handleClear = () => {
        onClear();
        onClose();
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Filtrar Destinos</Text>
                    <ScrollView>
                        <CollapsibleFilterSection
                            title="Ubicación"
                            options={options.ubicacion}
                            selectedOptions={localFilters.ubicacion || []}
                            onToggle={(value) => toggleFilterValue('ubicacion', value)}
                        />
                        <CollapsibleFilterSection
                            title="Categoría de Viaje"
                            options={options.categoriaViaje}
                            selectedOptions={localFilters.categoriaViaje || []}
                            onToggle={(value) => toggleFilterValue('categoriaViaje', value)}
                        />
                        <CollapsibleFilterSection
                            title="Tipo de Viaje"
                            options={options.tipoViaje}
                            selectedOptions={localFilters.tipoViaje || []}
                            onToggle={(value) => toggleFilterValue('tipoViaje', value)}
                        />
                        <CollapsibleFilterSection
                            title="Actividades"
                            options={options.categoriaActividades}
                            selectedOptions={localFilters.categoriaActividades || []}
                            onToggle={(value) => toggleFilterValue('categoriaActividades', value)}
                        />
                    </ScrollView>
                    <View style={styles.modalButtonRow}>
                        <Button title="Limpiar" onPress={handleClear} color={homeColors.redClear} />
                        <Button title="Aplicar" onPress={handleApply} />
                    </View>
                </View>
            </View>
        </Modal>
    );
};


const ResultsHeader = ({ count, search, activeFilters }) => {
    const { homeColors } = useContext(ThemeContext);
    const styles = createStyles(homeColors);

    const activeFilterKeys = Object.keys(activeFilters).filter(
        key => activeFilters[key].length > 0
    );

    const formatKey = (key) => {
        switch (key) {
            case 'ubicacion': return 'Ubicación';
            case 'categoriaViaje': return 'Categoría';
            case 'tipoViaje': return 'Tipo';
            case 'categoriaActividades': return 'Actividad';
            default: return key;
        }
    };

    const filterNames = activeFilterKeys.map(formatKey);

    return (
        <View style={styles.resultsHeaderContainer}>
            <Text style={styles.resultsTitleText}>
                {count} Resultado(s)
            </Text>
            {search.length > 0 && (
                <View style={styles.filterTagContainer}>
                    <Text style={styles.filterTagLabel}>Buscando:</Text>
                    <View style={styles.filterTag}>
                        <Text style={styles.filterTagChipText}>{search}</Text>
                    </View>
                </View>
            )}
            {filterNames.length > 0 && (
                <View style={styles.filterTagContainer}>
                    <Text style={styles.filterTagLabel}>Filtros:</Text>
                    {filterNames.map(name => (
                        <View key={name} style={styles.filterTag}>
                            <Text style={styles.filterTagChipText}>{name}</Text>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
};

const renderStars = (rating = 0, reviews = 0) => {
    // Usar la paleta homeColors
    const { homeColors } = useContext(ThemeContext);
    const styles = createStyles(homeColors);

    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    return (
        <View style={styles.ratingContainer}>
            <View style={styles.starsRow}>
                {[...Array(5)].map((_, i) => {
                    let starName = "star-outline";
                    if (i < fullStars) starName = "star";
                    else if (i === fullStars && hasHalfStar) starName = "star-half";
                    return (
                        <Ionicons key={i} name={starName} size={14} color={homeColors.yellowStar} style={{ marginRight: 1 }} />
                    );
                })}
            </View>
            <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
            <Text style={styles.reviewsText}>· {reviews}</Text>
        </View>
    );
};

const QuickAction = ({ icon, label, color, onPress }) => {
    const { homeColors } = useContext(ThemeContext);
    const styles = createStyles(homeColors);
    return (
        <TouchableOpacity
            style={[styles.quickActionBtn, { backgroundColor: color }]}
            onPress={onPress}
        >
            {icon}
            <Text style={styles.quickLabel}>{label}</Text>
        </TouchableOpacity>
    );
};

const ExploreCard = ({ item }) => {
    const { homeColors } = useContext(ThemeContext);
    const styles = createStyles(homeColors);

    return (
        <TouchableOpacity style={styles.exploreCard}>
            <View style={styles.exploreIcon}>
                <Ionicons name={"location"} size={24} color={homeColors.primary} />
            </View>
            <Text style={styles.exploreTitle}>{item.nombre}</Text>
        </TouchableOpacity>
    );
};

const Section = ({ title, data, navigation }) => {
    const [selectedItemId, setSelectedItemId] = useState(null);
    const { homeColors } = useContext(ThemeContext);
    const styles = createStyles(homeColors);

    if (!data || data.length === 0) return null;

    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{title}</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.destinosScroll}>
                {data.map((d) => (
                    <TouchableOpacity
                        key={d.id}
                        activeOpacity={0.9}
                        style={styles.destCard}
                        onPress={() => setSelectedItemId(selectedItemId === d.id ? null : d.id)}
                    >
                        <View style={styles.destImageWrap}>
                            <Image
                                source={{ uri: d.imagenPrincipal }}
                                style={styles.destImage}
                                resizeMode="cover"
                            />
                        </View>
                        <View style={styles.destBody}>
                            <Text style={styles.destTitle} numberOfLines={2}>{d.nombre}</Text>
                            <Text style={styles.locationText}>{d.ubicacion}</Text>
                            <Text style={styles.destDesc} numberOfLines={2}>{d.descripcion}</Text>
                            <View style={styles.ratingRow}>
                                {renderStars(d.valoracionPromedio, d.numReviews || 0)}
                            </View>
                            {selectedItemId === d.id && (
                                <View style={styles.cardActionsContainer}>
                                    <TouchableOpacity style={[styles.cardButton, styles.cardButtonSecondary]} onPress={() => navigation.navigate('DestinoDetailScreen', { destinoId: d.id })}>
                                        <Text style={styles.cardButtonTextSecondary}>Más Detalles</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};


const HomeScreenContent = ({ data, recommended, navigation }) => {
    const { homeColors } = useContext(ThemeContext);
    const styles = createStyles(homeColors);

    const destacados = data.filter((d) => d.destacado);
    const explorarMas = data.filter((d) => !d.destacado);

    const categoriasViaje = [
        ...new Set(data.map((d) => d.categoriaViaje).filter(Boolean)),
    ].map((cat) => ({
        nombre: cat,
        items: data.filter((d) => d.categoriaViaje === cat),
    }));

    const categoriasActividades = [
        ...new Set(data.flatMap((d) => d.categoriaActividades || [])),
    ].map((act) => ({
        nombre: act,
        items: data.filter(
            (d) => d.categoriaActividades && d.categoriaActividades.includes(act)
        ),
    }));

    return (
        <View>
            {recommended.length > 0 && (
                <Section title="Recomendados para ti" data={recommended} navigation={navigation}/>
            )}
            <View style={styles.section}>
                <View style={styles.activityCard}>
                    <Text style={styles.activityTitle}>Avistamiento de Aves</Text>
                    <Text style={styles.activityDescription}>
                        Tours únicos al atardecer para ver aves raras y vuelos costeros.
                    </Text>
                    <TouchableOpacity style={styles.exploreNowButton}>
                        <Text style={styles.exploreNowText}>Explorar Ahora</Text>
                    </TouchableOpacity>
                </View>
            </View>
            {explorarMas.length > 0 && (
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Explorar Más</Text>
                    </View>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.exploreScroll}
                    >
                        {explorarMas.slice(0, 5).map((item) => (
                            <ExploreCard key={item.id} item={item} />
                        ))}
                    </ScrollView>
                </View>
            )}
            {destacados.length > 0 && (
                <Section title="Destinos Destacados" data={destacados} navigation={navigation}/>
            )}
            {categoriasViaje.map((cat, idx) => (
                <Section
                    key={idx}
                    title={`Viajes de ${cat.nombre}`}
                    data={cat.items}
                    navigation={navigation}
                />
            ))}
            {categoriasActividades.map((cat, idx) => (
                <Section
                    key={idx}
                    title={`Actividades de ${cat.nombre}`}
                    data={cat.items}
                    navigation={navigation}
                />
            ))}
        </View>
    );
};

const HomeScreen = ({ navigation }) => {
    const { darkMode, homeColors } = useContext(ThemeContext);
    const styles = createStyles(homeColors);

    const fade = useState(new Animated.Value(0))[0];
    const slide = useState(new Animated.Value(20))[0];
    const scale = useState(new Animated.Value(0.98))[0];
    const [allDestinos, setAllDestinos] = useState([]);
    const [filteredDestinos, setFilteredDestinos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [userProfile, setUserProfile] = useState(null);
    const [activeFilters, setActiveFilters] = useState({
        ubicacion: [],
        categoriaViaje: [],
        tipoViaje: [],
        categoriaActividades: [],
    });
    const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.timing(slide, { toValue: 0, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
            Animated.spring(scale, { toValue: 1, friction: 8, useNativeDriver: true }),
        ]).start();
    }, [fade, slide, scale]);


    useFocusEffect(
        useCallback(() => {
            const loadAllData = async () => {
                try {
                    setLoading(true);
                    const profile = getUsuarioProfileLocal();
                    setUserProfile(profile);
                    const res = await fetchDestinosAPI({});
                    setAllDestinos(res.data || []);
                } catch (error) {
                    console.error("Error en la carga de datos:", error);
                } finally {
                    setLoading(false);
                }
            };
            
            loadAllData();
        }, [])
    );

    const filterOptions = useMemo(() => {
        const getUniqueValues = (key) => [
            ...new Set(allDestinos.map(d => d[key]).filter(Boolean))
        ].sort();
        const getUniqueArrayValues = (key) => [
            ...new Set(allDestinos.flatMap(d => d[key] || []).filter(Boolean))
        ].sort();
        return {
            ubicacion: getUniqueValues('ubicacion'),
            categoriaViaje: getUniqueValues('categoriaViaje'),
            tipoViaje: getUniqueValues('tipoViaje'),
            categoriaActividades: getUniqueArrayValues('categoriaActividades'),
        };
    }, [allDestinos]);


    const recommendedDestinos = useMemo(() => {
        if (!userProfile || !allDestinos.length) {
            return [];
        }
        const prefCatViaje = userProfile.CategoriaViaje || [];
        const prefTipoViaje = userProfile.tipoViaje || [];
        const prefActividades = userProfile.actividadesCategoria || [];
        const scoredDestinos = allDestinos.map(destino => {
            let score = 0;
            if (destino.categoriaViaje && prefCatViaje.includes(destino.categoriaViaje)) {
                score += 1;
            }
            if (destino.tipoViaje && prefTipoViaje.includes(destino.tipoViaje)) {
                score += 1;
            }
            if (destino.categoriaActividades && destino.categoriaActividades.some(act => prefActividades.includes(act))) {
                score += 1;
            }
            return { ...destino, recommendationScore: score };
        });
        return scoredDestinos
            .filter(d => d.recommendationScore > 0)
            .sort((a, b) => b.recommendationScore - a.recommendationScore);
    }, [allDestinos, userProfile]);

    useEffect(() => {
        const hasSearch = search.length > 0;
        const hasActiveFilters = Object.values(activeFilters).some(arr => arr.length > 0);
        const isFiltering = hasSearch || hasActiveFilters;

        if (!isFiltering) {
            setFilteredDestinos([]);
            return;
        }
        let tempFiltered = [...allDestinos];
        if (hasSearch) {
            tempFiltered = tempFiltered.filter(d =>
                d.nombre.toLowerCase().includes(search.toLowerCase())
            );
        }
        Object.keys(activeFilters).forEach(key => {
            const filterArray = activeFilters[key];
            if (filterArray.length > 0) {
                if (key === 'categoriaActividades') {
                    tempFiltered = tempFiltered.filter(d =>
                        d.categoriaActividades &&
                        d.categoriaActividades.some(act => filterArray.includes(act))
                    );
                } else {
                    tempFiltered = tempFiltered.filter(d =>
                        d[key] && filterArray.includes(d[key])
                    );
                }
            }
        });
        setFilteredDestinos(tempFiltered);
    }, [search, activeFilters, allDestinos]);

    const handleBuscar = () => Keyboard.dismiss();
    const handleClearAllFilters = () => {
        setActiveFilters({
            ubicacion: [],
            categoriaViaje: [],
            tipoViaje: [],
            categoriaActividades: [],
        });
        setSearch("");
    };
    const handleApplyFilters = (modalFilters) => {
        setActiveFilters(modalFilters);
    };
    const isFiltering = search.length > 0 || Object.values(activeFilters).some(arr => arr.length > 0);

    return (
        <SafeAreaView style={styles.safe}>
            <StatusBar
                barStyle={darkMode ? "light-content" : "dark-content"}
                backgroundColor={homeColors.background}
            />
            <ScrollView
                style={styles.screen}
                contentContainerStyle={{ paddingBottom: 40 }}
                keyboardShouldPersistTaps="handled"
            >

                <Animated.View
                    style={[
                        styles.headerWrap,
                        { opacity: fade, transform: [{ translateY: slide }, { scale }] },
                    ]}
                >
                    <View style={styles.header}>
                        <Text style={styles.welcomeTitle}>Bienvenido</Text>
                        <View style={styles.welcomeSection}>
                            <Text style={styles.welcomeText}>Bienvenido a</Text>
                            <Text style={styles.appName}>
                                <Text style={styles.upriseText}>UPRISE</Text>
                                <Text style={styles.travelText}> TRAVEL</Text>
                            </Text>
                        </View>
                        <View style={styles.searchContainer}>
                            <View style={styles.searchBox}>
                                <Ionicons name="search" size={18} color={homeColors.textMuted} />
                                <TextInput
                                    placeholder="Buscar por nombre..."
                                    placeholderTextColor={homeColors.textMuted}
                                    style={styles.searchInput}
                                    value={search}
                                    onChangeText={setSearch}
                                    onSubmitEditing={handleBuscar}
                                />
                                <TouchableOpacity onPress={() => setIsFilterModalVisible(true)}>
                                    <Ionicons name="options-outline" size={22} color={homeColors.primary} />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={styles.separator} />
                        <View style={styles.quickActions}>
                            <QuickAction
                                icon={<Ionicons name="map-outline" size={24} color="#FFFFFF" />}
                                label="Itinerarios"
                                color="#7C4DFF"
                                
                                onPress={() => navigation.navigate('ItinerariosTab')}
                            />
                            <QuickAction
                                icon={<Ionicons name="calendar-outline" size={24} color="#FFFFFF" />}
                                label="Reservas"
                                color="#03A9F4"
                                onPress={() => navigation.navigate('HistorialTab')}
                            />
                            <QuickAction
                                icon={<Ionicons name="chatbubbles-outline" size={24} color="#FFFFFF" />}
                                label="Foros"
                                color="#FF7043"
                                onPress={() => navigation.navigate('ForosTab')}
                            />
                        </View>
                    </View>
                </Animated.View>

                {loading ? (
                    <ActivityIndicator size="large" color={homeColors.primary} style={{ marginTop: 40 }} />
                ) : isFiltering ? (
                    <View style={styles.resultsContainer}>
                        <ResultsHeader
                            count={filteredDestinos.length}
                            search={search}
                            activeFilters={activeFilters}
                        />
                        {filteredDestinos.length > 0 ? (
                            <View style={styles.resultsGridContainer}>
                                {filteredDestinos.map((destino) => (
                                    <FilterResultCard
                                        key={destino.id}
                                        destino={destino}
                                        onPress={() => navigation.navigate('DestinoDetailScreen', { destinoId: destino.id })}
                                    />
                                ))}
                            </View>
                        ) : (
                            <Text style={styles.resultsEmpty}>
                                No se encontraron destinos con esos criterios.
                            </Text>
                        )}
                    </View>
                ) : (
                    <HomeScreenContent data={allDestinos} recommended={recommendedDestinos} navigation={navigation}/>
                )}
            </ScrollView>
            <FilterModal
                visible={isFilterModalVisible}
                onClose={() => setIsFilterModalVisible(false)}
                onApply={handleApplyFilters}
                onClear={handleClearAllFilters}
                currentFilters={activeFilters}
                options={filterOptions}
            />
        </SafeAreaView>
    );
};

export default HomeScreen;