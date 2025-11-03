import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TextInput, Button, KeyboardAvoidingView, Platform, RefreshControl, Image } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { ThemeContext } from '../context/ThemeContext';
import { getForumDetailsAPI, addCommentAPI } from '../api/apiForo';
import { useAuth } from '../auth/AuthContext'; // Para obtener el user y userName

const ForoDetailScreen = () => { // Renombrado a ForoDetailScreen para claridad
    const route = useRoute();
    const { forumId, forumTitle } = route.params; // Mantén forumTitle para usarlo en la cabecera si es necesario
    const [forum, setForum] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState('');
    const [addingComment, setAddingComment] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const { colors } = useContext(ThemeContext);
    const { user } = useAuth(); // Para obtener el usuario autenticado

    const fetchForumDetails = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getForumDetailsAPI(forumId);
            setForum(data.foro); // Asegúrate de acceder a 'foro' si tu backend devuelve { foro, comentarios }
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

    const handleAddComment = async () => {
        if (!commentText.trim()) {
            Alert.alert('Atención', 'El comentario no puede estar vacío.');
            return;
        }
        if (!user || !user.uid || !user.displayName) {
            Alert.alert('Error', 'Debes iniciar sesión para comentar y tu perfil debe tener un nombre de usuario.');
            return;
        }

        setAddingComment(true);
        try {
            const commentData = {
                foroId: forumId,
                userId: user.uid,
                userName: user.displayName || user.email, // Usa displayName o email como fallback
                texto: commentText, // Propiedad 'texto'
                imagenUrl: '', // Si no hay imagen para el comentario, déjalo vacío
            };
            const response = await addCommentAPI(commentData); // Pasa el objeto completo
            // Asegúrate de que la respuesta tenga la estructura esperada
            if (response && response.comentario) {
                setComments((prevComments) => [...prevComments, response.comentario]);
            } else {
                Alert.alert('Error', 'Respuesta de comentario inesperada.');
            }
            setCommentText('');
        } catch (error) {
            Alert.alert('Error', 'No se pudo agregar el comentario.');
            console.error('Error adding comment:', error);
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
                                <Text style={[styles.commentDate, { color: colors.text }]}>
                                    {new Date(comment.fechaCreacion._seconds * 1000).toLocaleDateString()}
                                    
                                </Text>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>
            {user && ( // Solo muestra la entrada de comentario si el usuario está logueado
                <View style={styles.commentInputContainer}>
                    <TextInput
                        style={[styles.commentTextInput, { backgroundColor: colors.sub_background, color: colors.text }]}
                        placeholder="Escribe un comentario..."
                        placeholderTextColor={colors.text}
                        value={commentText}
                        onChangeText={setCommentText}
                        multiline
                    />
                    <Button
                        title={addingComment ? "Enviando..." : "Comentar"}
                        onPress={handleAddComment}
                        disabled={addingComment || !commentText.trim()}
                        color={colors.primary}
                    />
                </View>
            )}
        </KeyboardAvoidingView>
    );
};

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
    commentInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        backgroundColor: '#fff', // Ajustar según el tema
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
        maxHeight: 120, // Limitar la altura del TextInput
    },
});

export default ForoDetailScreen;