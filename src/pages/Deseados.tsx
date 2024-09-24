// src/pages/TabWishlist.tsx
import React, { useEffect, useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonAlert, IonRefresher, IonRefresherContent } from '@ionic/react';
import { useIonViewWillEnter } from '@ionic/react'; // Importar el hook necesario
import localforage from 'localforage';

interface Producto {
  id: number;
  title: string;
  // Agrega otras propiedades según el objeto de producto que recibes de la API
}

const Tab2: React.FC = () => {
  const [wishlist, setWishlist] = useState<Producto[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Cargar la lista de deseos desde localforage
  const loadWishlist = async () => {
    try {
      const savedWishlist: Producto[] = (await localforage.getItem('wishlist')) || [];
      setWishlist(savedWishlist);
      setError(null); // Limpiar error al cargar con éxito
    } catch (error: any) {
      console.error('Error al cargar la lista de deseos:', error);
      setError('No se pudo cargar la lista de deseos.'); // Establecer el mensaje de error
    }
  };

  // Usar el hook para cargar la wishlist al entrar a la vista
  useIonViewWillEnter(() => {
    loadWishlist();
  });

  // Manejar el refresco
  const handleRefresh = async (event: CustomEvent) => {
    await loadWishlist(); // Refrescar la wishlist
    (event.target as HTMLIonRefresherElement).complete(); // Completar el refresco
  };

  // Manejar el cierre de la alerta de error
  const handleCloseError = () => {
    setError(null);
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
          {wishlist.length === 0 ? (
            <IonItem>
              <IonLabel>No tienes productos en tu lista de deseados.</IonLabel>
            </IonItem>
          ) : (
            wishlist.map((producto) => (
              <IonItem key={producto.id}>
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
