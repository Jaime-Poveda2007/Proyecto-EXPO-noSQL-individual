// src/componentes/Original.js
// Función Original: Galería de Favoritos con guardado en Firestore

import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, Image,
  TouchableOpacity, ActivityIndicator, Alert, ScrollView
} from 'react-native';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db, auth } from '../../firebase/firebaseConfig';

const AIC_BASE = 'https://api.artic.edu/api/v1';
const IMG_BASE = 'https://www.artic.edu/iiif/2';

const CATEGORIAS = [
  { id: 1, nombre: 'Pintura', query: 'painting' },
  { id: 2, nombre: 'Escultura', query: 'sculpture' },
  { id: 3, nombre: 'Fotografía', query: 'photography' },
  { id: 4, nombre: 'Impresionismo', query: 'impressionism' },
  { id: 5, nombre: 'Arte Moderno', query: 'modern art' },
];

export default function Original() {
  const [obras, setObras] = useState([]);
  const [favoritos, setFavoritos] = useState([]); 
  const [cargando, setCargando] = useState(true);
  const [categoriaActiva, setCategoriaActiva] = useState('painting');
  const [obraSeleccionada, setObraSeleccionada] = useState(null); 

  const uid = auth.currentUser?.uid; 


  useEffect(() => {
    buscarPorCategoria(categoriaActiva);
  }, [categoriaActiva]);


  useEffect(() => {
    if (!uid) return;
    cargarFavoritos();
  }, [uid]);

  const buscarPorCategoria = async (query) => {
    setCargando(true);
    try {
      const url = `${AIC_BASE}/artworks/search?q=${encodeURIComponent(query)}&limit=12&fields=id,title,artist_display,image_id,date_display,medium_display,dimensions`;
      const res = await fetch(url);
      const json = await res.json();
      const conImagen = json.data?.filter(o => o.image_id) || [];
      setObras(conImagen);
    } catch (e) {
      console.error(e);
    } finally {
      setCargando(false);
    }
  };

  const cargarFavoritos = async () => {
    try {
      const docRef = doc(db, 'usuarios', uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setFavoritos(snap.data().favoritos_obras || []);
      }
    } catch (e) {
      console.error('Error cargando favoritos:', e);
    }
  };

  const toggleFavorito = async (obraId) => {
    if (!uid) return;
    
    const esFavorito = favoritos.includes(obraId);
    
    if (esFavorito) {
      setFavoritos(prev => prev.filter(id => id !== obraId));
    } else {
      setFavoritos(prev => [...prev, obraId]);
    }

    try {
      const docRef = doc(db, 'usuarios', uid);
      
      if (esFavorito) {
        await updateDoc(docRef, { favoritos_obras: arrayRemove(obraId) });
      } else {

        await updateDoc(docRef, { favoritos_obras: arrayUnion(obraId) });
      }
    } catch (e) {
    
      if (esFavorito) {
        setFavoritos(prev => [...prev, obraId]);
      } else {
        setFavoritos(prev => prev.filter(id => id !== obraId));
      }
      Alert.alert('Error', 'No se pudo actualizar favoritos');
    }
  };

  if (obraSeleccionada) {
    const img = `${IMG_BASE}/${obraSeleccionada.image_id}/full/800,/0/default.jpg`;
    const esFav = favoritos.includes(obraSeleccionada.id);

    return (
      <ScrollView style={styles.container}>
        <TouchableOpacity
          style={styles.btnVolver}
          onPress={() => setObraSeleccionada(null)}
        >
          <Text style={styles.btnVolverTexto}>← Volver</Text>
        </TouchableOpacity>

        <Image source={{ uri: img }} style={styles.imagenGrande} resizeMode="contain" />

        <View style={styles.detalleContainer}>
          <Text style={styles.tituloDetalle}>{obraSeleccionada.title}</Text>
          <Text style={styles.artistaDetalle}>{obraSeleccionada.artist_display}</Text>
          <Text style={styles.fechaDetalle}>{obraSeleccionada.date_display}</Text>
          
          {obraSeleccionada.medium_display ? (
            <Text style={styles.medio}>Técnica: {obraSeleccionada.medium_display}</Text>
          ) : null}

          {obraSeleccionada.dimensions ? (
            <Text style={styles.dimensiones}>Dimensiones: {obraSeleccionada.dimensions}</Text>
          ) : null}

          <TouchableOpacity
            style={[styles.btnFav, esFav && styles.btnFavActivo]}
            onPress={() => toggleFavorito(obraSeleccionada.id)}
          >
            <Text style={styles.btnFavTexto}>
              {esFav ? '❤️ Quitar de favoritos' : '🤍 Agregar a favoritos'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

 
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Galería por Categoría</Text>


      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categorias}
      >
        {CATEGORIAS.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.btnCategoria,
              categoriaActiva === cat.query && styles.btnCategoriaActivo
            ]}
            onPress={() => setCategoriaActiva(cat.query)}
          >
            <Text style={[
              styles.txtCategoria,
              categoriaActiva === cat.query && styles.txtCategoriaActivo
            ]}>
              {cat.nombre}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {cargando ? (
        <View style={styles.centrado}>
          <ActivityIndicator size="large" color="#8B4513" />
        </View>
      ) : (
        <FlatList
          data={obras}
          numColumns={2}
          columnWrapperStyle={styles.fila}
          keyExtractor={item => String(item.id)}
          renderItem={({ item }) => {
            const imgUrl = `${IMG_BASE}/${item.image_id}/full/400,/0/default.jpg`;
            const esFav = favoritos.includes(item.id);

            return (
              <TouchableOpacity
                style={styles.tarjeta}
                onPress={() => setObraSeleccionada(item)}
                activeOpacity={0.8}
              >
                <Image source={{ uri: imgUrl }} style={styles.imagen} resizeMode="cover" />
                
                {/* Botón de favorito sobre la imagen */}
                <TouchableOpacity
                  style={styles.favIcono}
                  onPress={() => toggleFavorito(item.id)}
                >
                  <Text style={{ fontSize: 20 }}>{esFav ? '❤️' : '🤍'}</Text>
                </TouchableOpacity>

                <View style={styles.info}>
                  <Text style={styles.tituloObra} numberOfLines={2}>{item.title}</Text>
                  <Text style={styles.artista} numberOfLines={1}>
                    {item.artist_display?.split('\n')[0]}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F0', paddingTop: 50 },
  titulo: { fontSize: 20, fontWeight: 'bold', color: '#3D2B1F', textAlign: 'center', marginBottom: 10 },
  categorias: { paddingHorizontal: 10, marginBottom: 10, flexGrow: 0 },
  btnCategoria: {
    paddingHorizontal: 16, paddingVertical: 8, marginRight: 8,
    borderRadius: 20, borderWidth: 1, borderColor: '#D4A88C', backgroundColor: '#fff',
  },
  btnCategoriaActivo: { backgroundColor: '#8B4513', borderColor: '#8B4513' },
  txtCategoria: { color: '#8B4513', fontSize: 13, fontWeight: '500' },
  txtCategoriaActivo: { color: '#fff' },
  centrado: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  fila: { justifyContent: 'space-between', paddingHorizontal: 10 },
  tarjeta: {
    backgroundColor: '#fff', width: '48%', marginBottom: 12,
    borderRadius: 10, overflow: 'hidden', elevation: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4,
  },
  imagen: { width: '100%', height: 140, backgroundColor: '#f0e8df' },
  favIcono: { position: 'absolute', top: 8, right: 8 },
  info: { padding: 8 },
  tituloObra: { fontSize: 12, fontWeight: 'bold', color: '#3D2B1F', marginBottom: 2 },
  artista: { fontSize: 10, color: '#8B4513' },
  // Estilos para la vista detalle
  btnVolver: { margin: 16, padding: 10 },
  btnVolverTexto: { color: '#8B4513', fontSize: 16, fontWeight: 'bold' },
  imagenGrande: { width: '100%', height: 300, backgroundColor: '#f0e8df' },
  detalleContainer: { padding: 20 },
  tituloDetalle: { fontSize: 22, fontWeight: 'bold', color: '#3D2B1F', marginBottom: 8 },
  artistaDetalle: { fontSize: 16, color: '#8B4513', marginBottom: 4 },
  fechaDetalle: { fontSize: 14, color: '#999', marginBottom: 12 },
  medio: { fontSize: 13, color: '#555', marginBottom: 4, fontStyle: 'italic' },
  dimensiones: { fontSize: 13, color: '#555', marginBottom: 20 },
  btnFav: {
    backgroundColor: '#f0e8df', padding: 14, borderRadius: 10,
    alignItems: 'center', borderWidth: 1, borderColor: '#D4A88C',
  },
  btnFavActivo: { backgroundColor: '#FFE4E1', borderColor: '#FF6B6B' },
  btnFavTexto: { fontSize: 16, fontWeight: 'bold', color: '#3D2B1F' },
});