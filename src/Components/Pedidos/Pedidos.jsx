import React, { useEffect, useState } from 'react';
import { db } from '../../firebaseConfig'; // Asegúrate de importar tu configuración de Firebase
import { collection, onSnapshot, updateDoc, doc } from 'firebase/firestore';
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
      setPedidos(reordenarPedidos(pedidosData));
    });

    // Limpiar la suscripción al desmontar el componente
    return () => unsubscribe();
  }, []);

  // Función para reordenar los pedidos
  const reordenarPedidos = (pedidos) => {
    return pedidos.sort((a, b) => b.prioridad - a.prioridad); // Prioritarios primero
  };

  const handlePrioridadClick = async (id) => {
    try {
      const pedidoRef = doc(db, 'pedidos', id);
      const pedidoActual = pedidos.find(pedido => pedido.id === id);

      // Actualiza la prioridad en Firestore
      await updateDoc(pedidoRef, { prioridad: !pedidoActual.prioridad });

      // Actualiza la lista local de pedidos
      const pedidosActualizados = pedidos.map(pedido =>
        pedido.id === id ? { ...pedido, prioridad: !pedido.prioridad } : pedido
      );
      setPedidos(reordenarPedidos(pedidosActualizados));
    } catch (error) {
      console.error('Error al actualizar la prioridad:', error);
    }
  };

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
              <td id='pedidos-prioridad'>
                <button
                  style={{
                    backgroundColor: pedido.prioridad ? 'red' : 'transparent',
                    color: pedido.prioridad ? 'white' : 'black',
                  }}
                  onClick={() => handlePrioridadClick(pedido.id)}
                >
                  <IonIcon icon={alertOutline} />
                </button>
              </td>
              <td>
                {pedido.timestamp
                  ? new Date(pedido.timestamp.seconds * 1000).toLocaleTimeString()
                  : 'Sin registro'}
              </td>
              <td>
                {/* Columna Tiempo queda vacía */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Pedidos;
