import React, { useState, useEffect, useContext } from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Platform,
    Alert,
    ActivityIndicator,
    StatusBar,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { getRemoteProfile } from "../api/apiPerfil";
import { ThemeContext } from "../context/ThemeContext"; 

// --- Funciones de formato (SIN CAMBIOS) ---
const formatFecha = (date) => {
    return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
};

const formatHora = (date) => {
    return date.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
    });
};

const createStyles = (colors) => StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    container: { flex: 1 },
    centeredLoader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
        padding: 20,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: colors.textSecondary,
    },
    userCard: {
        marginHorizontal: 20,
        marginBottom: 0,
    },
    userInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surfaceLight,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        marginTop: 8,
    },
    userText: {
        fontSize: 16,
        color: colors.textPrimary,
        marginLeft: 12,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.background,
    },
    backButton: {
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: "700",
        color: colors.textPrimary,
    },
    destinoCard: {
        marginHorizontal: 20,
        backgroundColor: colors.surfaceLight,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    destinoTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.textPrimary,
        marginBottom: 4,
    },
    locationRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    locationText: {
        fontSize: 14,
        color: colors.textSecondary,
        marginLeft: 6,
    },
    actividadText: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.primary,
        marginTop: 8,
    },
    form: {
        paddingHorizontal: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.textPrimary,
        marginBottom: 8,
        marginTop: 20,
    },
    pickerButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.surfaceLight,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 0,
    },
    pickerButtonText: {
        fontSize: 16,
        color: colors.textPrimary,
        marginLeft: 12,
    },
    stepperContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.surfaceLight,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginBottom: 0,
    },
    stepperButton: {
        padding: 8,
    },
    stepperValue: {
        fontSize: 20,
        fontWeight: "700",
        color: colors.textPrimary,
    },
    textInput: {
        backgroundColor: colors.surfaceLight,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        fontSize: 16,
        color: colors.textPrimary,
        minHeight: 100,
        textAlignVertical: "top",
    },
    errorText: {
        fontSize: 14,
        color: "#D9534F", 
        textAlign: "center",
        marginHorizontal: 20,
        marginTop: 16,
    },
    footer: {
        padding: 20,
        backgroundColor: colors.background,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    precioRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    precioLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    precioValor: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    submitButton: {
        backgroundColor: colors.primary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    submitButtonText: {
        color: colors.white,
        fontSize: 18,
        fontWeight: "700",
    },
});

