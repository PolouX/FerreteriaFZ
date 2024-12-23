import React, { useEffect, useState } from 'react';
import { db } from '../../firebaseConfig'; // Asegúrate de importar tu configuración de Firebase
import { collection, onSnapshot } from 'firebase/firestore';
import { IonIcon } from "@ionic/react";
import { alertOutline } from 'ionicons/icons';
import "./Pedidos.css";

const Pedidos = () => {
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    // Referencia a la colección 'pedidos'
    const pedidosRef = collection(db, 'pedidos');

    // Escuchar los cambios en la colección en tiempo real
    const unsubscribe = onSnapshot(pedidosRef, (snapshot) => {
      const pedidosData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPedidos(pedidosData);
    });

    // Limpiar la suscripción al desmontar el componente
    return () => unsubscribe();
  }, []);

  return (
    <div className="pedidos">

      <table>
        <thead>
          <tr>
            <th>Pedido</th>
            <th>Nombre</th>
            <th id='pedidos-prioridad'>Prioridad</th>
            <th>Llegada</th>
            <th id='pedidos-time'>Tiempo</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.map((pedido) => (
            <tr key={pedido.id}>
              <td>{pedido.numeroPedido}</td>
              <td>{pedido.nombreCliente}</td>
              <td id='pedidos-prioridad'><button><IonIcon icon={alertOutline} /></button></td>
              <td>{pedido.salida}</td>
              <td>{pedido.salida}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Pedidos;
