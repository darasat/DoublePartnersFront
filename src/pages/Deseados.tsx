import React, { useEffect, useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonAlert, IonRefresher, IonRefresherContent } from '@ionic/react';
import { useIonViewWillEnter } from '@ionic/react';
import localforage from 'localforage';

interface Producto {
  id: number;
  title: string;
  // Add other properties as needed
}

const Tab2: React.FC = () => {
  const [wishlist, setWishlist] = useState<Producto[]>([]);
  const [allProducts, setAllProducts] = useState<Producto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);

  // Function to fetch all products from the API
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

  // Load wishlist from localforage
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

  // Use the hook to load the wishlist and products when entering the view
  useIonViewWillEnter(async () => {
    await fetchAllProducts();
    await loadWishlist();
  });

  // Handle refresh
  const handleRefresh = async (event: CustomEvent) => {
    await fetchAllProducts();
    await loadWishlist();
    (event.target as HTMLIonRefresherElement).complete();
  };

  // Handle closing the error alert
  const handleCloseError = () => {
    setError(null);
  };

  // Handle user interaction with wishlist
  const handleUserInteraction = () => {
    setHasInteracted(true);
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
              <IonItem key={producto.id} onClick={handleUserInteraction}>
                <IonLabel>{producto.title}</IonLabel>
              </IonItem>
            ))
          )}
        </IonList>

        {/* Alert to show errors */}
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
