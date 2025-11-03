import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, Image, TextInput } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { ThemeContext } from '../context/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getForumsAPI } from '../api/apiForo';
import * as ImagePicker from 'expo-image-picker';

const ForoListScreen = () => {
    const [forums, setForums] = useState([]);
    const [filteredForums, setFilteredForums] = useState([]); // ← Lista filtrada
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const { colors } = useContext(ThemeContext);
    const styles = createStyles(colors);

    // Cargar foros desde el backend
    const fetchForums = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getForumsAPI();
            setForums(data);
            setFilteredForums(data); // Inicialmente mostramos todos
        } catch (error) {
            Alert.alert('Error', 'No se pudieron cargar los foros.');
            console.error('Error fetching forums:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        if (isFocused) fetchForums();
    }, [isFocused, fetchForums]);

    // Filtrado en tiempo real
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredForums(forums);
        } else {
            const filtered = forums.filter(item =>
                item.titulo.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredForums(filtered);
        }
    }, [searchQuery, forums]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchForums();
    }, [fetchForums]);

    const renderForumItem = ({ item }) => (
        <TouchableOpacity
            style={styles.forumItem}
            onPress={() => navigation.navigate('ForoDetail', { forumId: item.id, forumTitle: item.titulo })}
        >
            <Image
                source={
                    item.imagenUrl
                        ? { uri: item.imagenUrl } // ← Imagen desde el servidor
                        : require('../../../assets/imagen2.jpeg') // ← Imagen por defecto
                }
                style={styles.foroItemImage}
            />
            
            <View style={styles.conteinerItem}>
                <Text style={[styles.forumTitle, { color: colors.text }]}>{item.titulo}</Text>
                <Text style={[styles.forumDescription, { color: colors.text }]}>
                    {item.descripcion?.substring(0, 100)}...
                </Text>
                <View style={styles.forumMeta}>
                    <Text style={styles.text}>Por: {item.userName}</Text>
                    <Text style={styles.text}>Comentarios: {item.numComentarios}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    if (loading && !refreshing) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" style={styles.indicador}/>
                <Text style={styles.text}>Cargando foros...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.titulo}>Foros</Text>
            
            {/* Campo de búsqueda */}
            <View style={styles.searchContainer}>
                <MaterialCommunityIcons name="magnify" size={24} color="gray" style={styles.searchIcon} />
                <TextInput
                    placeholder="Buscar foros..."
                    placeholderTextColor="gray"
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {/* Lista de foros */}
            <FlatList
                data={filteredForums} // ← Usamos la lista filtrada
                renderItem={renderForumItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyList}>
                        <Text style={styles.text}>No hay foros disponibles. ¡Sé el primero en crear uno!</Text>
                    </View>
                }
            />

            {/* Botón crear foro */}
            <TouchableOpacity
                style={[styles.createButton, { backgroundColor: colors.primary }]}
                onPress={() => navigation.navigate('CrearForo')}
            >
                <Text style={styles.createButtonText}>Crear Nuevo Tema</Text>
            </TouchableOpacity>
        </View>
    );
};

const createStyles = (colors) => StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: colors.background,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background 
    },
    indicador: {
        color: colors.primary
    },
    titulo:{
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        color: colors.text,
        alignSelf: 'center',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.sub_background,
        borderRadius: 15,
        margin: 10,
        paddingHorizontal: 10,
        borderWidth: 1,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        height: 50,
        fontSize: 16,
        color: colors.text,
    },
    text:{
        color: colors.text,
    },
    listContent: {
        paddingBottom: 80,
    },
    forumItem: {
        backgroundColor: colors.sub_background,
        borderRadius: 5,
        marginHorizontal: 5,
        marginTop: 15,
        padding: 5,
    },
    conteinerItem:{
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    foroItemImage: {
        width: "100%",
        height: 120,
        borderRadius: 5,
    },
    forumTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    forumDescription: {
        fontSize: 14,
        marginBottom: 10,
    },
    forumMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        fontSize: 12,
        color: '#666',
    },
    createButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        borderRadius: 50,
        paddingVertical: 15,
        paddingHorizontal: 20,
        marginBottom: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    createButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    emptyList: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 50,
    },
});

export default ForoListScreen;
