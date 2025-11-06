import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ThemeContext } from '../context/ThemeContext';
import { useProfile } from '../context/PerfileContext';
import { createForumAPI } from '../api/apiForo';
import { useAuth } from '../auth/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { uploadImageToCloudinary } from '../api/cloudinaryConfig';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

const CrearForoScreen = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [creating, setCreating] = useState(false);
    const navigation = useNavigation();
    const { colors } = useContext(ThemeContext);
    const styles = createStyles(colors);

    const { user } = useAuth();
    const { profile } = useProfile();

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
            quality: 0.7,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0]);
        }
    };

    const handleCreateForum = async () => {
        if (!title.trim() || !description.trim()) {
            Alert.alert('Atención', 'El título y la descripción son obligatorios.');
            return;
        }
        if (!user || !user.uid || !user.displayName) {
            Alert.alert('Error', 'Debes iniciar sesión para crear un foro.');
            return;
        }

        setCreating(true);
        try {
            let imageUrl = null;
            if (selectedImage) {
                imageUrl = await uploadImageToCloudinary(selectedImage.uri, 'foros');
            }

            const forumData = {
                titulo: title,
                descripcion: description,
                imagenUrl: imageUrl,
                userId: user.uid,
                userName: user.displayName,
                profileImg: profile.profileImageUrl,
            };

            await createForumAPI(forumData);
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
        <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color={colors.text} />
        </TouchableOpacity>


            <Text style={styles.header}>Crear Nuevo Foro</Text>

            <View style={styles.card}>
                <TextInput
                    style={styles.input}
                    placeholder="Título del tema"
                    placeholderTextColor="#8E8E93"
                    value={title}
                    onChangeText={setTitle}
                    editable={!creating}
                />
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Descripción del tema"
                    placeholderTextColor="#8E8E93"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={5}
                    editable={!creating}
                />

                <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage} disabled={creating}>
                    <Text style={styles.imagePickerText}>
                        {selectedImage ? 'Cambiar Imagen' : 'Seleccionar Imagen (Opcional)'}
                    </Text>
                </TouchableOpacity>

                {selectedImage && <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} />}

                <TouchableOpacity
                    style={[styles.createButton, creating && { opacity: 0.7 }]}
                    onPress={handleCreateForum}
                    disabled={creating}
                >
                    {creating ? (
                        <ActivityIndicator color={colors.text} />
                    ) : (
                        <Text style={styles.createButtonText}>Crear Foro</Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const createStyles = (colors) => StyleSheet.create({
    container: {
        paddingTop: 50,
        flexGrow: 1,
        backgroundColor: colors.background,
        padding: 20,
        alignItems: 'center',
      
    },
    header: {
        fontSize: 26,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 25,
        textAlign: 'center',
    },
    card: {
        paddingTop: 40,
        backgroundColor: colors.sub_background,
        width: '100%',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
    },
    input: {
        backgroundColor: colors.inputBackground,
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: colors.inputBorder,
        color: colors.text,
    },
    textArea: {
        height: 120,
        textAlignVertical: 'top',
    },
    imagePickerButton: {
        backgroundColor: colors.primary,
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        marginBottom: 15,
    },
    imagePickerText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    previewImage: {
        width: '100%',
        height: 180,
        borderRadius: 12,
        marginBottom: 15,
        resizeMode: 'cover',
    },
    createButton: {
        backgroundColor: colors.buttonCrear,
        borderRadius: 15,
        paddingVertical: 14,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 3,
    },
    createButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
     backButton: {
        position: 'absolute', 
        top: 50,             
        left: 20,            
        zIndex: 10,          
        padding: 5,
    },
});

export default CrearForoScreen;
