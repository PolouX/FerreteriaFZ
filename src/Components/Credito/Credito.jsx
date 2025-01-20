import React, { useEffect, useState, useContext } from 'react';
import { db } from '../../firebaseConfig'; // Importar configuración de Firebase
import { collection, onSnapshot, query, where, updateDoc, doc, getDocs } from 'firebase/firestore';
import './Credito.css';
import AuthContext from '../../AuthContext'; // Importar contexto de autenticación

const Credito = () => {
  const [pedidos, setPedidos] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [accionSeleccionada, setAccionSeleccionada] = useState(null);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);

  const { user } = useContext(AuthContext); // Obtener datos del usuario autenticado

  useEffect(() => {
    const pedidosRef = collection(db, 'pedidos');
    const pedidosCreditoQuery = query(pedidosRef, where('credito', '==', true));

    const unsubscribe = onSnapshot(pedidosCreditoQuery, (snapshot) => {
      const pedidosData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        tiempo: calcularTiempo(doc.data().timestamp), // Calcular el tiempo inicial
      }));
      setPedidos(pedidosData);
    });

    const interval = setInterval(() => {
      setPedidos((prevPedidos) =>
        prevPedidos.map((pedido) => ({
          ...pedido,
          tiempo: calcularTiempo(pedido.timestamp),
        }))
      );
    }, 60000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const calcularTiempo = (timestamp) => {
    if (!timestamp) return 'Sin datos';
    const tiempoCreado = timestamp.toDate(); // Convertir el timestamp
    const ahora = new Date(); // Hora actual
    const diferencia = Math.floor((ahora - tiempoCreado) / (1000 * 60)); // Diferencia en minutos
    return `${diferencia} minutos`;
  };

  const cargarProductos = async (pedidoId) => {
    const productosCollectionRef = collection(db, `pedidos/${pedidoId}/productos`);
    const snapshot = await getDocs(productosCollectionRef);
    return snapshot.docs.map((doc) => doc.data());
  };

  const aceptarPedido = async (id) => {
    try {
      const pedidoRef = doc(db, 'pedidos', id);
      const pedido = pedidos.find((p) => p.id === id);
      const productos = await cargarProductos(id);

      if (!productos || productos.length === 0) {
        console.error('No hay productos asociados al pedido.');
        return;
      }

      const lugarVacio = productos.every(
        (producto) =>
          !producto.lugarAlmacenamiento || producto.lugarAlmacenamiento.trim() === ''
      );

      let estadoInicial = lugarVacio ? 'Finalizado' : 'En espera - Zona BC';
      if (!lugarVacio) {
        const perteneceZonaA = productos.some((producto) =>
          producto.lugarAlmacenamiento?.trim().toUpperCase().startsWith('A')
        );
        if (perteneceZonaA) estadoInicial = 'En espera - Zona A';
      }

      await updateDoc(pedidoRef, {
        estado: estadoInicial,
        credito: false,
        historialEstados: [
          ...(pedido.historialEstados || []),
          {
            estado: estadoInicial,
            timestampInicio: new Date(),
            aprobadoPor: `${user?.nombre} ${user?.apellido}`,
          },
        ],
      });

      console.log(
        `Pedido ${id} aprobado al estado: ${estadoInicial} por ${user?.nombre} ${user?.apellido}.`
      );
    } catch (error) {
      console.error('Error al aprobar el pedido:', error);
    }
  };

  const rechazarPedido = async (id) => {
    try {
      const pedidoRef = doc(db, 'pedidos', id);
      const pedido = pedidos.find((p) => p.id === id);

      await updateDoc(pedidoRef, {
        estado: 'Rechazado',
        credito: false,
        historialEstados: [
          ...(pedido.historialEstados || []),
          {
            estado: 'Rechazado',
            timestampInicio: new Date(),
            rechazadoPor: `${user?.nombre} ${user?.apellido}`,
          },
        ],
      });

      console.log(
        `Pedido ${id} rechazado por ${user?.nombre} ${user?.apellido}.`
      );
    } catch (error) {
      console.error('Error al rechazar el pedido:', error);
    }
  };

  const abrirModal = (pedido, accion) => {
    setPedidoSeleccionado(pedido);
    setAccionSeleccionada(accion);
    setMostrarModal(true);
  };

  const confirmarAccion = () => {
    if (accionSeleccionada === 'aceptar') {
      aceptarPedido(pedidoSeleccionado.id);
    } else if (accionSeleccionada === 'rechazar') {
      rechazarPedido(pedidoSeleccionado.id);
    }
    cerrarModal();
  };

  const cerrarModal = () => {
    setPedidoSeleccionado(null);
    setAccionSeleccionada(null);
    setMostrarModal(false);
  };

  return (
    <div className="clientes-pedidos">
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
                    onClick={() => abrirModal(pedido, 'aceptar')}
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
                    onClick={() => abrirModal(pedido, 'rechazar')}
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

      {mostrarModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>
              {accionSeleccionada === 'aceptar' ? 'Aceptar Pedido' : 'Rechazar Pedido'}
            </h2>
            <p>
              ¿Estás seguro que deseas {accionSeleccionada} el pedido{' '}
              <strong>{pedidoSeleccionado?.numeroPedido || 'N/A'}</strong>?
            </p>
            <div className="modal-actions">
              <button onClick={confirmarAccion}>
                {accionSeleccionada === 'aceptar' ? 'Aceptar' : 'Rechazar'}
              </button>
              <button onClick={cerrarModal}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Credito;
