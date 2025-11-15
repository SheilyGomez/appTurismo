// frontend/src/screens/PaymentScreen.js
import React, { useState, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { crearReservaAPI } from '../api/apiReservas';
import { ThemeContext } from '../context/ThemeContext';

const wait = (timeout) => {
    return new Promise(resolve => setTimeout(resolve, timeout));
};

const createStyles = (colors) => StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    // ❗️ Corregido: El padding debe estar en el contentContainerStyle del ScrollView
    container: { flex: 1 }, 
    header: {
        paddingHorizontal: 20, 
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.background,
    },
    backButton: { marginRight: 16 },
    headerTitle: { fontSize: 22, fontWeight: '700', color: colors.textPrimary },

    resumenCard: {
        backgroundColor: colors.surfaceLight,
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        marginBottom: 24,
    },
    resumenText: { fontSize: 16, color: colors.textSecondary, textAlign: 'center' },
    resumenDestino: { fontSize: 18, fontWeight: '600', color: colors.textPrimary, marginVertical: 4, textAlign: 'center' },
    // ❗️ NUEVO estilo para la actividad
    resumenActividad: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.primary,
        marginBottom: 8,
        textAlign: 'center'
    },
    resumenTotal: { fontSize: 32, fontWeight: '700', color: colors.primary },

    form: { flex: 1 },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: 8,
        marginTop: 16,
    },
    input: {
        backgroundColor: colors.surfaceLight,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        fontSize: 16,
        color: colors.textPrimary,
    },
    inputIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surfaceLight,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    inputIconText: {
        flex: 1,
        fontSize: 16,
        color: colors.textPrimary,
    },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    col: { flex: 1, marginRight: 8 },

    errorText: {
        fontSize: 14,
        color: '#D9534F',
        textAlign: 'center',
        marginTop: 16,
    },

    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.background,
    },
    submitButton: {
        backgroundColor: colors.primary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitButtonDisabled: {
        backgroundColor: colors.textMuted,
    },
    submitButtonText: {
        color: colors.white,
        fontSize: 18,
        fontWeight: '700',
    },
});

const PaymentScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();

    const { darkMode, homeColors } = useContext(ThemeContext);
    const styles = createStyles(homeColors);

    const { reservaData, pagoData } = route.params;

    // --- Lógica de estado y formato (SIN CAMBIOS) ---
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvc, setCvc] = useState('');
    const [cardHolder, setCardHolder] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const formatCardNumber = (text) => {
        const A = text.replace(/\D/g, '').match(/.{1,4}/g);
        setCardNumber(A ? A.join(' ') : '');
    };

    const formatExpiryDate = (text) => {
        const digits = text.replace(/\D/g, '');
        if (text.length < expiryDate.length && expiryDate.length === 3) {
            setExpiryDate(digits);
            return;
        }
        if (digits.length >= 2) {
            const mm = digits.slice(0, 2);
            const yy = digits.slice(2, 4);
            setExpiryDate(`${mm}/${yy}`);
        } else {
            setExpiryDate(digits);
        }
    };

    // ❗️ --- handlePagar (ACTUALIZADO) ---
    const handlePagar = async () => {
        if (!cardNumber || !expiryDate || !cvc || !cardHolder) {
            Alert.alert("Formulario incompleto", "Por favor, completa todos los datos de la tarjeta.");
            return;
        }

        const rawCardNumber = cardNumber.replace(/\D/g, '');
        if (rawCardNumber.length < 15 || rawCardNumber.length > 16) {
            Alert.alert("Tarjeta Inválida", "El número de tarjeta parece incorrecto. Debe tener 15 o 16 dígitos.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await wait(2500); // Simulación
            
            // ❗️ 1. Capturamos la respuesta de la API
            const response = await crearReservaAPI(reservaData);

            const codigoReserva = response.data.codigoReserva;

            Alert.alert(
                "¡Reserva y Pago Exitosos!",
                `Tu reserva en ${pagoData.destinoNombre} ha sido confirmada.\n\nTu código de reserva es: ${codigoReserva}`,
                [
                    { text: "OK", onPress: () => {
                        navigation.pop(2);
                        }
                    }
                ]
            );

        } catch (err) {
            console.error("Error al crear la reserva:", err.response?.data || err.message);
            setError(err.response?.data?.message || "No se pudo completar la reserva.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safe}>
            <StatusBar
                barStyle={darkMode ? "light-content" : "dark-content"}
                backgroundColor={homeColors.background}
            />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back-outline" size={28} color={homeColors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Simulación de Pago</Text>
                </View>

                <ScrollView contentContainerStyle={{padding: 20}}> 
                    <View style={styles.resumenCard}>
                        <Text style={styles.resumenText}>Pagarás por {pagoData.numeroPersonas} persona(s) en</Text>
                        <Text style={styles.resumenDestino}>{pagoData.destinoNombre}</Text>
                        <Text style={styles.resumenActividad}>({pagoData.actividadNombre})</Text> 
                        <Text style={styles.resumenTotal}>${pagoData.precioTotal.toFixed(2)}</Text>
                    </View>

                    <View style={styles.form}>
                        <Text style={styles.label}>Nombre en la Tarjeta</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Juan Pérez"
                            placeholderTextColor={homeColors.textMuted}
                            value={cardHolder}
                            onChangeText={setCardHolder}
                        />

                        <Text style={styles.label}>Número de Tarjeta</Text>
                        <View style={styles.inputIcon}>
                            <TextInput
                                style={styles.inputIconText}
                                placeholder="0000 0000 0000 0000"
                                placeholderTextColor={homeColors.textMuted}
                                value={cardNumber}
                                onChangeText={formatCardNumber}
                                keyboardType="numeric"
                                maxLength={19}
                            />
                            <Ionicons name="card-outline" size={20} color={homeColors.textMuted} />
                        </View>

                        <View style={styles.row}>
                            <View style={styles.col}>
                                <Text style={styles.label}>Vencimiento</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="MM/YY"
                                    placeholderTextColor={homeColors.textMuted}
                                    value={expiryDate}
                                    onChangeText={formatExpiryDate}
                                    keyboardType="numeric"
                                    maxLength={5}
                                />
                            </View>
                            <View style={styles.col}>
                                <Text style={styles.label}>CVC</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="123"
                                    placeholderTextColor={homeColors.textMuted}
                                    value={cvc}
                                    onChangeText={setCvc}
                                    keyboardType="numeric"
                                    maxLength={3}
                                    secureTextEntry
                                />
                            </View>
                        </View>

                        {error && <Text style={styles.errorText}>{error}</Text>}
                    </View>

                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                        onPress={handlePagar}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <Text style={styles.submitButtonText}>Pagar ${pagoData.precioTotal.toFixed(2)}</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default PaymentScreen;