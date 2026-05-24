// src/componentes/Home.js

import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  Image, ActivityIndicator, TextInput, TouchableOpacity
} from 'react-native';


const AIC_BASE = 'https://api.artic.edu/api/v1';

const IMG_BASE = 'https://www.artic.edu/iiif/2';

export default function Home() {
  const [obras, setObras] = useState([]);          
  const [cargando, setCargando] = useState(true);  
  const [busqueda, setBusqueda] = useState('');    
  const [pagina, setPagina] = useState(1);        

  
  useEffect(() => {
    obtenerObras();
  }, [pagina]);

  const obtenerObras = async () => {
    setCargando(true);
    try {
      const url = `${AIC_BASE}/artworks?page=${pagina}&limit=20&fields=id,title,artist_display,image_id,date_display,medium_display`;
      
     
      const res = await fetch(url);
      
    
      const json = await res.json();
      

      const obrasConImagen = json.data.filter(obra => obra.image_id);
      
      setObras(obrasConImagen);
    } catch (error) {
      console.error('Error al obtener obras:', error);
    } finally {
      setCargando(false);
    }
  };

  const obrasFiltradas = obras.filter(obra =>
    obra.title?.toLowerCase().includes(busqueda.toLowerCase()) ||
    obra.artist_display?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const renderObra = ({ item }) => {
    const imagenUrl = `${IMG_BASE}/${item.image_id}/full/400,/0/default.jpg`;

    return (
      <View style={styles.tarjeta}>
        <Image
          source={{ uri: imagenUrl }}
          style={styles.imagen}
          resizeMode="cover"
        />
        <View style={styles.info}>
          <Text style={styles.tituloObra} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.artista} numberOfLines={1}>
            {item.artist_display?.split('\n')[0] || 'Artista desconocido'}
          </Text>
          <Text style={styles.fecha}>{item.date_display}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Colección AIC</Text>
      <TextInput
        style={styles.buscador}
        placeholder="Buscar obra o artista..."
        value={busqueda}
        onChangeText={setBusqueda}
        placeholderTextColor="#999"
      />
      {cargando ? (
        <View style={styles.centrado}>
          <ActivityIndicator size="large" color="#8B4513" />
          <Text style={{ color: '#8B4513', marginTop: 10 }}>Cargando obras...</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={obrasFiltradas}          
            renderItem={renderObra}        
            keyExtractor={item => String(item.id)}
            numColumns={2}                 
            columnWrapperStyle={styles.fila} 
            showsVerticalScrollIndicator={false}
          />
          <View style={styles.paginacion}>
            <TouchableOpacity
              style={[styles.btnPag, pagina === 1 && styles.btnDisabled]}
              onPress={() => setPagina(p => p - 1)}
              disabled={pagina === 1}
            >
              <Text style={styles.btnPagTexto}>← Anterior</Text>
            </TouchableOpacity>

            <Text style={styles.numPag}>Página {pagina}</Text>

            <TouchableOpacity
              style={styles.btnPag}
              onPress={() => setPagina(p => p + 1)}
            >
              <Text style={styles.btnPagTexto}>Siguiente →</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
    paddingTop: 50, 
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3D2B1F',
    textAlign: 'center',
    marginBottom: 12,
  },
  buscador: {
    margin: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D4A88C',
    borderRadius: 10,
    backgroundColor: '#fff',
    fontSize: 15,
  },
  centrado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fila: {
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  tarjeta: {
    backgroundColor: '#fff',
    width: '48%',
    marginBottom: 12,
    borderRadius: 10,
    overflow: 'hidden', 
    elevation: 3,      
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imagen: {
    width: '100%',
    height: 140,
    backgroundColor: '#f0e8df', 
  },
  info: {
    padding: 8,
  },
  tituloObra: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#3D2B1F',
    marginBottom: 3,
  },
  artista: {
    fontSize: 11,
    color: '#8B4513',
    marginBottom: 2,
  },
  fecha: {
    fontSize: 10,
    color: '#999',
  },
  paginacion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#D4A88C',
    backgroundColor: '#fff',
  },
  btnPag: {
    backgroundColor: '#8B4513',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  btnDisabled: {
    backgroundColor: '#ccc',
  },
  btnPagTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  numPag: {
    color: '#3D2B1F',
    fontWeight: 'bold',
  },
});