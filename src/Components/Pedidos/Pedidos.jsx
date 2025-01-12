import React, { useEffect, useState } from 'react';
import { db } from '../../firebaseConfig';
import { collection, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { IonIcon } from "@ionic/react";
import { alertOutline, searchOutline, arrowForwardOutline } from 'ionicons/icons';
import "./Pedidos.css";

const Pedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [filteredPedidos, setFilteredPedidos] = useState([]);
  const [pedidosFilter, setPedidosFilter] = useState('Zona A');
  const [searchTerm, setSearchTerm] = useState('');
  const [conteoZonas, setConteoZonas] = useState({
    'Zona A': 0,
    'Zona BC': 0,
    'Empaquetado': 0,
  });
  const [buscandoPedido, setBuscandoPedido] = useState(false);
  const [backupPedidos, setBackupPedidos] = useState([]);

  const estadosOrden = [
    'En espera - Zona A',
    'Zona A',
    'En espera - Zona BC',
    'Zona BC',
    'En espera - Empaquetado',
    'Empaquetando',
    'Finalizado',
  ];

  const estaEnHorarioLaboral = (date) => {
    const day = date.getDay();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const totalMinutes = hours * 60 + minutes;

    if (day === 0) return false; // Domingo
    if (day === 6 && (totalMinutes < 540 || totalMinutes > 840)) return false; // Sábado: 9:00 a 14:00
    if (day >= 1 && day <= 5 && (totalMinutes < 510 || totalMinutes > 1080)) return false; // Lunes a viernes: 8:30 a 18:00
    return true;
  };

  const calcularMinutosLaborales = (timestampInicio) => {
    const start = new Date(timestampInicio);
    const now = new Date();
    let totalMinutes = 0;

    while (start < now) {
      if (estaEnHorarioLaboral(start)) {
        totalMinutes++;
      }
      start.setMinutes(start.getMinutes() + 1);
    }
    return totalMinutes;
  };

  const contarPedidosPorZona = (pedidos) => {
    const zonas = {
      'Zona A': 0,
      'Zona BC': 0,
      'Empaquetado': 0,
    };

    pedidos.forEach((pedido) => {
      if (pedido.estado.includes('Zona A')) zonas['Zona A']++;
      else if (
        pedido.estado.includes('Zona BC') || 
        pedido.estado.includes('En espera - Zona BC')
      ) zonas['Zona BC']++;
      else if (
        pedido.estado.includes('Empaquetado') || 
        pedido.estado.includes('Empaquetando') ||
        pedido.estado.includes('En espera - Empaquetado')
      ) zonas['Empaquetado']++;
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
            pedido.tiempo = calcularMinutosLaborales(lastZonaTimestamp);
          } else {
            pedido.tiempo = 'N/A';
          }
        } else {
          pedido.tiempo = 'N/A';
        }

        return pedido;
      });

      setPedidos(reordenarPedidos(pedidosData));
      setBackupPedidos(reordenarPedidos(pedidosData));
      if (!buscandoPedido) {
        setFilteredPedidos(
          reordenarPedidos(pedidosData).filter((pedido) =>
            pedidosFilter === "Zona BC"
              ? pedido.estado.includes('Zona BC') || pedido.estado.includes('En espera - Zona BC')
              : pedidosFilter === "Empaquetado"
              ? pedido.estado.includes('Empaquetado') || pedido.estado.includes('Empaquetando') || pedido.estado.includes('En espera - Empaquetado')
              : pedido.estado.includes(pedidosFilter)
          )
        );
      }
      setConteoZonas(contarPedidosPorZona(pedidosData));
    });

    return () => unsubscribe();
  }, [pedidosFilter, buscandoPedido]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPedidos((prevPedidos) =>
        prevPedidos.map((pedido) => {
          if (pedido.historialEstados?.length > 0) {
            const lastZona = pedido.historialEstados[pedido.historialEstados.length - 1];
            if (lastZona.timestampInicio) {
              const lastZonaTimestamp = lastZona.timestampInicio.toMillis();
              pedido.tiempo = calcularMinutosLaborales(lastZonaTimestamp);
            }
          }
          return pedido;
        })
      );
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const reordenarPedidos = (pedidos) => {
    return pedidos
      .filter((pedido) => pedido.estado !== 'Finalizado')
      .sort((a, b) => {
        if (a.estado.includes('En espera') && !b.estado.includes('En espera')) return -1;
        if (!a.estado.includes('En espera') && b.estado.includes('En espera')) return 1;
        return b.prioridad - a.prioridad;
      });
  };

  const avanzarEstado = async (id, estadoActual) => {
    try {
      const pedidoRef = doc(db, 'pedidos', id);
      const nuevoEstado = estadosOrden[estadosOrden.indexOf(estadoActual) + 1] || estadoActual;

      if (nuevoEstado !== estadoActual) {
        await updateDoc(pedidoRef, {
          estado: nuevoEstado,
          historialEstados: [
            ...pedidos.find((pedido) => pedido.id === id).historialEstados,
            { estado: nuevoEstado, timestampInicio: new Date() },
          ],
        });

        console.log(`Pedido ${id} avanzó al estado: ${nuevoEstado}`);
      }
    } catch (error) {
      console.error('Error al avanzar el estado:', error);
    }
  };

  const cambiarPrioridad = async (id, prioridadActual, estadoActual) => {
    if (estadoActual.includes('En espera')) {
      try {
        const pedidoRef = doc(db, 'pedidos', id);
        await updateDoc(pedidoRef, { prioridad: !prioridadActual });

        const pedidosActualizados = pedidos.map((pedido) =>
          pedido.id === id ? { ...pedido, prioridad: !prioridadActual } : pedido
        );

        setPedidos(reordenarPedidos(pedidosActualizados));
        setFilteredPedidos(
          reordenarPedidos(pedidosActualizados).filter((pedido) =>
            pedidosFilter === "Zona BC"
              ? pedido.estado.includes('Zona BC') || pedido.estado.includes('En espera - Zona BC')
              : pedidosFilter === "Empaquetado"
              ? pedido.estado.includes('Empaquetado') || pedido.estado.includes('Empaquetando') || pedido.estado.includes('En espera - Empaquetado')
              : pedido.estado.includes(pedidosFilter)
          )
        );
      } catch (error) {
        console.error('Error al cambiar la prioridad:', error);
      }
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
        setPedidosFilter(
          pedidoEncontrado.estado.includes('Zona A') ? 'Zona A' :
          pedidoEncontrado.estado.includes('Zona BC') || pedido.estado.includes('En espera - Zona BC')
            ? 'Zona BC'
            : 'Empaquetado'
        );
        setFilteredPedidos([pedidoEncontrado]);
      } else {
        alert('Pedido no encontrado');
      }
    }
  };

  const resetPedidos = () => {
    setSearchTerm('');
    setBuscandoPedido(false);
    setFilteredPedidos(
      backupPedidos.filter((pedido) =>
        pedidosFilter === "Zona BC"
          ? pedido.estado.includes('Zona BC') || pedido.estado.includes('En espera - Zona BC')
          : pedidosFilter === "Empaquetado"
          ? pedido.estado.includes('Empaquetado') || pedido.estado.includes('Empaquetando') || pedido.estado.includes('En espera - Empaquetado')
          : pedido.estado.includes(pedidosFilter)
      )
    );
  };

  const handleFilterChange = (filter) => {
    if (!buscandoPedido) {
      setPedidosFilter(filter);
      setFilteredPedidos(
        backupPedidos.filter((pedido) =>
          filter === "Zona BC"
            ? pedido.estado.includes('Zona BC') || pedido.estado.includes('En espera - Zona BC')
            : filter === "Empaquetado"
            ? pedido.estado.includes('Empaquetado') || pedido.estado.includes('Empaquetando') || pedido.estado.includes('En espera - Empaquetado')
            : pedido.estado.includes(filter)
        )
      );
    }
  };

  return (
    <>
      <div className="pedidos-header">
        <div className="pedidos-header-filters">
          <button
            className={pedidosFilter === "Zona A" ? "pedidos-filter-selected" : ""}
            onClick={() => handleFilterChange('Zona A')}
            disabled={buscandoPedido}
          >
            Zona A ({conteoZonas['Zona A']})
          </button>
          <button
            className={pedidosFilter === "Zona BC" ? "pedidos-filter-selected" : ""}
            onClick={() => handleFilterChange('Zona BC')}
            disabled={buscandoPedido}
          >
            Zona BC ({conteoZonas['Zona BC']})
          </button>
          <button
            className={pedidosFilter === "Empaquetado" ? "pedidos-filter-selected" : ""}
            onClick={() => handleFilterChange('Empaquetado')}
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
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={buscandoPedido}
          />
        </form>
      </div>
      <div className="pedidos">
        <table>
          <thead>
            <tr>
              <th>Pedido</th>
              <th>Nombre</th>
              {!pedidosFilter.includes("Empaquetado") && <th>Prioridad</th>}
              <th>Llegada</th>
              <th>Tiempo (min)</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredPedidos.map((pedido) => (
              <tr key={pedido.id}>
                <td>{pedido.numeroPedido}</td>
                <td>{pedido.nombreCliente}</td>
                {!pedidosFilter.includes("Empaquetado") && (
                  <td id="pedidos-prioridad">
                    <button
                      style={{
                        backgroundColor: pedido.prioridad ? 'red' : 'transparent',
                        color: pedido.prioridad ? 'white' : 'black',
                      }}
                      onClick={() => cambiarPrioridad(pedido.id, pedido.prioridad, pedido.estado)}
                      disabled={!pedido.estado.includes('En espera')}
                    >
                      <IonIcon icon={alertOutline} />
                    </button>
                  </td>
                )}
                <td>
                  {pedido.timestamp
                    ? new Date(pedido.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : 'Sin registro'}
                </td>
                <td>{pedido.tiempo}</td>
                <td>{pedido.estado}</td>
                <td>
                  <button
                    onClick={() => avanzarEstado(pedido.id, pedido.estado)}
                    className="advance-button"
                  >
                    <IonIcon icon={arrowForwardOutline} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Pedidos;
