import React, { useEffect, useState } from 'react';
import { db } from '../../firebaseConfig'; // Importar configuración de Firebase
import { collection, onSnapshot, query, where, updateDoc, doc, getDocs } from 'firebase/firestore';
import './Credito.css';

const Credito = () => {
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    const pedidosRef = collection(db, 'pedidos');

    // Filtrar solo los pedidos con 'credito: true'
    const pedidosCreditoQuery = query(pedidosRef, where('credito', '==', true));

    // Escuchar los cambios en la colección en tiempo real
    const unsubscribe = onSnapshot(pedidosCreditoQuery, (snapshot) => {
      const pedidosData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        tiempo: calcularTiempo(doc.data().timestamp), // Calcular el tiempo inicial
      }));
      setPedidos(pedidosData);
    });

    // Actualizar minutos automáticamente cada 60 segundos
    const interval = setInterval(() => {
      setPedidos((prevPedidos) =>
        prevPedidos.map((pedido) => ({
          ...pedido,
          tiempo: calcularTiempo(pedido.timestamp),
        }))
      );
    }, 60000);

    // Limpiar la suscripción y el intervalo al desmontar el componente
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  // Calcular el tiempo en minutos desde la creación del pedido
  const calcularTiempo = (timestamp) => {
    if (!timestamp) return 'Sin datos';
    const tiempoCreado = timestamp.toDate(); // Convertir el timestamp
    const ahora = new Date(); // Hora actual
    const diferencia = Math.floor((ahora - tiempoCreado) / (1000 * 60)); // Diferencia en minutos
    return `${diferencia} minutos`;
  };

  // Cargar productos desde la subcolección
  const cargarProductos = async (pedidoId) => {
    const productosCollectionRef = collection(db, `pedidos/${pedidoId}/productos`);
    const snapshot = await getDocs(productosCollectionRef);
    return snapshot.docs.map((doc) => doc.data());
  };

  // Función para aceptar un pedido
  const aceptarPedido = async (id) => {
    try {
      const pedidoRef = doc(db, 'pedidos', id);

      // Encuentra el pedido en la lista
      const pedido = pedidos.find((p) => p.id === id);

      // Cargar productos desde la subcolección
      const productos = await cargarProductos(id);
      if (!productos || productos.length === 0) {
        return;
      }

      // Determinar la zona del pedido basado en los productos
      let estadoInicial = 'En espera - Zona BC'; // Valor por defecto
      const perteneceZonaA = productos.some((producto) => {
        const lugar = producto.lugarAlmacenamiento?.trim().toUpperCase();
        return lugar && lugar.startsWith('A');
      });

      if (perteneceZonaA) {
        estadoInicial = 'En espera - Zona A';
      }

      // Actualiza el pedido con el flujo normal de estados
      await updateDoc(pedidoRef, {
        estado: estadoInicial,
        activo: true,
        backorder: false,
        prioridad: false,
        historialEstados: [
          ...(pedido.historialEstados || []),
          { estado: estadoInicial, timestampInicio: new Date() },
        ],
        credito: false,
      });
    } catch (error) {
      console.error('Error al aprobar el pedido:', error);
    }
  };

  // Función para rechazar un pedido
  const rechazarPedido = async (id) => {
    try {
      const pedidoRef = doc(db, 'pedidos', id);
      await updateDoc(pedidoRef, { estado: 'Rechazado', credito: false }); // Cambiar el estado a 'Rechazado' y desactivar crédito
    } catch (error) {
      console.error('Error al rechazar el pedido:', error);
    }
  };

  return (
    <div className="clientes-pedidos">
      {/* Tabla de pedidos */}
      <table>
        <thead>
          <tr>
            <th>Pedido</th>
            <th>Cliente</th>
            <th>Nombre</th>
            <th>Tiempo</th>
            <th>Aprobar</th>
            <th>Rechazar</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.length > 0 ? (
            pedidos.map((pedido) => (
              <tr key={pedido.id}>
                <td>{pedido.numeroPedido || 'N/A'}</td>
                <td>{pedido.numeroCliente || 'N/A'}</td>
                <td>{pedido.nombreCliente || 'N/A'}</td>
                <td>{pedido.tiempo || 'Sin datos'}</td>
                <td>
                  <button
                    onClick={() => aceptarPedido(pedido.id)}
                    style={{
                      color: 'green',
                      fontSize: '16px',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    ✔
                  </button>
                </td>
                <td>
                  <button
                    onClick={() => rechazarPedido(pedido.id)}
                    style={{
                      color: 'red',
                      fontSize: '16px',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    ❌
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No hay pedidos en crédito.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Credito;
