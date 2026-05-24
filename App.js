import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/firebaseConfig';
import Login from './src/componentes/Login';
import Registro from './src/componentes/Registro';
import Home from './src/componentes/Home';
import Original from './src/componentes/Original';
import Perfil from './src/componentes/Perfil';
import Logout from './src/componentes/Logout';

const Tab = createBottomTabNavigator();

const icono = (nombre, focused) => {
  const iconos = {
    Home:     focused ? '🏠' : '🏡',
    Galeria:  focused ? '🖼' : '🖼',
    Perfil:   focused ? '👤' : '👤',
    Salir:    focused ? '🚪' : '🚪',
    Login:    focused ? '🔑' : '🔑',
    Registro: focused ? '📝' : '📝',
  };
  return <Text style={{ fontSize: 20 }}>{iconos[nombre] || '•'}</Text>;
};

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuario(user);
      setCargando(false);
    });
    return unsubscribe;
  }, []);

  if (cargando) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#8B4513" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused }) => icono(route.name, focused),
          tabBarActiveTintColor: '#8B4513',
          tabBarInactiveTintColor: '#999',
          tabBarStyle: { backgroundColor: '#FFF8F0', borderTopColor: '#D4A88C' },
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        })}
      >
        {usuario ? (
          <>
            <Tab.Screen name="Home"    component={Home}     />
            <Tab.Screen name="Galeria" component={Original} />
            <Tab.Screen name="Perfil"  component={Perfil}   />
            <Tab.Screen name="Salir"   component={Logout}   />
          </>
        ) : (
          <>
            <Tab.Screen name="Login"    component={Login}    />
            <Tab.Screen name="Registro" component={Registro} />
          </>
        )}
      </Tab.Navigator>
    </NavigationContainer>
  );
}
