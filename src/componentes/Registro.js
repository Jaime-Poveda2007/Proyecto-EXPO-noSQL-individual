import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/firebaseConfig';
import { useNavigation } from '@react-navigation/native';

export default function Registro() {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [fecha, setFecha] = useState('');
  const [telefono, setTelefono] = useState('');
  const navigation = useNavigation();

  const handleFecha = (texto) => {
    const soloNums = texto.replace(/[^0-9]/g, '');
    let formateado = soloNums;
    if (soloNums.length >= 5) {
      formateado = soloNums.slice(0, 4) + '-' + soloNums.slice(4);
    }
    if (soloNums.length >= 7) {
      formateado = soloNums.slice(0, 4) + '-' + soloNums.slice(4, 6) + '-' + soloNums.slice(6, 8);
    }
    setFecha(formateado);
  };

  const handleRegistro = async () => {
    if (!nombre || !correo || !contrasena || !fecha || !telefono) {
      Alert.alert('Campos requeridos', 'Por favor completa todos los campos');
      return;
    }
    const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!fechaRegex.test(fecha)) {
      Alert.alert('Fecha invalida', 'Usa el formato YYYY-MM-DD, ejemplo: 2000-05-24');
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, correo, contrasena);
      const user = userCredential.user;
      await setDoc(doc(db, 'usuarios', user.uid), {
        uid: user.uid,
        nombre,
        correo,
        fecha,
        telefono,
        favoritos: 0,
      });
      Alert.alert('Exito', 'Usuario registrado correctamente');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Error al registrarse', error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Crear Cuenta</Text>
      <Text style={styles.subtitulo}>Art Institute of Chicago</Text>
      <TextInput placeholder="Nombre completo" placeholderTextColor="#B08060" value={nombre} onChangeText={setNombre} style={styles.input} />
      <TextInput placeholder="Correo electronico" placeholderTextColor="#B08060" value={correo} onChangeText={setCorreo} style={styles.input} autoCapitalize="none" keyboardType="email-address" />
      <TextInput placeholder="Contrasena (min. 6 caracteres)" placeholderTextColor="#B08060" value={contrasena} onChangeText={setContrasena} style={styles.input} secureTextEntry />
      <TextInput placeholder="Fecha de nacimiento: YYYY-MM-DD" placeholderTextColor="#B08060" value={fecha} onChangeText={handleFecha} style={styles.input} keyboardType="numeric" maxLength={10} />
      <Text style={styles.hint}>Ejemplo: 2000-05-24</Text>
      <TextInput placeholder="Telefono" placeholderTextColor="#B08060" value={telefono} onChangeText={setTelefono} style={styles.input} keyboardType="phone-pad" />
      <Button title="Registrarse" onPress={handleRegistro} color="#8B4513" />
      <View style={{ marginTop: 15 }}>
        <Button title="Ya tienes cuenta? Inicia sesion" onPress={() => navigation.navigate('Login')} color="#555" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 25, backgroundColor: '#FFF8F0' },
  titulo: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', color: '#3D2B1F', marginBottom: 5 },
  subtitulo: { fontSize: 14, textAlign: 'center', color: '#8B4513', marginBottom: 30, fontStyle: 'italic' },
  input: { borderWidth: 1, borderColor: '#D4A88C', padding: 12, marginBottom: 6, borderRadius: 8, backgroundColor: '#fff', fontSize: 16, color: '#3D2B1F' },
  hint: { fontSize: 12, color: '#999', marginBottom: 10, marginLeft: 4 },
});
