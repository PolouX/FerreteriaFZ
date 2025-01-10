import React, { useEffect, useState } from 'react';
import { db } from '../../firebaseConfig';
import { collection, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { IonIcon } from "@ionic/react";
import { alertOutline, searchOutline } from 'ionicons/icons';
import "./Pedidos.css";

const Pedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [pedidosFilter, setPedidosFilter] = useState('Zona A');
  const [searchTerm, setSearchTerm] = useState('');
  const [conteoZonas, setConteoZonas] = useState({
    'Zona A': 0,
    'Zona BC': 0,
    'Empaquetado': 0,
  });
  const [buscandoPedido, setBuscandoPedido] = useState(false);

  const contarPedidosPorZona = (pedidos) => {
    const zonas = {
      'Zona A': 0,
      'Zona BC': 0,
      'Empaquetado': 0,
    };

    pedidos.forEach((pedido) => {
      if (zonas.hasOwnProperty(pedido.estado)) {
        zonas[pedido.estado]++;
      }
    });

    return zonas;
  };

  useEffect(() => {
    const pedidosRef = collection(db, 'pedidos');

    const unsubscribe = onSnapshot(pedidosRef, (snapshot) => {
      const pedidosData = snapshot.docs.map((doc) => {
        const pedido = { id: doc.id, ...doc.data() };

        if (pedido.historialEstados && pedido.historialEstados.length > 0) {
          const lastZona = pedido.historialEstados[pedido.historialEstados.length - 1];
          if (lastZona.timestampInicio) {
            const lastZonaTimestamp = lastZona.timestampInicio.toMillis();
            const tiempo = Math.floor((Date.now() - lastZonaTimestamp) / 60000);
            pedido.tiempo = tiempo >= 0 ? tiempo : 'N/A';
          } else {
            pedido.tiempo = 'N/A';
          }
        } else {
          pedido.tiempo = 'N/A';
        }

        return pedido;
      });

      setPedidos(reordenarPedidos(pedidosData));
      const conteoZonas = contarPedidosPorZona(pedidosData);
      setConteoZonas(conteoZonas);
    });

    return () => unsubscribe();
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

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    if (searchTerm.trim()) {
      const pedidoEncontrado = pedidos.find(
        (pedido) =>
          pedido.numeroPedido.toLowerCase() === searchTerm.trim().toLowerCase()
      );

      if (pedidoEncontrado) {
        setBuscandoPedido(true);
        setPedidosFilter(pedidoEncontrado.estado);
        setPedidos([pedidoEncontrado]);
      } else {
        alert('Pedido no encontrado');
      }
    } else {
      resetPedidos();
    }
  };

  const resetPedidos = () => {
    setSearchTerm('');
    setBuscandoPedido(false);

    const pedidosRef = collection(db, 'pedidos');
    onSnapshot(pedidosRef, (snapshot) => {
      const pedidosData = snapshot.docs.map((doc) => {
        const pedido = { id: doc.id, ...doc.data() };

        if (pedido.historialEstados && pedido.historialEstados.length > 0) {
          const lastZona = pedido.historialEstados[pedido.historialEstados.length - 1];
          if (lastZona.timestampInicio) {
            const lastZonaTimestamp = lastZona.timestampInicio.toMillis();
            const tiempo = Math.floor((Date.now() - lastZonaTimestamp) / 60000);
            pedido.tiempo = tiempo >= 0 ? tiempo : 'N/A';
          } else {
            pedido.tiempo = 'N/A';
          }
        } else {
          pedido.tiempo = 'N/A';
        }

        return pedido;
      });

      setPedidos(reordenarPedidos(pedidosData));
    });
  };

  const getFilteredPedidos = () => {
    if (buscandoPedido) {
      return pedidos;
    }

    return pedidos.filter((pedido) => pedido.estado === pedidosFilter);
  };

  return (
    <>
      <div className="pedidos-header">
        <div className="pedidos-header-filters">
          <button
            className={pedidosFilter === "Zona A" ? "pedidos-filter-selected" : ""}
            onClick={() => !buscandoPedido && setPedidosFilter('Zona A')}
            disabled={buscandoPedido}
          >
            Zona A ({conteoZonas['Zona A']})
          </button>
          <button
            className={pedidosFilter === "Zona BC" ? "pedidos-filter-selected" : ""}
            onClick={() => !buscandoPedido && setPedidosFilter('Zona BC')}
            disabled={buscandoPedido}
          >
            Zona BC ({conteoZonas['Zona BC']})
          </button>
          <button
            className={pedidosFilter === "Empaquetado" ? "pedidos-filter-selected" : ""}
            onClick={() => !buscandoPedido && setPedidosFilter('Empaquetado')}
            disabled={buscandoPedido}
          >
            Empaquetado ({conteoZonas['Empaquetado']})
          </button>
        </div>
        <form className="pedidos-search" onSubmit={handleSearchSubmit}>
          {buscandoPedido && (
            <button
              type="button"
              className="reset-button"
              onClick={resetPedidos}
            >
              Restablecer
            </button>
          )}
          <IonIcon icon={searchOutline} className="pedidos-search-icon" />
          <input
            type="text"
            placeholder="Buscar un pedido..."
            value={searchTerm}
            onChange={(e) => buscandoPedido || setSearchTerm(e.target.value)}
            readOnly={buscandoPedido}
            className={buscandoPedido ? "search-input-locked" : ""}
          />
        </form>
      </div>
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
            {getFilteredPedidos().map((pedido) => (
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
    </>
  );
};

export default Pedidos;
