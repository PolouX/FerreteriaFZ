import React, { useEffect, useState } from 'react';
import { db } from '../../../firebaseConfig';
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import "./ClientesPedidos.css";

const ClientesPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [filteredPedidos, setFilteredPedidos] = useState([]);
  const [clientesFilters, setClientesFilters] = useState("Activos"); // Filtro seleccionado
  const [searchTerm, setSearchTerm] = useState(""); // Término de búsqueda
  const [conteos, setConteos] = useState({
    pendientes: 0,
    activos: 0,
    facturas: 0,
  });

  // Escuchar cambios en Firebase
  useEffect(() => {
    const pedidosRef = collection(db, 'pedidos');
    const unsubscribe = onSnapshot(pedidosRef, (snapshot) => {
      const pedidosData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPedidos(pedidosData);
    });

    return () => unsubscribe();
  }, []);

  // Calcular conteos
  useEffect(() => {
    const pendientes = pedidos.filter(
      (pedido) => pedido.estado === "Pendiente de aprobación" && pedido.credito
    ).length;

    const activos = pedidos.filter(
      (pedido) => pedido.estado !== "Finalizado" && pedido.estado !== "Pendiente de aprobación"
    ).length;

    const facturas = pedidos.filter((pedido) => pedido.estado === "Finalizado").length;

    setConteos({ pendientes, activos, facturas });
  }, [pedidos]);

  // Filtrar pedidos en función del filtro seleccionado y término de búsqueda
  useEffect(() => {
    let filtered = pedidos;

    // Aplicar filtro según el estado
    switch (clientesFilters) {
      case "Pendientes":
        filtered = pedidos.filter(
          (pedido) => pedido.estado === "Pendiente de aprobación" && pedido.credito
        );
        break;
      case "Activos":
        filtered = pedidos.filter(
          (pedido) => pedido.estado !== "Finalizado" && pedido.estado !== "Pendiente de aprobación"
        );
        break;
      case "Facturas":
        filtered = pedidos.filter((pedido) => pedido.estado === "Finalizado");
        break;
      default:
        filtered = pedidos;
    }

    // Aplicar filtro por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (pedido) =>
          pedido.numeroPedido.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pedido.nombreCliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pedido.numeroCliente.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPedidos(filtered);
  }, [clientesFilters, pedidos, searchTerm]);


  
  // Función para manejar la búsqueda
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  // Función para borrar un pedido
  const borrarPedido = async (id, estado, historialEstados) => {
    if (historialEstados && historialEstados.length > 1) {
      alert("No se puede borrar el pedido porque ya inició un proceso.");
      return;
    }

    if (estado.toLowerCase().includes("en espera")) {
      try {
        await deleteDoc(doc(db, "pedidos", id));
        alert("Pedido borrado con éxito.");
      } catch (error) {
        console.error("Error al borrar el pedido:", error);
      }
    } else {
      alert("No se puede borrar el pedido porque ya inició un proceso.");
    }
  };

  return (
    <div className="clientes-pedidos">
      {/* Filtros */}
      <div className="clientes-header">
        <div className="clientes-left-filters">
          <button
            className={clientesFilters === "Pendientes" ? "clientesFilterSelected" : ""}
            onClick={() => setClientesFilters("Pendientes")}
          >
            Pendientes ({conteos.pendientes})
          </button>
          <button
            className={clientesFilters === "Activos" ? "clientesFilterSelected" : ""}
            onClick={() => setClientesFilters("Activos")}
          >
            Activos ({conteos.activos})
          </button>
          <button
            className={clientesFilters === "Facturas" ? "clientesFilterSelected" : ""}
            onClick={() => setClientesFilters("Facturas")}
          >
            Facturas ({conteos.facturas})
          </button>
        </div>
        <div className="clientes-search">
          <input
            type="text"
            placeholder="Buscar un pedido..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Tabla de pedidos */}
      <table>
        <thead>
          <tr>
            <th>Pedido</th>
            <th>Cliente</th>
            <th>Nombre</th>
            <th>B.O.</th>
            <th>Salida</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredPedidos.length > 0 ? (
            filteredPedidos.map((pedido) => (
              <tr key={pedido.id}>
                <td>{pedido.numeroPedido}</td>
                <td>{pedido.numeroCliente}</td>
                <td>{pedido.nombreCliente}</td>
                <td>{pedido.backorder ? "✔️" : "❌"}</td>
                <td>{pedido.salida}</td>
                <td>{pedido.estado}</td>
                <td>
                  <button
                    onClick={() => borrarPedido(pedido.id, pedido.estado, pedido.historialEstados)}
                    style={{
                      color: "red",
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                    }}
                  >
                    🗑️ Borrar
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7">No se encontraron pedidos.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ClientesPedidos;
