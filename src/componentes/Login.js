import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/firebaseConfig';
import { useNavigation } from '@react-navigation/native';

export default function Login() {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const navigation = useNavigation();

  const handleLogin = async () => {
    if (!correo || !contrasena) {
      Alert.alert('Campos requeridos', 'Por favor completa todos los campos');
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, correo, contrasena);
    } catch (error) {
      Alert.alert('Error al iniciar sesion', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>ArtChicago</Text>
      <Text style={styles.subtitulo}>Tu galeria de arte en el bolsillo</Text>
      <TextInput
        placeholder="Correo electronico"
        placeholderTextColor="#B08060"
        value={correo}
        onChangeText={setCorreo}
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Contrasena"
        placeholderTextColor="#B08060"
        value={contrasena}
        onChangeText={setContrasena}
        style={styles.input}
        secureTextEntry
      />
      <Button title="Ingresar" onPress={handleLogin} color="#8B4513" />
      <View style={{ marginTop: 15 }}>
        <Button
          title="No tienes cuenta? Registrate"
          onPress={() => navigation.navigate('Registro')}
          color="#555"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 25, backgroundColor: '#FFF8F0' },
  titulo: { fontSize: 36, fontWeight: 'bold', textAlign: 'center', color: '#3D2B1F', marginBottom: 8 },
  subtitulo: { fontSize: 14, textAlign: 'center', color: '#8B4513', marginBottom: 40, fontStyle: 'italic' },
  input: { borderWidth: 1, borderColor: '#D4A88C', padding: 12, marginBottom: 14, borderRadius: 8, backgroundColor: '#fff', fontSize: 16, color: '#3D2B1F' },
});
