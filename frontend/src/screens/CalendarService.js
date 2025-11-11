import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Modal, 
  TextInput, 
  Platform, 
  Alert, 
  Dimensions 
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { MaterialIcons } from '@expo/vector-icons';
import * as CalendarExpo from 'expo-calendar';

// --- COLORES ---
const COLORS = {
  PRIMARY: '#45161B',
  SECONDARY: '#EA9DAE',
  BACKGROUND: '#FBDE9C',
  ACCENT: '#F99256',
  DOT: '#C74E51',
  TEXT_LIGHT: '#FFFFFF',
  TEXT_DARK: '#45161B',
};

const { width } = Dimensions.get('window');

const CalendarScreen = () => {
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [events, setEvents] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    fechaInicio: new Date(),
    fechaFin: new Date(Date.now() + 3600000),
  });
  const [dateTimePickerType, setDateTimePickerType] = useState(null);
  const [calendarId, setCalendarId] = useState(null);
  const [isDateTimePickerVisible, setIsDateTimePickerVisible] = useState(false);

  // --- 1. FIREBASE AUTH ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(authInstance, async (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        await signInAnonymously(authInstance);
        setUserId(authInstance.currentUser.uid);
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // --- 2. ESCUCHAR EVENTOS DE FIRESTORE ---
  useEffect(() => {
    if (!db || !userId || !isAuthReady) return;

    const eventsCollectionRef = collection(db, `users/${userId}/eventos`);
    const q = query(eventsCollectionRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedEvents = {};
      snapshot.forEach((doc) => {
        const data = doc.data();
        const fechaInicioDate = data.fechaInicio?.toDate?.() || new Date();
        const dateKey = fechaInicioDate.toISOString().split('T')[0];
        if (!fetchedEvents[dateKey]) fetchedEvents[dateKey] = { marked: true, dots: [] };
        fetchedEvents[dateKey].dots.push({ key: doc.id, color: COLORS.DOT, event: data });
      });
      setEvents(fetchedEvents);
      console.log('Eventos cargados:', fetchedEvents);
    });

    return () => unsubscribe();
  }, [db, userId, isAuthReady]);

  // --- 3. CALENDARIO DEL DISPOSITIVO MEJORADO ---
  // Función auxiliar para obtener la fuente del calendario (principalmente la cuenta de Google)
async function getCalendarSourceForAndroid() {
  // 1. Obtener todos los calendarios
  const calendars = await CalendarExpo.getCalendarsAsync(CalendarExpo.EntityTypes.EVENT);

  // 2. Intentar encontrar una fuente de tipo Google
  const googleSource = calendars.find(
    (cal) => cal.source.type === CalendarExpo.CalendarSource.GOOGLE || cal.source.type === CalendarExpo.CalendarSource.ACCOUNT
  )?.source;

  if (googleSource) {
    console.log("Fuente de Google/Cuenta encontrada en Android.");
    return googleSource;
  }
  
  // 3. Fallback: Fuente local
  console.warn("No se encontró una cuenta de Google. Usando fuente local.");
  return { isLocalAccount: true, name: 'Local Calendar' };
}

