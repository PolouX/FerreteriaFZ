import React, { useEffect, useState } from 'react';
import { db } from '../../firebaseConfig';
import { collection, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { IonIcon } from "@ionic/react";
import { alertOutline } from 'ionicons/icons';
import "./Pedidos.css";

const Pedidos = () => {
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    const pedidosRef = collection(db, 'pedidos');

    const unsubscribe = onSnapshot(pedidosRef, (snapshot) => {
      const pedidosData = snapshot.docs.map((doc) => {
        const pedido = { id: doc.id, ...doc.data() };

        // Validar si existe 'zonas' y tiene al menos un elemento
        if (pedido.historialEstados && pedido.historialEstados.length > 0) {
          const lastZona = pedido.historialEstados[pedido.historialEstados.length - 1];

          if (lastZona.timestampInicio) {
            const lastZonaTimestamp = lastZona.timestampInicio.toMillis(); // Convertir a milisegundos
            const tiempo = Math.floor((Date.now() - lastZonaTimestamp) / 60000);
            pedido.tiempo = tiempo >= 0 ? tiempo : 'N/A';
          } else {
            pedido.tiempo = 'N/A'; // Si no tiene timestampInicio
          }
        } else {
          pedido.tiempo = 'N/A'; // Si no tiene historialEstados
        }

        return pedido;
      });

      setPedidos(reordenarPedidos(pedidosData));
    });

    return () => unsubscribe();
  }, []);

  // Actualizar minutos cada 60 segundos automáticamente
  useEffect(() => {
    const interval = setInterval(() => {
      setPedidos((prevPedidos) =>
        prevPedidos.map((pedido) => {
          if (pedido.historialEstados && pedido.historialEstados.length > 0) {
            const lastZona = pedido.historialEstados[pedido.historialEstados.length - 1];

            if (lastZona.timestampInicio) {
              const lastZonaTimestamp = lastZona.timestampInicio.toMillis();
              const tiempo = Math.floor((Date.now() - lastZonaTimestamp) / 60000);
              return { ...pedido, tiempo: tiempo >= 0 ? tiempo : 'N/A' };
            }
          }
          return { ...pedido, tiempo: 'N/A' };
        })
      );
    }, 60000); // Actualiza cada minuto

    return () => clearInterval(interval);
  }, []);

  const reordenarPedidos = (pedidos) => {
    return pedidos.sort((a, b) => b.prioridad - a.prioridad);
  };

  const handlePrioridadClick = async (id) => {
    try {
      const pedidoRef = doc(db, 'pedidos', id);
      const pedidoActual = pedidos.find((pedido) => pedido.id === id);

      await updateDoc(pedidoRef, { prioridad: !pedidoActual.prioridad });

      const pedidosActualizados = pedidos.map((pedido) =>
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
            <th id="pedidos-prioridad">Prioridad</th>
            <th>Llegada</th>
            <th id="pedidos-time">Tiempo (min)</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.map((pedido) => (
            <tr key={pedido.id}>
              <td>{pedido.numeroPedido}</td>
              <td>{pedido.nombreCliente}</td>
              <td id="pedidos-prioridad">
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
                  ? new Date(pedido.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : 'Sin registro'}
              </td>
              <td>{pedido.tiempo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Pedidos;
