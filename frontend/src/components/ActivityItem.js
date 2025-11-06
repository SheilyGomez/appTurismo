// components/ActivityItem.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export default function ActivityItem({ item, onEdit, onDelete }) {
  return (
    <View style={{
      borderWidth: 1, borderColor: '#ddd', padding: 10, marginVertical: 6, borderRadius: 8
    }}>
      <Text style={{ fontWeight: 'bold' }}>{item.titulo}</Text>
      <Text>{item.descripcion}</Text>
      <Text>Inicio: {item.fechaInicio}</Text>
      <Text>Fin: {item.fechaFin}</Text>
      <View style={{ flexDirection: 'row', marginTop: 8 }}>
        <TouchableOpacity onPress={() => onEdit(item)} style={{ marginRight: 16 }}>
          <Text>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(item)}>
          <Text style={{ color: 'red' }}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