// --- 3. CALENDARIO DEL DISPOSITIVO MEJORADO (Para Android) ---
const createCalendar = async () => {
  if (Platform.OS === 'web') return; 

  try {
    const { status } = await CalendarExpo.requestCalendarPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permiso Denegado', 'No se puede guardar en el calendario del dispositivo sin permisos.');
      return;
    }

    // 1. Obtener la fuente (buscando una cuenta de Google en Android)
    const calendarSource = await getCalendarSourceForAndroid();
    if (!calendarSource || !calendarSource.id) {
        console.error("No se pudo determinar una fuente de calendario válida.");
        return;
    }

    // 2. Intentar encontrar un calendario existente con nuestro nombre
    const existingCalendars = await CalendarExpo.getCalendarsAsync(CalendarExpo.EntityTypes.EVENT);
    const localCalendar = existingCalendars.find(
        cal => cal.title === 'Mi Calendario de Viaje App' && cal.sourceId === calendarSource.id
    );

    if (localCalendar) {
      console.log('Calendario existente asociado a la cuenta encontrado:', localCalendar.id);
      setCalendarId(localCalendar.id);
      return;
    }

    // 3. Crear el nuevo calendario, asociándolo a la cuenta de Google principal.
    const newCalendarID = await CalendarExpo.createCalendarAsync({
      title: 'Mi Calendario de Viaje App',
      color: COLORS.ACCENT, 
      entityType: CalendarExpo.EntityTypes.EVENT,
      // ⚠️ CLAVE PARA ANDROID: Usar el sourceId de la cuenta de Google
      sourceId: calendarSource.id, 
      source: calendarSource,
      name: 'calendar_viaje_app',
      ownerAccount: 'personal',
      accessLevel: CalendarExpo.CalendarAccess.OWNER,
    });

    console.log('Nuevo calendario creado y asociado a la fuente:', newCalendarID);
    setCalendarId(newCalendarID);

  } catch (error) {
    console.error("Error al obtener/crear calendario:", error);
    Alert.alert("Error de Calendario", "No se pudo acceder o crear el calendario del dispositivo.");
  }
};

  useEffect(() => {
    createCalendar();
  }, []);

  // --- 4. FUNCIONES DE FORMULARIO ---
const handleDayPress = (day) => {
  // Cuando se presiona un día, se actualiza la fecha seleccionada
  setSelectedDate(day.dateString);
  
  // Se inicializa el formulario con la fecha seleccionada
  const selectedTimestamp = day.timestamp;
  const fechaInicio = new Date(selectedTimestamp);
  const fechaFin = new Date(selectedTimestamp + 3600000); // 1 hora después

  // Asegurar que la hora de inicio y fin estén en el futuro (si es el día actual)
  // o al menos que la hora de inicio no sea anterior a la hora actual, 
  // aunque para un calendario de planificación no es estrictamente necesario, es buena práctica.
  
  setForm((prev) => ({
    ...prev,
    fechaInicio: fechaInicio,
    fechaFin: fechaFin,
  }));
  setIsModalVisible(true);
};

const handleConfirmDateTime = (date) => {
  // Maneja la confirmación del selector de fecha/hora (DateTimePickerModal)
  if (dateTimePickerType === 'start') {
    setForm((prev) => ({ ...prev, fechaInicio: date }));
  } else {
    setForm((prev) => ({ ...prev, fechaFin: date }));
  }
  setDateTimePickerType(null);
  setIsDateTimePickerVisible(false);
};

