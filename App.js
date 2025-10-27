import React, { useEffect, useContext, useState } from 'react'; // Agregué useState si lo necesitas para initDatabase
import { View, Text, ActivityIndicator } from 'react-native';
import { initDatabase } from './frontend/src/bd/bdLocal';
import { AuthProvider, AuthContext } from './frontend/src/auth/AuthContext';
import { ProfileProvider } from './frontend/src/context/PerfileContext';
import AppOrAuthNavigator from './appNavegation';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from './frontend/src/context/ThemeContext';


const App = () => {
    return (
        <NavigationContainer>
            <AuthProvider>
                <ThemeProvider>
                    
                    <ProfileProvider>
                        <RootApp />
                    </ProfileProvider>

                </ThemeProvider>
            </AuthProvider>
        </NavigationContainer>
    );
};

const RootApp = () => {
    const [dbInitialized, setDbInitialized] = useState(false);

    useEffect(() => {
        const initializeDB = async () => {
            try {
                await initDatabase();
                console.log('Base de datos local inicializada con éxito.');
            } catch (error) {
                console.error('Error al inicializar la base de datos local:', error);
            } finally {
                setDbInitialized(true); // Marca la DB como inicializada, incluso si hubo error (para no bloquear la UI)
            }
        };
        initializeDB();
    }, []); // El array vacío asegura que se ejecute solo una vez al montar

    // Obtenemos el userToken y el estado de carga del AuthContext.
    // 'loading' de AuthContext es crucial para saber si Firebase ya verificó el estado de auth.
    const { userToken, loading } = useContext(AuthContext);

    // Si AuthProvider aún está verificando el estado de autenticación de Firebase,
    // o si la base de datos local no ha terminado de inicializarse, mostramos un indicador de carga.
    if (loading || !dbInitialized) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
                <Text>Cargando aplicación...</Text>
                
            </View>
        );
    }

    // Una vez que AuthProvider ha terminado de cargar Y la DB está inicializada,
    // renderizamos el navegador condicionalmente.
    // Si userToken es null, es false. Si tiene un valor, es true.
    return (
        <AppOrAuthNavigator isAuthenticated={!!userToken} />
        // La sintaxis `!!userToken` convierte cualquier valor truthy/falsy a true/false.
        // Si userToken es null o undefined, será false. Si tiene un string, será true.
    );
};

export default App;