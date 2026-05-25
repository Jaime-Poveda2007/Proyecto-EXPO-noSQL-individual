import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from "react-native";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db, auth } from "../../firebase/firebaseConfig";

const AIC_BASE = "https://api.artic.edu/api/v1";
const IMG_BASE = "https://www.artic.edu/iiif/2";

const CATEGORIAS = [
  { id: 1, nombre: "Pintura", query: "painting" },
  { id: 2, nombre: "Escultura", query: "sculpture" },
  { id: 3, nombre: "Fotografia", query: "photography" },
  { id: 4, nombre: "Impresionismo", query: "impressionism" },
  { id: 5, nombre: "Arte Moderno", query: "modern art" },
];

export default function Original() {
  const [obras, setObras] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [categoriaActiva, setCategoriaActiva] = useState("painting");
  const [obraSeleccionada, setObraSeleccionada] = useState(null);
  const uid = auth.currentUser?.uid;

  useEffect(() => { buscarPorCategoria(categoriaActiva); }, [categoriaActiva]);
  useEffect(() => { if (!uid) return; cargarFavoritos(); }, [uid]);

  const buscarPorCategoria = async (query) => {
    setCargando(true);
    try {
      const url = `${AIC_BASE}/artworks/search?q=${encodeURIComponent(query)}&limit=12&fields=id,title,artist_display,image_id,date_display,medium_display,dimensions`;
      const res = await fetch(url);
      const json = await res.json();
      setObras(json.data?.filter(o => o.image_id) || []);
    } catch (e) { console.error(e); }
    finally { setCargando(false); }
  };

  const cargarFavoritos = async () => {
    try {
      const snap = await getDoc(doc(db, "usuarios", uid));
      if (snap.exists()) setFavoritos(snap.data().favoritos_obras || []);
    } catch (e) { console.error(e); }
  };

// Bug 1: convertir siempre a string al comparar y guardar
const toggleFavorito = async (obraId) => {
  if (!uid) return;
  const idStr = String(obraId); // ← conversión clave
  const esFavorito = favoritos.includes(idStr);
  setFavoritos(prev => esFavorito ? prev.filter(id => id !== idStr) : [...prev, idStr]);
  try {
    const docRef = doc(db, "usuarios", uid);
    await updateDoc(docRef, {
      favoritos_obras: esFavorito ? arrayRemove(idStr) : arrayUnion(idStr)
    });
  } catch (e) {
    setFavoritos(prev => esFavorito ? [...prev, idStr] : prev.filter(id => id !== idStr));
    Alert.alert("Error", "No se pudo actualizar favoritos");
  }
};

if (obraSeleccionada) {
  const img = `${IMG_BASE}/${obraSeleccionada.image_id}/full/800,/0/default.jpg`;
  const esFav = favoritos.includes(String(obraSeleccionada.id));
  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.btnVolver} onPress={() => setObraSeleccionada(null)}>
        <Text style={styles.btnVolverTexto}>← Volver</Text>
      </TouchableOpacity>
      <Image source={{ uri: img }} style={styles.imagenGrande} resizeMode="contain" />
      <View style={styles.detalleContainer}>
        <Text style={styles.tituloDetalle}>{obraSeleccionada.title}</Text>
        <Text style={styles.artistaDetalle}>{obraSeleccionada.artist_display}</Text>
        <Text style={styles.fechaDetalle}>{obraSeleccionada.date_display}</Text>

        {/* ↓ Aquí el cambio: se agregó el estilo condicional al Text */}
        <TouchableOpacity
          style={[styles.btnFav, esFav && styles.btnFavActivo]}
          onPress={() => toggleFavorito(obraSeleccionada.id)}
        >
          <Text style={[styles.btnFavTexto, esFav && styles.btnFavTextoActivo]}>
            {esFav ? "Quitar de favoritos" : "Agregar a favoritos"}
          </Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Galeria por Categoria</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categorias}>
        {CATEGORIAS.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.btnCategoria, categoriaActiva === cat.query && styles.btnCategoriaActivo]}
            onPress={() => setCategoriaActiva(cat.query)}
          >
            <Text style={[styles.txtCategoria, categoriaActiva === cat.query && styles.txtCategoriaActivo]}>
              {cat.nombre}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {cargando ? (
        <View style={styles.centrado}><ActivityIndicator size="large" color="#8B4513" /></View>
      ) : (
        <FlatList
          data={obras}
          numColumns={2}
          columnWrapperStyle={styles.fila}
          keyExtractor={item => String(item.id)}
          renderItem={({ item }) => {
            const imgUrl = `${IMG_BASE}/${item.image_id}/full/400,/0/default.jpg`;
            const esFav = favoritos.includes(String(item.id));
            return (
              <TouchableOpacity style={styles.tarjeta} onPress={() => setObraSeleccionada(item)} activeOpacity={0.8}>
                <Image source={{ uri: imgUrl }} style={styles.imagen} resizeMode="cover" />
                <TouchableOpacity style={styles.favIcono} onPress={() => toggleFavorito(item.id)}>
                  <Text style={styles.favTexto}>{esFav ? "♥" : "♡"}</Text>
                </TouchableOpacity>
                <View style={styles.info}>
                  <Text style={styles.tituloObra} numberOfLines={2}>{item.title}</Text>
                  <Text style={styles.artista} numberOfLines={1}>{item.artist_display?.split("\n")[0]}</Text>
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
  container: { flex: 1, backgroundColor: '#FFF8F0', padding: 12 },
  titulo: { fontSize: 22, color: '#3D2B1F', fontWeight: 'bold', textAlign: 'center', marginBottom: 12, marginTop: 10 },
  categorias: { marginBottom: 12 },
  btnCategoria: { paddingHorizontal: 16, paddingVertical: 8, marginRight: 8, borderRadius: 20, borderWidth: 1, borderColor: '#8B4513', backgroundColor: '#fff' },
  btnCategoriaActivo: { backgroundColor: '#8B4513', borderColor: '#8B4513' },
  txtCategoria: { color: '#8B4513', fontSize: 13, fontWeight: '500' },
  txtCategoriaActivo: { color: '#fff' },
  centrado: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  fila: { justifyContent: 'space-between', paddingHorizontal: 4, marginBottom: 12 },
  tarjeta: { backgroundColor: '#fff', width: '48%', borderRadius: 10, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 },
  imagen: { width: '100%', height: 140 },
  favIcono: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 16, width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  favTexto: { fontSize: 18, color: '#8B4513' },
  info: { padding: 8 },
  tituloObra: { fontSize: 13, fontWeight: 'bold', color: '#3D2B1F', marginBottom: 3 },
  artista: { fontSize: 11, color: '#8B4513' },
  btnVolver: { margin: 16, padding: 10 },
  btnVolverTexto: { color: '#8B4513', fontSize: 16, fontWeight: '600' },
  imagenGrande: { width: '100%', height: 320, backgroundColor: '#f0e8df' },
  detalleContainer: { padding: 20 },
  tituloDetalle: { fontSize: 22, fontWeight: 'bold', color: '#3D2B1F', marginBottom: 8 },
  artistaDetalle: { fontSize: 15, color: '#8B4513', marginBottom: 6 },
  fechaDetalle: { fontSize: 13, color: '#999', marginBottom: 20 },
  btnFav: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#8B4513', padding: 14, borderRadius: 10, alignItems: 'center' },
  btnFavActivo: { backgroundColor: '#8B4513' },
  btnFavTexto: { color: '#8B4513', fontWeight: 'bold', fontSize: 15 },
  btnFavTextoActivo: { color: '#fff' },  
});
