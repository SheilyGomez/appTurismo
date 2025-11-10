import React from 'react';
import { View, Text } from 'react-native';
import { useRoute } from '@react-navigation/native';

const DestinoDetailScreen = () => {
    const route = useRoute();
    const { destinoId } = route.params;

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Detalle del Destino</Text>
            <Text>ID: {destinoId}</Text>
        </View>
    );
};

export default DestinoDetailScreen;