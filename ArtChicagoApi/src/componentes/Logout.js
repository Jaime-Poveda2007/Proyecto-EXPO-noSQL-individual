// src/componentes/Logout.js

import React, { useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/firebaseConfig';

export default function Logout() {

  useEffect(() => {
    const cerrarSesion = async () => {
      try {
        await signOut(auth);
      } catch (error) {
        console.error('Error al cerrar sesión:', error);
      }
    };

    cerrarSesion();
  }, []); 

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF8F0' }}>
      <ActivityIndicator size="large" color="#8B4513" />
      <Text style={{ marginTop: 15, color: '#8B4513', fontSize: 16 }}>
        Cerrando sesión...
      </Text>
    </View>
  );
}