import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TextInput, Button, KeyboardAvoidingView, Platform, RefreshControl, Image, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { ThemeContext } from '../context/ThemeContext';
import { getForumDetailsAPI, addCommentAPI } from '../api/apiForo';
import { useAuth } from '../auth/AuthContext';
import * as ImagePicker from 'expo-image-picker';

const ForoDetailScreen = () => {
    const route = useRoute();
    const { forumId, forumTitle } = route.params;
    const [forum, setForum] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState('');
    const [selectedCommentImage, setSelectedCommentImage] = useState(null); // Objeto asset de la imagen del comentario
    const [addingComment, setAddingComment] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const { colors } = useContext(ThemeContext);
    const { user } = useAuth();

    const fetchForumDetails = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getForumDetailsAPI(forumId);
            setForum(data.foro);
            setComments(data.comentarios);
        } catch (error) {
            Alert.alert('Error', 'No se pudieron cargar los detalles del foro.');
            console.error('Error fetching forum details:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [forumId]);

    useEffect(() => {
        fetchForumDetails();
    }, [fetchForumDetails]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchForumDetails();
    }, [fetchForumDetails]);

    const pickCommentImage = async () => {
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
            // Ya NO necesitamos base64: true
        });

        if (!result.canceled) {
            setSelectedCommentImage(result.assets[0]);
        }
    };

    const handleAddComment = async () => {
        if (!commentText.trim() && !selectedCommentImage) {
            Alert.alert('Atención', 'El comentario no puede estar vacío y debe tener texto o una imagen.');
            return;
        }
        if (!user || !user.uid || !user.displayName) {
            Alert.alert('Error', 'Debes iniciar sesión para comentar y tu perfil debe tener un nombre de usuario.');
            return;
        }

        setAddingComment(true);
        try {
            // 1. Crear un objeto FormData
            const formData = new FormData();

            // 2. Adjuntar los campos de texto
            formData.append('foroId', forumId);
            formData.append('userId', user.uid);
            formData.append('userName', user.displayName || user.email);
            formData.append('texto', commentText.trim());

            // 3. Adjuntar la imagen si existe
            if (selectedCommentImage) {
                // El campo 'imagen' debe coincidir con el nombre esperado en Multer (upload.single('imagen'))
                formData.append('imagen', {
                    uri: selectedCommentImage.uri,
                    name: selectedCommentImage.fileName || `comment_upload_${Date.now()}.jpg`,
                    type: selectedCommentImage.mimeType || 'image/jpeg',
                });
            }
            
            // 4. Enviar el FormData a la API
            const response = await addCommentAPI(formData);
            
            if (response && response.comentario) {
                setComments((prevComments) => [...prevComments, response.comentario]);
            } else {
                Alert.alert('Error', 'Respuesta de comentario inesperada.');
            }
            setCommentText('');
            setSelectedCommentImage(null); // Limpiar la imagen seleccionada
        } catch (error) {
            Alert.alert('Error', 'No se pudo agregar el comentario');
            console.error('Error adding comment:', error.response ? error.response.data : error.message);
        } finally {
            setAddingComment(false);
        }
    };

    if (loading && !refreshing) {
        return (
            <View style={[styles.centered, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ color: colors.text }}>Cargando detalles del foro...</Text>
            </View>
        );
    }

    if (!forum) {
        return (
            <View style={[styles.centered, { backgroundColor: colors.background }]}>
                <Text style={{ color: colors.text }}>No se encontró el foro.</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
        >
            <ScrollView
                contentContainerStyle={styles.scrollViewContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
                }
            >
                <Text style={[styles.forumTitle, { color: colors.text }]}>{forum.titulo}</Text>
                <Text style={[styles.forumMeta, { color: colors.text }]}>
                    Por: {forum.userName} el {new Date(forum.fechaCreacion._seconds * 1000).toLocaleDateString()}
                </Text>
                {forum.imagenUrl && (
                    <Image source={{ uri: forum.imagenUrl }} style={styles.forumImage} />
                )}
                <Text style={[styles.forumDescription, { color: colors.text }]}>{forum.descripcion}</Text>

                <View style={styles.commentsSection}>
                    <Text style={[styles.commentsHeader, { color: colors.text }]}>Comentarios ({comments.length})</Text>
                    {comments.length === 0 ? (
                        <Text style={{ color: colors.text }}>Sé el primero en comentar.</Text>
                    ) : (
                        comments.map((comment) => (
                            <View key={comment.id} style={[styles.commentItem, { backgroundColor: colors.sub_background }]}>
                                <Text style={[styles.commentAuthor, { color: colors.text }]}>{comment.userName}</Text>
                                <Text style={{ color: colors.text }}>{comment.texto}</Text>
                                {comment.imagenUrl && (
                                    <Image source={{ uri: comment.imagenUrl }} style={styles.commentImage} />
                                )}
                                <Text style={[styles.commentDate, { color: colors.text }]}>
                                    {new Date(comment.fechaCreacion._seconds * 1000).toLocaleDateString()}
                                </Text>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>
            {user && (
                <View style={[styles.commentInputContainer, { backgroundColor: colors.sub_background, borderTopColor: colors.border }]}>
                    <TouchableOpacity onPress={pickCommentImage} style={styles.imagePickerCommentButton}>
                        {selectedCommentImage ? (
                            <Image source={{ uri: selectedCommentImage.uri }} style={styles.commentImagePreview} />
                        ) : (
                            // Puedes usar un icono o una imagen de placeholder cuando no hay imagen seleccionada
                            <Image source={require('../../../assets/imagen2.jpeg')} style={styles.commentImagePreview} /> 
                        )}
                    </TouchableOpacity>
                    <TextInput
                        style={[styles.commentTextInput, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.border }]}
                        placeholder="Escribe un comentario..."
                        placeholderTextColor={colors.textSecondary}
                        value={commentText}
                        onChangeText={setCommentText}
                        multiline
                    />
                    <Button
                        title={addingComment ? "Enviando..." : "Comentar"}
                        onPress={handleAddComment}
                        disabled={addingComment || (!commentText.trim() && !selectedCommentImage)}
                        color={colors.primary}
                    />
                </View>
            )}
        </KeyboardAvoidingView>
    );
};

// ... (tus estilos permanecen igual)
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollViewContent: {
        padding: 15,
        paddingBottom: 20,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    forumTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    forumMeta: {
        fontSize: 14,
        marginBottom: 10,
        color: '#666',
    },
    forumImage: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginBottom: 15,
        resizeMode: 'cover',
    },
    forumDescription: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 20,
    },
    commentsSection: {
        marginTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 15,
    },
    commentsHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    commentItem: {
        padding: 10,
        borderRadius: 6,
        marginBottom: 10,
    },
    commentAuthor: {
        fontWeight: 'bold',
        marginBottom: 3,
    },
    commentDate: {
        fontSize: 12,
        color: '#888',
        marginTop: 5,
        textAlign: 'right',
    },
    commentImage: {
        width: '100%',
        height: 150,
        borderRadius: 6,
        marginTop: 5,
        resizeMode: 'cover',
    },
    commentInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        backgroundColor: '#fff',
    },
    imagePickerCommentButton: {
        marginRight: 10,
    },
    commentImagePreview: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ddd',
        resizeMode: 'cover',
    },
    commentTextInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 8,
        marginRight: 10,
        minHeight: 40,
        maxHeight: 120,
    },
});

export default ForoDetailScreen;