

import React, { useState } from 'react';
import {
  View, TextInput, Button, Text,
  StyleSheet, Alert, ScrollView
} from 'react-native';
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

 
  let favoritos = 0;


  const handleRegistro = async () => {
    try {
    
      const userCredential = await createUserWithEmailAndPassword(
        auth, correo, contrasena
      );
      const user = userCredential.user; 

   
      await setDoc(doc(db, 'usuarios', user.uid), {
        uid: user.uid,
        nombre,      
        correo,
        fecha,
        telefono,
        favoritos,   
      });

     
      Alert.alert('¡Éxito!', 'Usuario registrado correctamente');

      
      navigation.navigate('Login');

    } catch (error) {
      
      Alert.alert('Error al registrarse', error.message);
    }
  };


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>📋 Crear Cuenta</Text>
      <Text style={styles.subtitulo}>Art Institute of Chicago</Text>

      <TextInput
        placeholder="Nombre completo"
        value={nombre}
        onChangeText={setNombre} 
        style={styles.input}
      />
      <TextInput
        placeholder="Correo electrónico"
        value={correo}
        onChangeText={setCorreo}
        style={styles.input}
        autoCapitalize="none"    
        keyboardType="email-address" 
      />
      <TextInput
        placeholder="Contraseña (mín. 6 caracteres)"
        value={contrasena}
        onChangeText={setContrasena}
        style={styles.input}
        secureTextEntry  
      />
      <TextInput
        placeholder="Fecha de nacimiento (YYYY-MM-DD)"
        value={fecha}
        onChangeText={setFecha}
        style={styles.input}
      />
      <TextInput
        placeholder="Teléfono"
        value={telefono}
        onChangeText={setTelefono}
        style={styles.input}
        keyboardType="phone-pad" 
      />

      <Button title="Registrarse" onPress={handleRegistro} color="#8B4513" />

      <View style={{ marginTop: 15 }}>
        {}
        <Button
          title="¿Ya tienes cuenta? Inicia sesión"
          onPress={() => navigation.navigate('Login')}
          color="#555"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,          
    justifyContent: 'center',
    padding: 25,
    backgroundColor: '#FFF8F0', 
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#3D2B1F',
    marginBottom: 5,
  },
  subtitulo: {
    fontSize: 14,
    textAlign: 'center',
    color: '#8B4513',
    marginBottom: 30,
    fontStyle: 'italic',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D4A88C',
    padding: 12,
    marginBottom: 14,
    borderRadius: 8,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#3D2B1F',
  },
});