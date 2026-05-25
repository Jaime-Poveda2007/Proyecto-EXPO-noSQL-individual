touchable// src/componentes/Perfil.js

import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View, Text, TextInput, TouchableOpacity,
  Alert, StyleSheet, ScrollView, ActivityIndicator
} from 'react-native';
import { auth, db } from '../../firebase/firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default function Perfil() {
  const [nombre, setNombre] = useState('');
  const [fecha, setFecha] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [favoritos, setFavoritos] = useState(0);
  const [cargando, setCargando] = useState(true);
  const uid = auth.currentUser?.uid;

  useFocusEffect(
    useCallback(() => {
      if (!uid) return;
      cargarPerfil();
    }, [uid])
  );

  const cargarPerfil = async () => {
    try {
      const docRef = doc(db, 'usuarios', uid);
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        const data = snap.data();
        setNombre(data.nombre || '');
        setFecha(data.fecha || '');
        setTelefono(data.telefono || '');
        setCorreo(data.correo || '');
        setFavoritos(data.favoritos_obras?.length || 0);
      }
    } catch (e) {
      Alert.alert('Error', 'No se pudo cargar el perfil');
    } finally {
      setCargando(false);
    }
  };

  const guardarCambios = async () => {
    try {
      const docRef = doc(db, 'usuarios', uid);
      await updateDoc(docRef, { nombre, fecha, telefono });
      Alert.alert('✅ Guardado', 'Perfil actualizado correctamente');
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'No se pudo actualizar el perfil');
    }
  };

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#8B4513" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Mi Perfil</Text>

      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <Text style={styles.statNum}>{favoritos}</Text>
          <Text style={styles.statLabel}>Favoritas</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statNum}>🏛️</Text>
          <Text style={styles.statLabel}>AIC Member</Text>
        </View>
      </View>

      <Text style={styles.etiqueta}>Correo electrónico</Text>
      <View style={styles.inputReadOnly}>
        <Text style={styles.textoReadOnly}>{correo}</Text>
      </View>


      <Text style={styles.etiqueta}>Nombre</Text>
      <TextInput
        style={styles.input}
        value={nombre}
        onChangeText={setNombre}
        placeholder="Tu nombre"
      />

      <Text style={styles.etiqueta}>Fecha de nacimiento</Text>
      <TextInput
        style={styles.input}
        value={fecha}
        onChangeText={setFecha}
        placeholder="YYYY-MM-DD"
      />

      <Text style={styles.etiqueta}>Teléfono</Text>
      <TextInput
        style={styles.input}
        value={telefono}
        onChangeText={setTelefono}
        placeholder="Tu teléfono"
        keyboardType="phone-pad"
      />

      <TouchableOpacity style={styles.btnGuardar} onPress={guardarCambios}>
        <Text style={styles.btnGuardarTexto}>Guardar cambios</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F0', paddingTop: 50 },
  centrado: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  titulo: {
    fontSize: 24, fontWeight: 'bold', color: '#3D2B1F',
    textAlign: 'center', marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row', backgroundColor: '#fff', margin: 16,
    borderRadius: 12, padding: 20, elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 3,
    justifyContent: 'center', alignItems: 'center',
  },
  stat: { alignItems: 'center', flex: 1 },
  statNum: { fontSize: 28, fontWeight: 'bold', color: '#8B4513' },
  statLabel: { fontSize: 12, color: '#999', marginTop: 4 },
  statDivider: { width: 1, height: 40, backgroundColor: '#D4A88C' },
  etiqueta: {
    fontSize: 13, color: '#8B4513', fontWeight: '600',
    marginLeft: 16, marginBottom: 4, marginTop: 12,
  },
  input: {
    marginHorizontal: 16, borderWidth: 1, borderColor: '#D4A88C',
    padding: 12, borderRadius: 8, backgroundColor: '#fff', fontSize: 16,
  },
  inputReadOnly: {
    marginHorizontal: 16, borderWidth: 1, borderColor: '#e0d5cd',
    padding: 12, borderRadius: 8, backgroundColor: '#f5f0ec',
  },
  textoReadOnly: { fontSize: 16, color: '#999' },
  btnGuardar: {
    margin: 20, backgroundColor: '#8B4513', padding: 16,
    borderRadius: 10, alignItems: 'center',
  },
  btnGuardarTexto: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});