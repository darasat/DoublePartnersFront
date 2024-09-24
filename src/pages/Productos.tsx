
import React, { useEffect, useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonButton, IonAlert } from '@ionic/react';
import localforage from 'localforage';import ExploreContainer from '../components/ExploreContainer';
import './Productos.css';
// src/pages/TabProductos.tsx

interface Producto {
  id: number;
  title: string;
  // Agrega otras propiedades según el objeto de producto que recibes de la API
}

const Tab1: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [wishlist, setWishlist] = useState<Producto[]>([]);
  const [error, setError] = useState<string | null>(null); // Estado para manejar errores

  // Obtener productos desde la API pública de Platzi
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        //const response = await fetch('https://fakeapi.platzi.com/products');
        const response = await fetch ('https://api.escuelajs.co/api/v1/products');

        // Verificar si la respuesta es exitosa
        if (!response.ok) {
          throw new Error(`Error ${response.status}: No se pudieron cargar los productos.`);
        }

        const data: Producto[] = await response.json();
        setProductos(data);
      } catch (error: any) {
        console.error('Error al obtener los productos:', error);
        setError(error.message); // Establecer el mensaje de error
      }
    };

    fetchProducts();
  }, []);

  // Cargar la lista de deseos desde localforage
  useEffect(() => {
    const loadWishlist = async () => {
      try {
        const savedWishlist: Producto[] = (await localforage.getItem('wishlist')) || [];
        setWishlist(savedWishlist);
      } catch (error: any) {
        console.error('Error al cargar la lista de deseos:', error);
        setError('No se pudo cargar la lista de deseos.'); // Establecer el mensaje de error
      }
    };

    loadWishlist();
  }, []);

  // Agregar o quitar un producto de la lista de deseos
  const handleAddToWishlist = async (producto: Producto) => {
    try {
      let updatedWishlist: Producto[];
      if (wishlist.some((item) => item.id === producto.id)) {
        // Si ya está en la wishlist, lo quitamos
        updatedWishlist = wishlist.filter((item) => item.id !== producto.id);
      } else {
        // Si no está, lo agregamos
        updatedWishlist = [...wishlist, producto];
      }
      setWishlist(updatedWishlist);
      await localforage.setItem('wishlist', updatedWishlist); // Persistir cambios
    } catch (error: any) {
      console.error('Error al guardar la lista de deseos:', error);
      setError('No se pudo guardar la lista de deseos.'); // Establecer el mensaje de error
    }
  };

  // Manejar el cierre de la alerta de error
  const handleCloseError = () => {
    setError(null);
  };
  
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Productos</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          {productos.map((producto) => (
            <IonItem key={producto.id}>
              <IonLabel>{producto.title}</IonLabel>
              <IonButton
                slot="end"
                color={wishlist.some((item) => item.id === producto.id) ? "medium" : "primary"}
                onClick={() => handleAddToWishlist(producto)}
              >
                {wishlist.some((item) => item.id === producto.id) ? "En Deseados" : "Agregar a Deseados"}
              </IonButton>
            </IonItem>
          ))}
        </IonList>

        {/* Alerta para mostrar errores */}
        {error && (
          <IonAlert
            isOpen={!!error}
            onDidDismiss={handleCloseError}
            header={'Error'}
            message={error}
            buttons={['Aceptar']}
          />
        )}
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
