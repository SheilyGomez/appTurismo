import React, { useState, useEffect } from 'react';
import {
  View, Text,  TextInput,  TouchableOpacity,
  StyleSheet,  Alert,  ScrollView,  ImageBackground,  Platform,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker'; // Importar DateTimePicker
import { useAuth } from '../../auth/AuthContext';
import{db} from '../../auth/firebaseConfig'
import { collection, getDocs } from 'firebase/firestore';

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [nombreCompleto, setNombreCompleto] = useState('');

  // Para País (usando DropDownPicker con una única opción)
  const [openPais, setOpenPais] = useState(false);
  const [pais, setPais] = useState('El Salvador'); // Valor predeterminado y único
  const [itemsPais, setItemsPais] = useState([
    { label: 'El Salvador', value: 'El Salvador', icon: () => <Text style={{marginRight: 5}}>🇸🇻</Text> },
  ]);
  // Para DropDownPicker de Categoria de Viaje
  const [openCategoria, setOpenCategoria] = useState(false);
  const [CategoriaViaje, setCategoriaViaje] = useState([]);
  const [itemsCategoria, setItemsCategoria] = useState([]); // <-- Inicialmente vacío
  const [loadingCategoria, setLoadingCategoria] = useState(true); // <-- Estado de carga

  // Para DropDownPicker de tipoViaje
  const [opentipoViaje, setOpentipoViaje] = useState(false);
  const [tipoViaje, settipoViaje] = useState([]);
  const [itemstipoViaje, setItemstipoViaje] = useState([]); // <-- Inicialmente vacío
  const [loadingtipoViaje, setLoadingtipoViaje] = useState(true); // <-- Estado de carga

  // Para DropDownPicker de actividades Preferidas
  const [openactividades, setOpenactividades] = useState(false);
  const [actividadesCategoria, setactividadesCategoria] = useState([]);
  const [itemsactividades, setItemsactividades] = useState([]); // <-- Inicialmente vacío
  const [loadingactividades, setLoadingactividades] = useState(true); // <-- Estado de carga

  // Para Selector de Fecha de Nacimiento
  const [fechaDeNacimiento, setFechaDeNacimiento] = useState(''); // String YYYY-MM-DD
  const [date, setDate] = useState(new Date()); // Objeto Date para el picker
  const [showDatePicker, setShowDatePicker] = useState(false); // Visibilidad del picker

  const { register, loading } = useAuth();

  // Asegura que solo un DropDownPicker esté abierto a la vez
  
  useEffect(() => {
  const fetchFirestoreData = async () => {
    // Cargar Categoria de Viaje (categoriaViaje)
    setLoadingCategoria(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'categoriaViaje'));
      const data = querySnapshot.docs.map(doc => ({
        label: doc.data().nombre,
        value: doc.data().nombre, // Usamos el nombre como valor
      }));
      setItemsCategoria(data);
    } catch (error) {
      console.error("Error fetching Categoria de viaje:", error);
      Alert.alert("Error", "No se pudieron cargar las Categoria de viaje.");
    } finally {
      setLoadingCategoria(false);
    }

    // Cargar tipoViaje (tipoDeViaje)
    setLoadingtipoViaje(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'tipoViaje'));
      const data = querySnapshot.docs.map(doc => ({
        label: doc.data().nombre,
        value: doc.data().nombre, // Usamos el nombre como valor
      }));
      setItemstipoViaje(data);
    } catch (error) {
      console.error("Error fetching tipoViaje:", error);
      Alert.alert("Error", "No se pudieron cargar los tipoViaje.");
    } finally {
      setLoadingtipoViaje(false);
    }

    // Cargar actividades Preferidas (categoriaactividadesd)
    setLoadingactividades(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'categoriaActividades'));
      const data = querySnapshot.docs.map(doc => ({
        label: doc.data().nombre,
        value: doc.data().nombre, // Usamos el nombre como valor
      }));
      setItemsactividades(data);
    } catch (error) {
      console.error("Error fetching actividades preferidas:", error);
      Alert.alert("Error", "No se pudieron cargar las actividades preferidas.");
    } finally {
      setLoadingactividades(false);
    }
  };

  fetchFirestoreData();
}, []); // El array vacío asegura que se ejecute solo una vez al montar
  // Asegura que solo un DropDownPicker esté abierto a la vez
  useEffect(() => {
    setOpenCategoria(false);
    setOpentipoViaje(false);
    setOpenactividades(false);
  }, [openPais]); // Cierra los demás si se abre el de País (aunque este estará siempre cerrado)
  const handleRegister = async () => {
    // Validaciones básicas de campos
    if (!email || !password || !nombreUsuario || !nombreCompleto || !pais || !fechaDeNacimiento) {
      Alert.alert('Error', 'Por favor, completa todos los campos obligatorios.');
      return;
    }

    const userData = {
      email,
      password,
      nombreUsuario,
      nombreCompleto,
      pais,
      CategoriaViaje,
      tipoViaje,
      actividadesCategoria,
      fechaDeNacimiento, // Ya está en formato YYYY-MM-DD
    };

    try {
      await register(userData);
      Alert.alert('Registro Exitoso', 'Tu cuenta ha sido creada. ¡Ahora puedes iniciar sesión!');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Error de Registro', error.message || 'Hubo un problema al registrarte.');
    }
  };

  // Función para manejar el cambio de fecha del picker
  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios'); // En iOS, el picker no se cierra automáticamente
    setDate(currentDate);

    // Formatear la fecha a YYYY-MM-DD
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    setFechaDeNacimiento(`${year}-${month}-${day}`);
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  return (
    <ImageBackground
      source={require('../../../../assets/_.jpeg')}
      style={styles.background}
    >
      <View style={styles.overlay} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.title}>Crea tu cuenta</Text>

          <View style={styles.inputContainer}>
            <Icon name="envelope" size={20} color="#E0E0E0" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Correo Electrónico"
              placeholderTextColor="#ffffffff"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <View style={styles.inputContainer}>
            <Icon name="lock" size={20} color="#E0E0E0" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor="#ffffffff"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon name="user" size={20} color="#E0E0E0" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Nombre de Usuario"
              placeholderTextColor="#ffffffff"
              value={nombreUsuario}
              onChangeText={setNombreUsuario}
            />
          </View>
          <View style={styles.inputContainer}>
            <Icon name="address-card" size={20} color="#E0E0E0" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Nombre Completo"
              placeholderTextColor="#ffffffff"
              value={nombreCompleto}
              onChangeText={setNombreCompleto}
            />
          </View>

          <View style={[styles.dropdownContainer, { zIndex: openPais ? 4000 : 100 }]}>
            
            <Text style={[styles.dropdownTextStyle,{paddingLeft:10}]}> 
              País: 
            </Text>

            <DropDownPicker
              open={openPais}
              value={pais}
              items={itemsPais}
              setOpen={setOpenPais}
              setValue={setPais}
              setItems={setItemsPais}
              placeholder="País"
              placeholderStyle={styles.placeholderText}
              style={styles.dropdownStyle}
              textStyle={styles.dropdownTextStyle}
              showArrowIcon={false}
              disableBorderRadius={true}
              listMode="SCROLLVIEW"
              badgeTextStyle={{ color: '#FFFFFF', fontSize: 14 }}
              badgeContainerStyle={{ marginHorizontal: 2 }}
              dropDownContainerStyle={styles.dropdownMenuContainer}
              selectedItemContainerStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              scrollViewProps={{
                nestedScrollEnabled: true,
              }}
            />
          </View>

          <View style={[styles.dropdownContainer, { zIndex: openCategoria ? 3000 : 1000 }]}>
            <Text style={[styles.dropdownTextStyle,{paddingLeft:10}]}> 
              Categorias de Viaje: 
            </Text>
            <DropDownPicker
              open={openCategoria}
              value={CategoriaViaje}
              items={itemsCategoria}
              setOpen={setOpenCategoria}
              setValue={setCategoriaViaje}
              setItems={setItemsCategoria}
              placeholder="Categorias de Viaje"
              placeholderStyle={styles.placeholderText}
              style={styles.dropdownStyle}
              textStyle={styles.dropdownTextStyle}
              multiple={true}
              min={0}
              max={5}
              mode="BADGE"
              badgeColors={['#FF6F61']}
              badgeDotColors={['white']}
              badgeTextStyle={{ color: '#ffffffff', fontSize: 14 }}
              badgeContainerStyle={{ marginHorizontal: 2 }}
              dropDownContainerStyle={styles.dropdownMenuContainer}
              selectedItemContainerStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              tickIconStyle={{ tintColor: '#FF6F61' }}
              itemSeparator={true}
              itemSeparatorStyle={{backgroundColor: 'rgba(255, 255, 255, 0.1)'}}
              listMode="SCROLLVIEW"
              scrollViewProps={{
                nestedScrollEnabled: true,
              }}
            />
          </View>
          <View style={[styles.dropdownContainer, { zIndex: opentipoViaje ? 2000 : 900 }]}>
            <Text style={[styles.dropdownTextStyle,{paddingLeft:10}]}> 
              Tipos de viaje: 
            </Text>
            <DropDownPicker
              open={opentipoViaje}
              value={tipoViaje}
              items={itemstipoViaje}
              setOpen={setOpentipoViaje}
              setValue={settipoViaje}
              setItems={setItemstipoViaje}
              placeholder="Tipos de viaje"
              placeholderStyle={styles.placeholderText}
              style={styles.dropdownStyle}
              textStyle={styles.dropdownTextStyle}
              multiple={true}
              min={0}
              max={5}
              mode="BADGE"
              badgeColors={['#FF6F61']}
              badgeDotColors={['white']}
              badgeTextStyle={{ color: '#FFFFFF', fontSize: 14 }}
              badgeContainerStyle={{ marginHorizontal: 2 }}
              dropDownContainerStyle={styles.dropdownMenuContainer}
              selectedItemContainerStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              tickIconStyle={{ tintColor: '#FF6F61' }}
              itemSeparator={true}
              itemSeparatorStyle={{backgroundColor: 'rgba(255, 255, 255, 0.1)'}}
              listMode="SCROLLVIEW"
              scrollViewProps={{
                nestedScrollEnabled: true,
              }}
            />
          </View>

          
          <View style={[styles.dropdownContainer, { zIndex: openactividades ? 1000 : 800 }]}>
            <Text style={[styles.dropdownTextStyle,{paddingLeft:10}]}> 
              Actividades Preferidas:
            </Text>
            <DropDownPicker
              open={openactividades}
              value={actividadesCategoria}
              items={itemsactividades}
              setOpen={setOpenactividades}
              setValue={setactividadesCategoria}
              setItems={setItemsactividades}
              placeholder="Actividades Preferidas"
              placeholderStyle={styles.placeholderText}
              style={styles.dropdownStyle}
              textStyle={styles.dropdownTextStyle}
              multiple={true}
              min={0}
              max={5}
              mode="BADGE"
              badgeColors={['#FF6F61']}
              badgeDotColors={['white']}
              badgeTextStyle={{ color: '#FFFFFF', fontSize: 14 }}
              badgeContainerStyle={{ marginHorizontal: 2 }}
              dropDownContainerStyle={styles.dropdownMenuContainer}
              selectedItemContainerStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              tickIconStyle={{ tintColor: '#FF6F61' }}
              itemSeparator={true}
              itemSeparatorStyle={{backgroundColor: 'rgba(255, 255, 255, 0.1)'}}
              listMode="SCROLLVIEW"
              scrollViewProps={{
                nestedScrollEnabled: true,
              }}
            />
          </View>

          <TouchableOpacity
            style={styles.inputContainer} // Reutilizamos el estilo del input normal
            onPress={showDatepicker}
          >
            <Icon name="calendar" size={20} color="#E0E0E0" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Fecha de Nacimiento"
              placeholderTextColor="#ffffffff"
              value={fechaDeNacimiento}
              editable={false} // Para que el usuario no escriba, solo use el picker
            />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              testID="dateTimePicker"
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'} // 'spinner' para iOS, 'default' para Android
              onChange={onChangeDate}
              maximumDate={new Date()} // No permitir fechas futuras
              themeVariant="dark" // Para que se vea bien en el fondo oscuro
            />
          )}

          <TouchableOpacity
            style={[styles.button, styles.registerButton]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? "Registrando..." : "Registrar"}</Text>
          </TouchableOpacity>

          <View style={styles.loginPrompt}>
            <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={loading}>
              <Text style={styles.loginLink}>Iniciar Sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    paddingTop: Platform.OS === 'android' ? 40 : 60,
    paddingBottom: Platform.OS === 'android' ? 40 : 60,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  container: {
    alignItems: 'center',
    paddingHorizontal: 25,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 40,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'rgba(145, 140, 140, 0.72)',
    borderRadius: 30,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 55,
  },
  inputIcon: {
    marginRight: 10,
    color: '#E0E0E0',
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    paddingVertical: 10,
  },
  button: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  registerButton: {
    backgroundColor: '#FF6F61',
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'Roboto-Bold',
  },
  loginPrompt: {
    flexDirection: 'row',
    marginTop: 10,
  },
  loginText: {
    color: '#E0E0E0',
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'Roboto-Medium',
  },
  loginLink: {
    color: '#FF6F61',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'Roboto-Bold',
  },
  placeholderText: {
    color: '#ffffffff',
    fontSize: 16,
  },
  dropdownContainer: {
    width: '100%',
    marginBottom: 15,
  },
  dropdownStyle: {
    backgroundColor: 'rgba(145, 140, 140, 0.72)',
    borderRadius: 30,
    borderWidth: 0,
    minHeight: 55,
    paddingLeft: 45,
  },
  dropdownTextStyle: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  dropdownMenuContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.86)',
    borderRadius: 15,
    borderWidth: 0,
    marginTop: 5,
  },
});
export default RegisterScreen;