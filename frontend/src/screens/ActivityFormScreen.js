import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  StyleSheet, 
  ScrollView,
  Text,
  Platform,
  Modal,
  TouchableWithoutFeedback,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

// Paleta de colores vibrante
const COLORS = {
  primary: '#0066D2',
  secondary: '#1CA698',
  accent: '#6CD9CE',
  highlight: '#F2B705',
  neutral: '#BFA393',
  background: '#FFFFFF',
  white: '#FFFFFF',
  textDark: '#1E293B',
  textMedium: '#475569',
  textLight: '#64748B',
  border: '#E2E8F0'
};

// Simular servicios (debes crear estos archivos después)
const createActivity = async (activity) => {
  console.log('Creando actividad:', activity);
  // Simular una respuesta exitosa
  return { ...activity, id: Date.now().toString() };
};

const CalendarService = {
  createCalendarEvent: async (event) => {
    console.log('Creando evento en calendario:', event);
    return 'event-id-' + Date.now();
  }
};

const ActivityFormScreen = ({ navigation, route }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDurationPicker, setShowDurationPicker] = useState(false);

  const [duration, setDuration] = useState(60);
  const durationOptions = [30, 60, 90, 120, 180];

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
      return `${mins} min`;
    } else if (mins === 0) {
      return `${hours} h`;
    } else {
      return `${hours}h ${mins}min`;
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      return Alert.alert("Error", "El título es obligatorio");
    }

    const now = new Date();
    const selectedDateTime = new Date(date);
    selectedDateTime.setHours(time.getHours(), time.getMinutes());
    
    if (selectedDateTime < now) {
      return Alert.alert("Error", "No puedes programar actividades en el pasado");
    }

    setIsLoading(true);

    try {
      const startDate = new Date(selectedDateTime);
      const endDate = new Date(startDate);
      endDate.setMinutes(startDate.getMinutes() + duration);

      const calendarEventId = await CalendarService.createCalendarEvent({
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      const newActivity = await createActivity({
        title: title.trim(),
        description: description.trim(),
        date: startDate.toISOString().split('T')[0],
        time: `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`,
        location: location.trim(),
        duration: duration,
        calendarEventId: calendarEventId,
        startDateTime: startDate.toISOString(),
        endDateTime: endDate.toISOString(),
      });

      // Navegar de regreso a Planning
      navigation.navigate('Planning');

    } catch (error) {
      console.error("Error al guardar actividad:", error);
      Alert.alert("Error", "No se pudo guardar la actividad. Verifica tu conexión y permisos.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header con gradiente */}
      <View style={styles.header}>
        <View style={styles.headerBackground}>
          <View style={[styles.headerShape, styles.shape1]} />
          <View style={[styles.headerShape, styles.shape2]} />
          <View style={[styles.headerShape, styles.shape3]} />
        </View>
        
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            disabled={isLoading}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nueva Actividad</Text>
          <View style={styles.placeholder} />
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Form */}
        <View style={styles.form}>
          {/* Título */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Ionicons name="pencil" size={16} color={COLORS.primary} />
              <Text style={styles.label}>Título *</Text>
            </View>
            <TextInput
              placeholder="Ej: Visita al museo, Cena en restaurante..."
              value={title}
              onChangeText={setTitle}
              style={styles.input}
              placeholderTextColor={COLORS.textLight}
              editable={!isLoading}
            />
          </View>

          {/* Descripción */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Ionicons name="document-text" size={16} color={COLORS.secondary} />
              <Text style={styles.label}>Descripción</Text>
            </View>
            <TextInput
              placeholder="Agrega detalles sobre esta actividad..."
              value={description}
              onChangeText={setDescription}
              style={[styles.input, styles.textArea]}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor={COLORS.textLight}
              editable={!isLoading}
            />
          </View>

          {/* Ubicación */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Ionicons name="location" size={16} color={COLORS.highlight} />
              <Text style={styles.label}>Ubicación</Text>
            </View>
            <TextInput
              placeholder="Ej: Museo Nacional, Restaurante La Costa..."
              value={location}
              onChangeText={setLocation}
              style={styles.input}
              placeholderTextColor={COLORS.textLight}
              editable={!isLoading}
            />
          </View>

          {/* Selector de Fecha */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Ionicons name="calendar" size={16} color={COLORS.accent} />
              <Text style={styles.label}>Fecha *</Text>
            </View>
            <TouchableOpacity 
              style={[styles.selectorButton, { borderLeftColor: COLORS.accent }]}
              onPress={() => setShowDatePicker(true)}
              disabled={isLoading}
            >
              <Ionicons name="calendar-outline" size={20} color={COLORS.accent} />
              <Text style={styles.selectorText}>{formatDate(date)}</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textLight} />
            </TouchableOpacity>
          </View>

          {/* Selector de Hora */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Ionicons name="time" size={16} color={COLORS.primary} />
              <Text style={styles.label}>Hora *</Text>
            </View>
            <TouchableOpacity 
              style={[styles.selectorButton, { borderLeftColor: COLORS.primary }]}
              onPress={() => setShowTimePicker(true)}
              disabled={isLoading}
            >
              <Ionicons name="time-outline" size={20} color={COLORS.primary} />
              <Text style={styles.selectorText}>{formatTime(time)}</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textLight} />
            </TouchableOpacity>
          </View>

          {/* Selector de Duración */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Ionicons name="hourglass" size={16} color={COLORS.secondary} />
              <Text style={styles.label}>Duración</Text>
            </View>
            <TouchableOpacity 
              style={[styles.selectorButton, { borderLeftColor: COLORS.secondary }]}
              onPress={() => setShowDurationPicker(true)}
              disabled={isLoading}
            >
              <Ionicons name="hourglass-outline" size={20} color={COLORS.secondary} />
              <Text style={styles.selectorText}>{formatDuration(duration)}</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textLight} />
            </TouchableOpacity>
          </View>

          {/* Info sobre sincronización */}
          <View style={styles.syncInfo}>
            <View style={styles.syncIcon}>
              <Ionicons name="sync" size={20} color={COLORS.white} />
            </View>
            <Text style={styles.syncInfoText}>
              Esta actividad se sincronizará con tu calendario de Google
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Botón Guardar */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[
            styles.saveButton, 
            (!title.trim() || isLoading) && styles.saveButtonDisabled
          ]}
          onPress={handleSave}
          disabled={!title.trim() || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <>
              <Ionicons name="save" size={20} color={COLORS.white} />
              <Text style={styles.saveButtonText}>Guardar Actividad</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Pickers */}
      {showDatePicker && (
        Platform.OS === 'ios' ? (
          <Modal animationType="slide" transparent={true} visible={showDatePicker}>
            <View style={styles.modalContainer}>
              <View style={styles.pickerHeader}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.pickerCancel}>Cancelar</Text>
                </TouchableOpacity>
                <Text style={styles.pickerTitle}>Seleccionar Fecha</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.pickerConfirm}>Listo</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={date}
                mode="date"
                display="spinner"
                onChange={onDateChange}
                minimumDate={new Date()}
                style={styles.picker}
              />
            </View>
          </Modal>
        ) : (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={onDateChange}
            minimumDate={new Date()}
          />
        )
      )}

      {showTimePicker && (
        Platform.OS === 'ios' ? (
          <Modal animationType="slide" transparent={true} visible={showTimePicker}>
            <View style={styles.modalContainer}>
              <View style={styles.pickerHeader}>
                <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                  <Text style={styles.pickerCancel}>Cancelar</Text>
                </TouchableOpacity>
                <Text style={styles.pickerTitle}>Seleccionar Hora</Text>
                <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                  <Text style={styles.pickerConfirm}>Listo</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={time}
                mode="time"
                display="spinner"
                onChange={onTimeChange}
                style={styles.picker}
              />
            </View>
          </Modal>
        ) : (
          <DateTimePicker
            value={time}
            mode="time"
            display="default"
            onChange={onTimeChange}
          />
        )
      )}

      <Modal animationType="slide" transparent={true} visible={showDurationPicker}>
        <TouchableWithoutFeedback onPress={() => setShowDurationPicker(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.durationModal}>
                <Text style={styles.modalTitle}>Seleccionar Duración</Text>
                <FlatList
                  data={durationOptions}
                  keyExtractor={(item) => item.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.durationOption,
                        duration === item && styles.durationOptionSelected
                      ]}
                      onPress={() => {
                        setDuration(item);
                        setShowDurationPicker(false);
                      }}
                    >
                      <Text style={[
                        styles.durationText,
                        duration === item && styles.durationTextSelected
                      ]}>
                        {formatDuration(item)}
                      </Text>
                      {duration === item && (
                        <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                      )}
                    </TouchableOpacity>
                  )}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    height: 140,
    position: 'relative',
    overflow: 'hidden',
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  headerShape: {
    position: 'absolute',
    borderRadius: 50,
    opacity: 0.15,
  },
  shape1: {
    width: 120,
    height: 120,
    backgroundColor: COLORS.highlight,
    top: -30,
    right: -30,
  },
  shape2: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.accent,
    bottom: -20,
    left: -20,
  },
  shape3: {
    width: 60,
    height: 60,
    backgroundColor: COLORS.secondary,
    top: 40,
    left: 40,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 20,
    marginTop: -20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.neutral,
    padding: 16,
    borderRadius: 16,
    fontSize: 16,
    color: COLORS.textDark,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.neutral,
    borderLeftWidth: 4,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  selectorText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textDark,
    marginLeft: 12,
  },
  footer: {
    padding: 20,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    padding: 18,
    borderRadius: 16,
    gap: 10,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonDisabled: {
    backgroundColor: COLORS.neutral,
    shadowColor: COLORS.neutral,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  syncInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    padding: 16,
    borderRadius: 16,
    marginTop: 16,
  },
  syncIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  syncInfoText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.white,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  pickerCancel: {
    fontSize: 16,
    color: COLORS.textLight,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  pickerConfirm: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
  },
  picker: {
    backgroundColor: COLORS.white,
  },
  durationModal: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    width: '80%',
    maxHeight: '60%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 20,
    textAlign: 'center',
  },
  durationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  durationOptionSelected: {
    backgroundColor: `${COLORS.primary}10`,
    borderRadius: 12,
  },
  durationText: {
    fontSize: 16,
    color: COLORS.textLight,
  },
  durationTextSelected: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});

export default ActivityFormScreen;