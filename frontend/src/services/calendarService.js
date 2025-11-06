// services/calendarService.js
import * as Calendar from 'expo-calendar';

export class CalendarService {
  // Verificar y solicitar permisos
  static async requestCalendarPermissions() {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status === 'granted') {
        return true;
      }
      
      // Si no se conceden, intentar con permisos de calendario específicos
      const calendarStatus = await Calendar.getCalendarPermissionsAsync();
      if (calendarStatus.status !== 'granted') {
        Alert.alert(
          "Permisos necesarios",
          "Esta app necesita acceso a tu calendario para sincronizar eventos.",
          [{ text: "OK" }]
        );
      }
      return false;
    } catch (error) {
      console.error("Error solicitando permisos:", error);
      return false;
    }
  }

  // Obtener el calendario por defecto o crear uno si no existe
  static async getDefaultCalendar() {
    try {
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      
      // Buscar calendarios que permitan modificaciones
      const writableCalendars = calendars.filter(cal => cal.allowsModifications);
      
      // Preferir calendarios de Google
      const googleCalendar = writableCalendars.find(cal => 
        cal.source && cal.source.name === 'google'
      );
      
      if (googleCalendar) {
        return googleCalendar;
      }
      
      // Si no hay calendario de Google, usar el primero editable
      if (writableCalendars.length > 0) {
        return writableCalendars[0];
      }
      
      // Si no hay calendarios editables, crear uno
      return await this.createDefaultCalendar();
    } catch (error) {
      console.error("Error obteniendo calendario:", error);
      throw error;
    }
  }

  // Crear un calendario por defecto para la app
  static async createDefaultCalendar() {
    try {
      const defaultCalendarSource = {
        isLocalAccount: true,
        name: 'Tu App de Viajes',
        type: Calendar.CalendarType.LOCAL,
      };

      const calendarId = await Calendar.createCalendarAsync({
        title: 'Viajes y Actividades',
        color: '#6366F1',
        entityType: Calendar.EntityTypes.EVENT,
        source: defaultCalendarSource,
        name: 'travelCalendar',
        ownerAccount: 'personal',
        accessLevel: Calendar.CalendarAccessLevel.OWNER,
      });

      return {
        id: calendarId,
        title: 'Viajes y Actividades',
        allowsModifications: true
      };
    } catch (error) {
      console.error("Error creando calendario:", error);
      throw error;
    }
  }

  // Crear evento en el calendario
  static async createCalendarEvent(eventData) {
    try {
      const hasPermission = await this.requestCalendarPermissions();
      if (!hasPermission) {
        throw new Error("Permisos de calendario no concedidos");
      }

      const calendar = await this.getDefaultCalendar();
      
      const eventDetails = {
        title: eventData.title,
        startDate: new Date(eventData.startDate),
        endDate: new Date(eventData.endDate),
        alarms: [{ relativeOffset: -30 }], // Alarma 30 minutos antes
        timeZone: 'America/Mexico_City', // Ajusta según tu zona horaria
      };

      if (eventData.description) {
        eventDetails.notes = eventData.description;
      }

      if (eventData.location) {
        eventDetails.location = eventData.location;
      }

      const eventId = await Calendar.createEventAsync(calendar.id, eventDetails);
      return eventId;
    } catch (error) {
      console.error("Error creando evento en calendario:", error);
      throw error;
    }
  }

  // Actualizar evento en el calendario
  static async updateCalendarEvent(eventId, eventData) {
    try {
      const hasPermission = await this.requestCalendarPermissions();
      if (!hasPermission) {
        throw new Error("Permisos de calendario no concedidos");
      }

      const eventDetails = {
        title: eventData.title,
        startDate: new Date(eventData.startDate),
        endDate: new Date(eventData.endDate),
      };

      if (eventData.description) {
        eventDetails.notes = eventData.description;
      }

      if (eventData.location) {
        eventDetails.location = eventData.location;
      }

      await Calendar.updateEventAsync(eventId, eventDetails);
    } catch (error) {
      console.error("Error actualizando evento en calendario:", error);
      throw error;
    }
  }

  // Eliminar evento del calendario
  static async deleteCalendarEvent(eventId) {
    try {
      const hasPermission = await this.requestCalendarPermissions();
      if (!hasPermission) return;

      await Calendar.deleteEventAsync(eventId);
    } catch (error) {
      console.error("Error eliminando evento del calendario:", error);
      throw error;
    }
  }

  // Obtener eventos de un día específico
  static async getEventsForDate(date) {
    try {
      const hasPermission = await this.requestCalendarPermissions();
      if (!hasPermission) return [];

      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      const events = await Calendar.getEventsAsync([], startDate, endDate);
      return events;
    } catch (error) {
      console.error("Error obteniendo eventos:", error);
      return [];
    }
  }
}