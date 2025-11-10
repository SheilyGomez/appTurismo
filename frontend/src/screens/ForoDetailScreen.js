import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TextInput, Button, KeyboardAvoidingView, Platform, RefreshControl, Image, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { ThemeContext } from '../context/ThemeContext';
import { useProfile } from '../context/PerfileContext'; 
import { getForumDetailsAPI, addCommentAPI } from '../api/apiForo';
import { useAuth } from '../auth/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { uploadImageToCloudinary } from '../api/cloudinaryConfig';
import { MaterialIcons, Feather } from '@expo/vector-icons'; 

const ForoDetailScreen = () => {
    const route = useRoute();
    const { forumId, forumTitle } = route.params;
    const [forum, setForum] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState('');
    const [selectedCommentImage, setSelectedCommentImage] = useState(null);
    const [addingComment, setAddingComment] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const { colors } = useContext(ThemeContext);
    const { user } = useAuth();
    const { profile, loading: profileLoading } = useProfile();
    const styles = createStyles(colors);
    const isCommentButtonDisabled = addingComment || (!commentText.trim() && !selectedCommentImage) || profileLoading || !profile;

    const fetchForumDetails = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getForumDetailsAPI(forumId);
            setForum(data.foro);
            const sortedComments = data.comentarios.sort((a, b) => {
                const dateA = a.fechaCreacion._seconds ? new Date(a.fechaCreacion._seconds * 1000) : new Date(a.fechaCreacion);
                const dateB = b.fechaCreacion._seconds ? new Date(b.fechaCreacion._seconds * 1000) : new Date(b.fechaCreacion);
                return dateA - dateB;
            });
            setComments(sortedComments);
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
            mediaTypes: ImagePicker.MediaTypeOptions.Images, // Usar MediaTypeOptions, MediaType no funciona
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
        });

        if (!result.canceled) {
            setSelectedCommentImage(result.assets[0]);
        }
    };

    const clearSelectedCommentImage = () => {
        setSelectedCommentImage(null);
    };

    const handleAddComment = async () => {
        if (!commentText.trim() && !selectedCommentImage) {
            Alert.alert('Atención', 'El comentario no puede estar vacío y debe tener texto o una imagen.');
            return;
        }
        if (!user || !user.uid) {
            Alert.alert('Error', 'Debes iniciar sesión para comentar.');
            return;
        }

        setAddingComment(true);
        try {
            let commentImageUrl = null;
            if (selectedCommentImage) {
                console.log('[ForoDetailScreen] Subiendo imagen de comentario a Cloudinary...');
                commentImageUrl = await uploadImageToCloudinary(selectedCommentImage.uri, 'comentarios');
                console.log('[ForoDetailScreen] Imagen de comentario Cloudinary URL:', commentImageUrl);
            }

            const commentData = {
                foroId: forumId,
                userId: user.uid,
                userName: user.displayName || user.email,
                texto: commentText.trim(),
                imagenUrl: commentImageUrl,
                profileImageUrl: profile.profileImageUrl,
            };

            const response = await addCommentAPI(commentData);

            if (response && response.comentario) {
                setComments((prevComments) => [...prevComments, {
                    ...response.comentario,
                    fechaCreacion: response.comentario.fechaCreacion ? new Date(response.comentario.fechaCreacion) : new Date(),
                }]);
            } else {
                Alert.alert('Error', 'Respuesta de comentario inesperada.');
            }
            setCommentText('');
            setSelectedCommentImage(null);

        } catch (error) {
            Alert.alert('Error', 'No se pudo agregar el comentario');
            console.error('Error adding comment:', error.response ? error.response.data : error.message);
        } finally {
            setAddingComment(false);
        }
    };

    // Añadir profileLoading a la condición de carga principal
    if (loading && !refreshing) { // Si el perfil está cargando, también mostrar indicador
        return (
            <View style={[styles.centered, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ color: colors.text }}>Cargando detalles del foro y perfil...</Text>
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

                                <View style={styles.commentAuthorContainer}>
                                    <Image
                                        source={
                                            comment.profileImageUrl
                                                ? { uri: comment.profileImageUrl }
                                                : require('../../../assets/User.jpeg')
                                        }
                                        style={styles.foroProfileImage}
                                    />
                                    <Text style={[styles.commentAuthor, { color: colors.text }]}>{comment.userName}</Text>
                                </View>
                                <Text style={{ color: colors.text }}>{comment.texto}</Text>
                                {comment.imagenUrl && (
                                    <Image source={{ uri: comment.imagenUrl }} style={styles.commentImage} />
                                )}
                                <Text style={[styles.commentDate, { color: colors.text }]}>
                                    {comment.fechaCreacion._seconds ?
                                        new Date(comment.fechaCreacion._seconds * 1000).toLocaleDateString() :
                                        new Date(comment.fechaCreacion).toLocaleDateString()
                                    }
                                </Text>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>

            {user && (
                <View style={[styles.commentInputContainer, { backgroundColor: colors.sub_background, borderTopColor: colors.inputBorder }]}>
                    <TouchableOpacity onPress={pickCommentImage} style={styles.imagePickerCommentButton}>
                        {selectedCommentImage ? (
                            <>
                                <Image source={{ uri: selectedCommentImage.uri }} style={styles.commentImagePreview} />
                                <TouchableOpacity onPress={clearSelectedCommentImage} style={styles.clearImageButton}>
                                    <MaterialIcons name="close" size={16} color="white" />
                                </TouchableOpacity>
                            </>
                        ) : (
                            <TouchableOpacity onPress={pickCommentImage} style={styles.cameraButton}>
                                <MaterialIcons name="image" size={24} color="white" />
                            </TouchableOpacity>


                        )}
                    </TouchableOpacity>
                    <TextInput
                        style={[styles.commentTextInput, { backgroundColor: colors.inputBackground, color: colors.text }]}
                        placeholder="Escribe un comentario..."
                        placeholderTextColor={colors.textSecondary}
                        value={commentText}
                        onChangeText={setCommentText}
                        multiline
                    />


                    <TouchableOpacity
                        onPress={handleAddComment}
                        style={[styles.sendButton, { backgroundColor: colors.primary }]}
                        disabled={isCommentButtonDisabled}
                    >
                        {addingComment ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Feather name="send" size={20} color="#fff" />
                        )}
                    </TouchableOpacity>


                </View>
            )}
        </KeyboardAvoidingView>
    );
};

const createStyles = (colors) => StyleSheet.create({
    container: {
        paddingTop: 50,
        flex: 1,
        paddingBottom: 70, // Espacio para el input de comentario
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
        marginBottom: 10,
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
    commentAuthorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    commentAuthor: {
        fontWeight: 'bold',
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
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: '#fff',
        borderRadius: 40,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 8,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
    imagePickerCommentButton: {
        marginRight: 10,
        position: 'relative',
    },
    commentImagePreview: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ddd',
        resizeMode: 'cover',
    },
    clearImageButton: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
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
    foroProfileImage: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginRight: 8,
        backgroundColor: '#ccc',
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.primary,
        //marginLeft: 5, 
    },
    cameraButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.primary,
    }

});

export default ForoDetailScreen;