// components/ActivityList.js
import React from 'react';
import { View, FlatList, Text } from 'react-native';
import ActivityItem from './ActivityItem';

export default function ActivityList({ actividades, onEdit, onDelete }) {
  if (!actividades || actividades.length === 0) {
    return <Text style={{ padding: 12 }}>No hay actividades.</Text>;
  }
  return (
    <View style={{ padding: 8 }}>
      <FlatList
        data={actividades}
        keyExtractor={(item) => item.id || item.titulo + item.fechaInicio}
        renderItem={({ item }) => (
          <ActivityItem item={item} onEdit={onEdit} onDelete={onDelete} />
        )}
      />
    </View>
  );
}
