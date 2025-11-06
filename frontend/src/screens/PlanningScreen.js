import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  FlatList, 
  Text, 
  TouchableOpacity, 
  Alert, 
  StyleSheet,
  StatusBar,
  ScrollView,
  Dimensions,
  RefreshControl
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#0066D2',
  secondary: '#1CA698',
  accent: '#6CD9CE',
  highlight: '#F2B705',
  neutral: '#BFA393',
  background: '#F5F7FA',
  white: '#FFFFFF',
  textDark: '#2D3748',
  textMedium: '#4A5568',
  textLight: '#718096',
  cardBackground: '#FFFFFF',
  border: '#E2E8F0',
  surface: '#EDF2F7'
};

// Simular servicio
const getUserItineraries = async () => {
  // Datos de ejemplo
  return [
    {
      id: '1',
      title: 'Visita al Museo Nacional',
      description: 'Recorrido por las exhibiciones principales',
      date: new Date().toISOString().split('T')[0],
      time: '10:00',
      location: 'Museo Nacional',
      duration: 120
    },
    {
      id: '2',
      title: 'Almuerzo en Restaurante',
      description: 'Comida tradicional local',
      date: new Date().toISOString().split('T')[0],
      time: '13:00',
      location: 'Restaurante Central',
      duration: 90
    }
  ];
};

