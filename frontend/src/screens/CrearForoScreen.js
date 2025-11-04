import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ThemeContext } from '../context/ThemeContext';
import { createForumAPI } from '../api/apiForo';
import { useAuth } from '../auth/AuthContext';
import * as ImagePicker from 'expo-image-picker';

const CrearForoScreen = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedImage, setSelectedImage] = useState(null); // Objeto asset de la imagen
    const [creating, setCreating] = useState(false);
    const navigation = useNavigation();
    const { colors } = useContext(ThemeContext);
    const { user } = useAuth();

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería para seleccionar imágenes.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7, // Reduce la calidad
            // Ya NO necesitamos base64: true porque Multer manejará el archivo binario directamente
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0]); // Guarda el objeto asset de la imagen
        }
    };

    const handleCreateForum = async () => {
        if (!title.trim() || !description.trim()) {
            Alert.alert('Atención', 'El título y la descripción son obligatorios.');
            return;
        }
        if (!user || !user.uid || !user.displayName) {
            Alert.alert('Error', 'Debes iniciar sesión para crear un foro y tu perfil debe tener un nombre de usuario.');
            return;
        }

        setCreating(true);
        try {
            // 1. Crear un objeto FormData
            const formData = new FormData();

            // 2. Adjuntar los campos de texto
            formData.append('titulo', title);
            formData.append('descripcion', description);
            // userId y userName los obtendrá el backend de req.user (del token de autenticación)

            // 3. Adjuntar la imagen si existe
            if (selectedImage) {
                // El campo 'imagen' debe coincidir con el nombre esperado en Multer (upload.single('imagen'))
                formData.append('imagen', {
                    uri: selectedImage.uri,
                    name: selectedImage.fileName || `upload_${Date.now()}.jpg`, // Nombre único para el archivo
                    type: selectedImage.mimeType || 'image/jpeg', // Tipo MIME del archivo
                });
            }
            
            // 4. Enviar el FormData a la API
            await createForumAPI(formData);
            
            Alert.alert('Éxito', 'Tema del foro creado exitosamente.');
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', 'No se pudo crear el tema del foro.');
            console.error('Error creating forum:', error.response ? error.response.data : error.message);
        } finally {
            setCreating(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={[styles.title, { color: colors.text }]}>Crear Nuevo Tema del Foro</Text>

            <TextInput
                style={[styles.input, { backgroundColor: colors.sub_background, color: colors.text, borderColor: colors.primary }]}
                placeholder="Título del Tema"
                placeholderTextColor={colors.text}
                value={title}
                onChangeText={setTitle}
                editable={!creating}
            />
            <TextInput
                style={[styles.input, styles.multilineInput, { backgroundColor: colors.sub_background, color: colors.text, borderColor: colors.primary }]}
                placeholder="Descripción del Tema"
                placeholderTextColor={colors.text}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={6}
                editable={!creating}
            />

            <TouchableOpacity
                style={[styles.imagePickerButton, { backgroundColor: colors.secondary }]}
                onPress={pickImage}
                disabled={creating}
            >
                <Text style={{ color: colors.buttonText }}>{selectedImage ? "Cambiar Imagen" : "Seleccionar Imagen (Opcional)"}</Text>
            </TouchableOpacity>
            {selectedImage ? (
                <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} />
            ) : (
                <Text style={{ color: colors.text, marginBottom: 10 }}>No hay imagen seleccionada</Text>
            )}

            <Button
                title={creating ? "Creando..." : "Crear Tema"}
                onPress={handleCreateForum}
                disabled={creating || (!title.trim() && !description.trim())} // Deshabilita si no hay título o descripción
                color={colors.primary}
            />
        </ScrollView>
    );
};

// ... (tus estilos permanecen igual)
const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    input: {
        width: '100%',
        padding: 12,
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 15,
        fontSize: 16,
    },
    multilineInput: {
        height: 120,
        textAlignVertical: 'top',
    },
    imagePickerButton: {
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10,
        width: '100%',
    },
    previewImage: {
        width: '100%',
        height: 150,
        borderRadius: 8,
        marginBottom: 15,
        resizeMode: 'cover',
    },
});

export default CrearForoScreen;