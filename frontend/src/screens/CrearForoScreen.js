import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ThemeContext } from '../context/ThemeContext';
import { createForumAPI } from '../api/apiForo'; // Asegúrate de que el path sea correcto
import { useAuth } from '../auth/AuthContext';
// Importa lo necesario para subir imágenes (ej. ImagePicker, Firebase Storage)
// import * as ImagePicker from 'expo-image-picker';
// import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// import { getApp } from 'firebase/app'; // Asegúrate de importar getApp para obtener la instancia de la app

const CrearForoScreen = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [creating, setCreating] = useState(false);
    const navigation = useNavigation();
    const { colors } = useContext(ThemeContext);
    const { user } = useAuth();

    // Función para seleccionar imagen (requiere expo-image-picker y Firebase Storage)
    /*
    const pickImage = async () => {
        // Asegúrate de que Firebase Storage esté inicializado con la app de Firebase
        // const app = getApp(); // Obtén la instancia de tu app de Firebase
        // const storage = getStorage(app); // Pasa la app a getStorage

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            // Subir la imagen a Firebase Storage
            const uri = result.assets[0].uri;
            const filename = uri.substring(uri.lastIndexOf('/') + 1);
            const storageRef = ref(storage, `forum_images/${filename}`);
            const img = await fetch(uri);
            const bytes = await img.blob();

            await uploadBytes(storageRef, bytes);
            const downloadURL = await getDownloadURL(storageRef);
            setImageUrl(downloadURL); // Guarda la URL de descarga
            Alert.alert('Éxito', 'Imagen subida correctamente.');
        }
    };
    */

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
            const forumData = {
                titulo: title,       // Coincide con tu backend
                descripcion: description, // Coincide con tu backend
                //imagenUrl: imageUrl, // Coincide con tu backend
                imagenUrl: "../../../assets/_.jpeg", // Coincide con tu backend
                // userId y userName no son necesarios aquí ya que el backend los obtiene de req.user
            };
            await createForumAPI(forumData);
            Alert.alert('Éxito', 'Tema del foro creado exitosamente.');
            navigation.goBack(); // Regresa a la lista de foros
        } catch (error) {
            Alert.alert('Error', 'No se pudo crear el tema del foro.');
            console.error('Error creating forum:', error);
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

            {/* Sección para subir imagen - descomentar y habilitar si implementas ImagePicker */}
            {/*
            <TouchableOpacity
                style={[styles.imagePickerButton, { backgroundColor: colors.secondary }]}
                onPress={pickImage}
                disabled={creating}
            >
                <Text style={{ color: colors.buttonText }}>Seleccionar Imagen (Opcional)</Text>
            </TouchableOpacity>
            {imageUrl ? (
                <Image source={{ uri: imageUrl }} style={styles.previewImage} />
            ) : (
                <Text style={{ color: colors.text, marginBottom: 10 }}>No hay imagen seleccionada</Text>
            )}
            */}


            <Button
                title={creating ? "Creando..." : "Crear Tema"}
                onPress={handleCreateForum}
                disabled={creating || !title.trim() || !description.trim()}
                color={colors.primary}
            />
        </ScrollView>
    );
};

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