const PlanningScreen = ({ navigation, route }) => {
  const [itineraries, setItineraries] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState('grid');
  const [refreshing, setRefreshing] = useState(false);

  const loadItineraries = useCallback(async () => {
    try {
      setRefreshing(true);
      console.log('Cargando itinerarios...');
      const data = await getUserItineraries();
      console.log('Itinerarios cargados:', data.length);
      setItineraries(data);
    } catch (error) {
      console.error("Error al cargar itinerarios:", error);
      Alert.alert("Error", "No se pudieron cargar las actividades.");
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadItineraries();
  }, [loadItineraries]);

  // Recargar cuando se regresa de crear actividad
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadItineraries();
    });

    return unsubscribe;
  }, [navigation, loadItineraries]);

  // Preparar fechas marcadas
  const markedDates = {};
  itineraries.forEach(item => {
    if (item.date) {
      const isSelected = item.date === selectedDate;
      markedDates[item.date] = { 
        marked: true, 
        dotColor: COLORS.highlight,
        selected: isSelected,
        selectedColor: isSelected ? COLORS.primary : undefined
      };
    }
  });

  if (selectedDate && !markedDates[selectedDate]) {
    markedDates[selectedDate] = { selected: true, selectedColor: COLORS.primary };
  } else if (markedDates[selectedDate]) {
    markedDates[selectedDate].selected = true;
    markedDates[selectedDate].selectedColor = COLORS.primary;
  }

  const filteredActivities = itineraries.filter(item => item.date === selectedDate);

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.length === 5 ? timeString : timeString.substring(0, 5);
  };

  // Render para vista de grid
  const renderGridItem = ({ item, index }) => (
    <TouchableOpacity 
      style={[
        styles.gridCard,
        { 
          marginLeft: index % 2 === 0 ? 0 : 12 
        }
      ]}
      onPress={() => navigation.navigate('ActivityDetail', { activityId: item.id })}
    >
      <View style={styles.gridHeader}>
        <View style={[styles.gridIconContainer, { backgroundColor: `${COLORS.primary}15` }]}>
          <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
        </View>
      </View>
      
      <Text style={styles.gridTime}>{formatTime(item.time)}</Text>
      <Text style={styles.gridTitle} numberOfLines={2}>
        {item.title}
      </Text>
      
      <View style={styles.gridFooter}>
        <View style={styles.locationTag}>
          <Ionicons name="location-outline" size={10} color={COLORS.textLight} />
          <Text style={styles.gridLocation} numberOfLines={1}>
            {item.location || 'Sin ubicación'}
          </Text>
        </View>
      </View>
      
      <View style={[styles.gridAccent, { backgroundColor: COLORS.primary }]} />
    </TouchableOpacity>
  );

  // Render para vista de lista
  const renderListItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.listCard}
      onPress={() => navigation.navigate('ActivityDetail', { activityId: item.id })}
    >
      <View style={[styles.listIconContainer, { backgroundColor: `${COLORS.primary}15` }]}>
        <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
      </View>
      
      <View style={styles.listContent}>
        <View style={styles.listHeader}>
          <Text style={styles.listTime}>{formatTime(item.time)}</Text>
        </View>
        
        <Text style={styles.listTitle}>{item.title}</Text>
        
        {item.description && (
          <Text style={styles.listDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        
        <View style={styles.listMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={12} color={COLORS.textLight} />
            <Text style={styles.metaText}>{item.location || 'Sin ubicación'}</Text>
          </View>
          {item.duration && (
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={12} color={COLORS.textLight} />
              <Text style={styles.metaText}>{item.duration} min</Text>
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.listArrow}>
        <Ionicons name="chevron-forward" size={16} color={COLORS.textLight} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Mi Planificación</Text>
            <Text style={styles.headerSubtitle}>
              {new Date(selectedDate).toLocaleDateString('es-ES', { 
                weekday: 'long', 
                day: 'numeric',
                month: 'long'
              })}
            </Text>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={[styles.viewModeButton, viewMode === 'grid' && styles.viewModeButtonActive]}
              onPress={() => setViewMode('grid')}
            >
              <Ionicons 
                name="grid" 
                size={20} 
                color={viewMode === 'grid' ? COLORS.white : COLORS.primary} 
              />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.viewModeButton, viewMode === 'list' && styles.viewModeButtonActive]}
              onPress={() => setViewMode('list')}
            >
              <Ionicons 
                name="list" 
                size={20} 
                color={viewMode === 'list' ? COLORS.white : COLORS.primary} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={loadItineraries}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Stats Cards */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.statsContainer}
          contentContainerStyle={styles.statsContent}
        >
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: COLORS.primary }]}>
              <Ionicons name="calendar-outline" size={20} color={COLORS.white} />
            </View>
            <Text style={styles.statNumber}>{itineraries.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: COLORS.secondary }]}>
              <Ionicons name="today-outline" size={20} color={COLORS.white} />
            </View>
            <Text style={styles.statNumber}>{filteredActivities.length}</Text>
            <Text style={styles.statLabel}>Hoy</Text>
          </View>
        </ScrollView>

        {/* Calendar Section */}
        <View style={styles.calendarSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Calendario</Text>
            <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
          </View>
          <View style={styles.calendarContainer}>
            <Calendar
              onDayPress={(day) => setSelectedDate(day.dateString)}
              markedDates={markedDates}
              theme={{
                backgroundColor: COLORS.cardBackground,
                calendarBackground: COLORS.cardBackground,
                selectedDayBackgroundColor: COLORS.primary,
                selectedDayTextColor: COLORS.white,
                todayTextColor: COLORS.primary,
                dayTextColor: COLORS.textDark,
                textDisabledColor: '#CBD5E1',
                dotColor: COLORS.highlight,
                selectedDotColor: COLORS.white,
                arrowColor: COLORS.primary,
                monthTextColor: COLORS.textDark,
              }}
              style={styles.calendar}
            />
          </View>
        </View>

        {/* Activities Section */}
        <View style={styles.activitiesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Actividades</Text>
            <View style={styles.activityCountBadge}>
              <Text style={styles.activityCount}>{filteredActivities.length}</Text>
            </View>
          </View>

          {filteredActivities.length > 0 ? (
            viewMode === 'grid' ? (
              <FlatList
                data={filteredActivities}
                keyExtractor={(item) => item.id}
                renderItem={renderGridItem}
                numColumns={2}
                scrollEnabled={false}
                contentContainerStyle={styles.gridContent}
              />
            ) : (
              <FlatList
                data={filteredActivities}
                keyExtractor={(item) => item.id}
                renderItem={renderListItem}
                scrollEnabled={false}
                contentContainerStyle={styles.listContent}
              />
            )
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="calendar-outline" size={48} color={COLORS.accent} />
              </View>
              <Text style={styles.emptyTitle}>¡Día Libre!</Text>
              <Text style={styles.emptyText}>
                No hay actividades programadas para esta fecha
              </Text>
              <TouchableOpacity 
                style={styles.emptyButton}
                onPress={() => navigation.navigate('ActivityForm')}
              >
                <Ionicons name="add-outline" size={18} color={COLORS.white} />
                <Text style={styles.emptyButtonText}>Crear Actividad</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('ActivityForm')}
      >
        <Ionicons name="add" size={24} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.textMedium,
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: COLORS.white,
    padding: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  viewModeButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewModeButtonActive: {
    backgroundColor: COLORS.primary,
  },
  statsContainer: {
    marginTop: 16,
    marginBottom: 20,
  },
  statsContent: {
    paddingHorizontal: 16,
  },
  statCard: {
    width: 100,
    padding: 16,
    borderRadius: 16,
    marginRight: 12,
    backgroundColor: COLORS.cardBackground,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  calendarSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  calendarContainer: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  calendar: {
    borderRadius: 12,
  },
  activitiesSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  activityCountBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  activityCount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  gridContent: {
    paddingBottom: 100,
  },
  listContent: {
    paddingBottom: 100,
  },
  gridCard: {
    width: (width - 40) / 2,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
    overflow: 'hidden',
  },
  gridHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  gridIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridTime: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textLight,
    marginBottom: 4,
  },
  gridTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 8,
    flex: 1,
  },
  gridFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  gridLocation: {
    fontSize: 10,
    color: COLORS.textLight,
    marginLeft: 4,
  },
  gridAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 4,
    height: '100%',
  },
  listCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    marginBottom: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  listIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  listContent: {
    flex: 1,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  listTime: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 6,
  },
  listDescription: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 18,
    marginBottom: 12,
  },
  listMeta: {
    flexDirection: 'row',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginLeft: 4,
  },
  listArrow: {
    justifyContent: 'center',
    paddingLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${COLORS.accent}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  emptyButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    backgroundColor: COLORS.primary,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default PlanningScreen;