const ReservaScreen = ({ navigation }) => {
    const route = useRoute();
    const { destino } = route.params;

    const { darkMode, homeColors } = useContext(ThemeContext);
    const styles = createStyles(homeColors);


    const precioActividad = destino.precioPorPersona || 25.00;
    const nombreActividad = destino.actividadPrincipalNombre || "Reserva General";

    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [numeroPersonas, setNumeroPersonas] = useState(1);
    const [comentarios, setComentarios] = useState("");
    const [userProfile, setUserProfile] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                setProfileLoading(true);
                const profileData = await getRemoteProfile();
                setUserProfile(profileData);
            } catch (err) {
                console.error("Error al cargar el perfil:", err);
                setError("No se pudo cargar tu información de perfil.");
            } finally {
                setProfileLoading(false);
            }
        };
        loadProfile();
    }, []);

    const onChangeDateTimePicker = (event, selectedDate) => {
        setShowDatePicker(Platform.OS === 'ios');
        setShowTimePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setDate(selectedDate);
        }
    };

    const incrementPersonas = () => setNumeroPersonas((prev) => prev + 1);
    const decrementPersonas = () => setNumeroPersonas((prev) => (prev > 1 ? prev - 1 : 1));

    const handleContinuarAlPago = () => {
        if (date < new Date()) {
            Alert.alert("Error", "No puedes seleccionar una fecha o hora pasada.");
            return;
        }
        setError(null);

        const reservaData = {
            destinoId: destino.id,
            fechaReserva: date.toISOString(),
            numeroPersonas: numeroPersonas,
            comentarios: comentarios,
            actividadReservada: nombreActividad, 
        };

        const precioTotal = precioActividad * numeroPersonas;
        
        const pagoData = {
            precioTotal: precioTotal,
            destinoNombre: destino.nombre,
            numeroPersonas: numeroPersonas,
            actividadNombre: nombreActividad, 
        };

        navigation.navigate('PaymentScreen', {
            reservaData: reservaData,
            pagoData: pagoData,
        });
    };

    if (profileLoading) {
        return (
            <SafeAreaView style={styles.centeredLoader}>
                <StatusBar
                    barStyle={darkMode ? "light-content" : "dark-content"}
                    backgroundColor={homeColors.background}
                />
                <ActivityIndicator size="large" color={homeColors.primary} />
                <Text style={styles.loadingText}>Cargando tu perfil...</Text>
            </SafeAreaView>
        );
    }
    if (error && !userProfile) {
        return (
            <SafeAreaView style={styles.centeredLoader}>
                <StatusBar
                    barStyle={darkMode ? "light-content" : "dark-content"}
                    backgroundColor={homeColors.background}
                />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.pickerButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.pickerButtonText}>Volver</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safe}>
            <StatusBar
                barStyle={darkMode ? "light-content" : "dark-content"}
                backgroundColor={homeColors.background}
            />
            <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back-outline" size={28} color={homeColors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Confirmar Reserva</Text>
                </View>

                <View style={styles.destinoCard}>
                    <Text style={styles.destinoTitle}>{destino.nombre}</Text>
                    <View style={styles.locationRow}>
                        <Ionicons name="location-outline" size={16} color={homeColors.textSecondary} />
                        <Text style={styles.locationText}>{destino.ubicacion}</Text>
                    </View>
                    <Text style={styles.actividadText}>Actividad: {nombreActividad}</Text>
                </View>

                <View style={styles.userCard}>
                    <Text style={styles.label}>Tu Información</Text>
                    <View style={styles.userInfoRow}>
                        <Ionicons name="person-outline" size={16} color={homeColors.textSecondary} />
                        <Text style={styles.userText}>{userProfile?.nombreCompleto || 'N/A'}</Text>
                    </View>
                    <View style={styles.userInfoRow}>
                        <Ionicons name="mail-outline" size={16} color={homeColors.textSecondary} />
                        <Text style={styles.userText}>{userProfile?.email || 'N/A'}</Text>
                    </View>
                </View>

                <View style={styles.form}>
                    <Text style={styles.label}>Fecha</Text>
                    <TouchableOpacity style={styles.pickerButton} onPress={() => setShowDatePicker(true)}>
                        <Ionicons name="calendar-outline" size={20} color={homeColors.primary} />
                        <Text style={styles.pickerButtonText}>{formatFecha(date)}</Text>
                    </TouchableOpacity>

                    <Text style={styles.label}>Hora</Text>
                    <TouchableOpacity style={styles.pickerButton} onPress={() => setShowTimePicker(true)}>
                        <Ionicons name="time-outline" size={20} color={homeColors.primary} />
                        <Text style={styles.pickerButtonText}>{formatHora(date)}</Text>
                    </TouchableOpacity>

                    <Text style={styles.label}>Número de Personas</Text>
                    <View style={styles.stepperContainer}>
                        <TouchableOpacity style={styles.stepperButton} onPress={decrementPersonas}>
                            <Ionicons name="remove-outline" size={24} color={homeColors.primary} />
                        </TouchableOpacity>
                        <Text style={styles.stepperValue}>{numeroPersonas}</Text>
                        <TouchableOpacity style={styles.stepperButton} onPress={incrementPersonas}>
                            <Ionicons name="add-outline" size={24} color={homeColors.primary} />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.label}>Comentarios (Opcional)</Text>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Solicitudes especiales, alergias, etc."
                        placeholderTextColor={homeColors.textMuted}
                        value={comentarios}
                        onChangeText={setComentarios}
                        multiline
                        numberOfLines={4}
                    />
                </View>

                {error && userProfile && <Text style={styles.errorText}>{error}</Text>}

            </ScrollView>

            <View style={styles.footer}>
                <View style={styles.precioRow}>
                    <Text style={styles.precioLabel}>Precio por Persona</Text>
                    <Text style={styles.precioValor}>${precioActividad.toFixed(2)}</Text>
                </View>
                <View style={styles.precioRow}>
                    <Text style={styles.precioLabel}>Total ({numeroPersonas} persona{numeroPersonas > 1 ? 's' : ''})</Text>
                    <Text style={styles.precioValor}>
                        ${(precioActividad * numeroPersonas).toFixed(2)}
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleContinuarAlPago}
                >
                    <Text style={styles.submitButtonText}>Continuar al Pago</Text>
                </TouchableOpacity>
            </View>

            {showDatePicker && (
                <DateTimePicker
                    testID="datePicker"
                    value={date}
                    mode="date"
                    display="default"
                    onChange={onChangeDateTimePicker}
                    minimumDate={new Date()}
                />
            )}
            {showTimePicker && (
                <DateTimePicker
                    testID="timePicker"
                    value={date}
                    mode="time"
                    display="default"
                    onChange={onChangeDateTimePicker}
                />
            )}
        </SafeAreaView>
    );
};

export default ReservaScreen;