import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonAlert,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/react';
import { useIonViewWillEnter } from '@ionic/react';
import localforage from 'localforage';

// Definimos la interfaz para los productos
interface Producto {
  id: number;
  title: string;
}

const Tab2: React.FC = () => {
  const [wishlist, setWishlist] = useState<Producto[]>([]);
  const [allProducts, setAllProducts] = useState<Producto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);

  // Función para obtener todos los productos desde la API
  const fetchAllProducts = async () => {
    try {
      const response = await fetch('https://api.escuelajs.co/api/v1/products');
      if (!response.ok) {
        throw new Error(`Error ${response.status}: No se pudieron cargar los productos.`);
      }
      const data: Producto[] = await response.json();
      setAllProducts(data);
    } catch (error: any) {
      console.error('Error al obtener los productos:', error);
      setError('No se pudieron cargar los productos.');
    }
  };

  // Cargar la lista de deseos desde localforage
  const loadWishlist = async () => {
    try {
      const savedWishlist: Producto[] = (await localforage.getItem('wishlist')) || [];
      const updatedWishlist = savedWishlist.filter(product => allProducts.some(p => p.id === product.id));
      setWishlist(updatedWishlist);
      setError(null);
    } catch (error: any) {
      console.error('Error al cargar la lista de deseos:', error);
      setError('No se pudo cargar la lista de deseos.');
    }
  };

  // Usar el hook para cargar la lista de deseos y productos al entrar a la vista
  useIonViewWillEnter(() => {
    // Cargar datos de forma asíncrona
    const loadData = async () => {
      await fetchAllProducts();
      await loadWishlist();
    };
    loadData();
  });

  // Manejar el refresco de la lista
  const handleRefresh = async (event: CustomEvent) => {
    await fetchAllProducts();
    await loadWishlist();
    (event.target as HTMLIonRefresherElement).complete();
  };

  // Manejar el cierre de la alerta de error
  const handleCloseError = () => {
    setError(null);
  };

  // Manejar la interacción del usuario con la lista de deseos
  const handleUserInteraction = () => {
    setHasInteracted(true);
  };

  // Agregar producto a la lista de deseos
  const addToWishlist = async (producto: Producto) => {
    try {
      const savedWishlist: Producto[] = (await localforage.getItem('wishlist')) || [];
      if (!savedWishlist.some(item => item.id === producto.id)) {
        savedWishlist.push(producto);
        await localforage.setItem('wishlist', savedWishlist);
        loadWishlist(); // Actualiza la lista de deseos después de agregar
      }
    } catch (error) {
      console.error('Error al agregar a la lista de deseos:', error);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Productos Deseados</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent pullingText="Desliza hacia abajo para refrescar" refreshingText="Refrescando..."></IonRefresherContent>
        </IonRefresher>
        <IonList>
          {wishlist.length === 0 && hasInteracted ? (
            <IonItem>
              <IonLabel>No tienes productos en tu lista de deseados.</IonLabel>
            </IonItem>
          ) : (
            wishlist.map((producto) => (
              <IonItem key={producto.id} onClick={() => handleUserInteraction()}>
                <IonLabel>{producto.title}</IonLabel>
              </IonItem>
            ))
          )}
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

export default Tab2;