const formatDateTime = (date) => {
  // Función para formatear las fechas mostradas en el Modal
  if (!date) return 'No definida';
  // Verifica si el objeto es un Timestamp de Firebase antes de llamar toLocale...
  const dateObj = date?.toDate?.() || date; 
  
  return (
    dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) +
    ' - ' +
    dateObj.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
  );
};


  // --- 5. GUARDAR EVENTO ---
  const saveEventToFirestore = async (eventData) => {
    try {
      const ref = collection(db, `users/${userId}/eventos`);
      await addDoc(ref, {
        ...eventData,
        usuarioID: userId,
        fechaInicio: Timestamp.fromDate(eventData.fechaInicio),
        fechaFin: Timestamp.fromDate(eventData.fechaFin),
        createdAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.error('Error al guardar:', error);
      Alert.alert('Error', 'No se pudo guardar el evento.');
      return false;
    }
  };

// ... dentro de handleSaveEvent
const saveEventToDeviceCalendar = async (eventData) => {
  if (!calendarId) {
    return;
  }
  
  await CalendarExpo.createEventAsync(calendarId, {
    title: eventData.titulo,
    notes: eventData.descripcion,
    startDate: eventData.fechaInicio,
    endDate: eventData.fechaFin,
    timeZone: null, 
    allDay: false, 
  });
};

  const handleSaveEvent = async () => {
    if (!form.titulo.trim() || !form.descripcion.trim()) {
      Alert.alert('Campos incompletos', 'Completa todos los campos.');
      return;
    }
    if (form.fechaInicio >= form.fechaFin) {
      Alert.alert('Error', 'La hora de inicio debe ser anterior a la de fin.');
      return;
    }

    const eventData = { ...form };
    const saved = await saveEventToFirestore(eventData);
    if (saved) await saveEventToDeviceCalendar(eventData);
    setIsModalVisible(false);
    Alert.alert('Evento guardado', 'Se ha guardado exitosamente.');
  };

  // --- 6. COMPONENTE DE LISTA DE EVENTOS ---
  const DayEventsList = () => {
    const dayEvents = events[selectedDate]?.dots || [];
    if (dayEvents.length === 0) {
      return (
        <View style={styles.noEventsContainer}>
          <MaterialIcons name="event-available" size={32} color={COLORS.PRIMARY} />
          <Text style={styles.noEventsText}>No hay actividades para este día.</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setIsModalVisible(true)}>
            <MaterialIcons name="add-circle-outline" size={24} color={COLORS.TEXT_LIGHT} />
            <Text style={styles.addButtonText}>Agregar Actividad</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View>
        <Text style={styles.listTitle}>
          Actividades del{' '}
          {new Date(selectedDate).toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </Text>
        {dayEvents.map((item) => (
          <View key={item.key} style={styles.eventCard}>
            <View style={[styles.dotIndicator, { backgroundColor: item.color }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.eventTitle}>{item.event.titulo}</Text>
              <Text style={styles.eventTime}>
                {formatDateTime(item.event.fechaInicio?.toDate?.() || item.event.fechaInicio)} -{' '}
                {formatDateTime(item.event.fechaFin?.toDate?.() || item.event.fechaFin)}
              </Text>
              <Text style={styles.eventDescription}>{item.event.descripcion}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="calendar-today" size={24} color={COLORS.TEXT_LIGHT} />
        <Text style={styles.headerTitle}>Mi Calendario de Viaje</Text>
        <Text style={styles.userIdText}>
          Usuario: {userId ? `${userId.substring(0, 8)}...` : 'Cargando...'}
        </Text>
      </View>

      <ScrollView style={styles.contentContainer}>
        <View style={styles.calendarWrapper}>
          <Calendar
            onDayPress={handleDayPress}
            markedDates={{
              ...events,
              [selectedDate]: {
                selected: true,
                selectedColor: COLORS.ACCENT,
                marked: events[selectedDate]?.marked,
                dots: events[selectedDate]?.dots,
              },
            }}
            markingType="multi-dot"
            theme={{
              backgroundColor: COLORS.TEXT_LIGHT,
              calendarBackground: COLORS.TEXT_LIGHT,
              textSectionTitleColor: COLORS.PRIMARY,
              selectedDayBackgroundColor: COLORS.ACCENT,
              selectedDayTextColor: COLORS.TEXT_LIGHT,
              todayTextColor: COLORS.DOT,
              dayTextColor: COLORS.PRIMARY,
              textDisabledColor: '#D9D3C5',
              dotColor: COLORS.DOT,
              selectedDotColor: COLORS.TEXT_LIGHT,
              arrowColor: COLORS.PRIMARY,
              monthTextColor: COLORS.PRIMARY,
            }}
          />
        </View>
        <DayEventsList />
      </ScrollView>

      {/* MODAL */}
      <Modal animationType="slide" transparent visible={isModalVisible}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Nueva Actividad para {selectedDate}</Text>
            <TextInput
              style={styles.input}
              placeholder="Título"
              value={form.titulo}
              onChangeText={(text) => setForm((p) => ({ ...p, titulo: text }))}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Descripción"
              multiline
              value={form.descripcion}
              onChangeText={(text) => setForm((p) => ({ ...p, descripcion: text }))}
            />
            <TouchableOpacity style={styles.timeButton} onPress={() => { setDateTimePickerType('start'); setIsDateTimePickerVisible(true); }}>
              <MaterialIcons name="access-time" size={20} color={COLORS.PRIMARY} />
              <Text style={styles.timeButtonText}>Inicio: {formatDateTime(form.fechaInicio)}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.timeButton} onPress={() => { setDateTimePickerType('end'); setIsDateTimePickerVisible(true); }}>
              <MaterialIcons name="alarm-on" size={20} color={COLORS.PRIMARY} />
              <Text style={styles.timeButtonText}>Fin: {formatDateTime(form.fechaFin)}</Text>
            </TouchableOpacity>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: COLORS.SECONDARY }]} onPress={() => setIsModalVisible(false)}>
                <MaterialIcons name="cancel" size={20} color={COLORS.PRIMARY} />
                <Text style={styles.actionButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: COLORS.ACCENT }]} onPress={handleSaveEvent}>
                <MaterialIcons name="save" size={20} color={COLORS.TEXT_LIGHT} />
                <Text style={[styles.actionButtonText, { color: COLORS.TEXT_LIGHT }]}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <DateTimePickerModal
        isVisible={isDateTimePickerVisible}
        mode="datetime"
        onConfirm={handleConfirmDateTime}
        onCancel={() => setIsDateTimePickerVisible(false)}
      />
    </View>
  );
};

// --- ESTILOS ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8E6' },
  header: {
    backgroundColor: COLORS.PRIMARY,
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.TEXT_LIGHT },
  userIdText: { fontSize: 12, color: COLORS.SECONDARY, opacity: 0.8 },
  calendarWrapper: { backgroundColor: COLORS.TEXT_LIGHT, margin: 12, borderRadius: 15, padding: 5 },
  modalView: {
    margin: 20,
    backgroundColor: COLORS.TEXT_LIGHT,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: COLORS.PRIMARY,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  modalTitle: { marginBottom: 20, fontSize: 22, fontWeight: 'bold', color: COLORS.PRIMARY },
  input: {
    width: '100%',
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.SECONDARY,
    borderRadius: 10,
    color: COLORS.PRIMARY,
    backgroundColor: '#FFF9F6',
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#FCEAD6',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.ACCENT,
  },
  timeButtonText: { marginLeft: 10, fontSize: 16, color: COLORS.PRIMARY },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 20 },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    width: '48%',
    justifyContent: 'center',
  },
  actionButtonText: { marginLeft: 5, fontSize: 16, fontWeight: 'bold', color: COLORS.PRIMARY },
  listTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.PRIMARY, margin: 15 },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF9F6',
    borderRadius: 12,
    marginHorizontal: 10,
    marginVertical: 5,
    padding: 15,
    borderLeftWidth: 5,
    borderLeftColor: COLORS.ACCENT,
    shadowColor: COLORS.PRIMARY,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dotIndicator: { width: 8, height: 40, borderRadius: 4, marginRight: 10 },
  eventTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.PRIMARY },
  eventTime: { fontSize: 12, color: COLORS.DOT, marginBottom: 3 },
  eventDescription: { fontSize: 14, color: COLORS.PRIMARY, opacity: 0.8 },
  noEventsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    marginTop: 20,
    backgroundColor: '#FFF9F6',
    marginHorizontal: 15,
    borderRadius: 15,
  },
  noEventsText: { fontSize: 16, color: COLORS.PRIMARY, marginTop: 10, marginBottom: 15 },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  addButtonText: { color: COLORS.TEXT_LIGHT, fontWeight: 'bold', marginLeft: 5 },
  centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
});

export default CalendarScreen;
