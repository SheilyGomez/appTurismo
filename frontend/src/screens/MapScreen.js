// frontend/src/screens/MapScreen.js
import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { fetchDestinosAPI } from '../api/apiDestinos';
import { ThemeContext } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';

const MapScreen = () => {
    const [destinos, setDestinos] = useState([]);
    const [loading, setLoading] = useState(true);
    const { colors } = useContext(ThemeContext);
    const navigation = useNavigation();

    useEffect(() => {
        const loadDestinos = async () => {
            try {
                const response = await fetchDestinosAPI();
                setDestinos(response.data);
            } catch (error) {
                console.error("Error al cargar destinos en el mapa:", error);
            } finally {
                setLoading(false);
            }
        };
        loadDestinos();
    }, []);

    const handleMarkerPress = (destino) => {
        // Navegaremos a una pantalla de detalle, pasándole el ID del destino
        navigation.navigate('DestinoDetail', { destinoId: destino.id });
    };

    if (loading) {
        return (
            <View style={[styles.centered, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ color: colors.text }}>Cargando destinos en el mapa...</Text>
            </View>
        );
    }

    return (
        <MapView
            style={styles.map}
            // Centramos el mapa inicialmente en El Salvador
            initialRegion={{
                latitude: 13.7942,
                longitude: -88.8965,
                latitudeDelta: 1.5,
                longitudeDelta: 1.5,
            }}
        >
            {destinos.map(destino => (
                <Marker
                    key={destino.id}
                    coordinate={{
                        // ¡Importante! Convertimos la latitud y longitud de string a número
                        latitude: parseFloat(destino.latitud),
                        longitude: parseFloat(destino.longitud),
                    }}
                    title={destino.nombre}
                    description={destino.ubicacion}
                    onPress={() => handleMarkerPress(destino)}
                />
            ))}
        </MapView>
    );
};

const styles = StyleSheet.create({
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default MapScreen;