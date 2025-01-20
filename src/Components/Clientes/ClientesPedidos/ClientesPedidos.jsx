import React, { useEffect, useState } from "react";
import { db } from "../../../firebaseConfig";
import { collection, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import "./ClientesPedidos.css";

const ClientesPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [pedidosFaltantes, setPedidosFaltantes] = useState([]);
  const [mostrarModalFaltantes, setMostrarModalFaltantes] = useState(false);
  const [notasFaltantes, setNotasFaltantes] = useState({});
  const [filteredPedidos, setFilteredPedidos] = useState([]);
  const [clientesFilters, setClientesFilters] = useState("Activos");
  const [searchTerm, setSearchTerm] = useState("");
  const [buscandoPedido, setBuscandoPedido] = useState(false);
  const [conteos, setConteos] = useState({
    pendientes: 0,
    activos: 0,
    facturas: 0,
  });

  // Cargar pedidos desde Firebase
  useEffect(() => {
    const pedidosRef = collection(db, "pedidos");
    const unsubscribe = onSnapshot(pedidosRef, (snapshot) => {
      const pedidosData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPedidos(pedidosData);
      setFilteredPedidos(pedidosData);
    });

    return () => unsubscribe();
  }, []);

  // Actualizar conteos por estado
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

  // Filtrar pedidos según el filtro
  useEffect(() => {
    if (!buscandoPedido) {
      let filtered = pedidos;

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

      setFilteredPedidos(filtered);
    }
  }, [clientesFilters, pedidos, buscandoPedido]);

  // Buscar un pedido y cambiar el filtro automáticamente
  const handleSearch = (event) => {
    event.preventDefault();

    if (!searchTerm.trim()) {
      alert("Por favor, ingresa un número de pedido.");
      return;
    }

    const pedidoEncontrado = pedidos.find(
      (pedido) =>
        pedido.numeroPedido.toLowerCase() === searchTerm.trim().toLowerCase()
    );

    if (pedidoEncontrado) {
      setBuscandoPedido(true);
      if (pedidoEncontrado.estado === "Pendiente de aprobación" && pedidoEncontrado.credito) {
        setClientesFilters("Pendientes");
      } else if (pedidoEncontrado.estado === "Finalizado") {
        setClientesFilters("Facturas");
      } else {
        setClientesFilters("Activos");
      }
      setFilteredPedidos([pedidoEncontrado]);
    } else {
      alert("Pedido no encontrado.");
    }
  };

  // Restablecer búsqueda
  const handleReset = () => {
    setSearchTerm("");
    setBuscandoPedido(false);
    setClientesFilters("Activos");
    setFilteredPedidos(pedidos);
  };

  // Calcular pedidos faltantes
  const calcularPedidosFaltantes = () => {
    if (pedidos.length === 0) return;

    const numerosPedidos = pedidos.map((p) => Number(p.numeroPedido));
    const minPedido = Math.min(...numerosPedidos);
    const maxPedido = Math.max(...numerosPedidos);

    const faltantes = [];
    for (let i = minPedido; i <= maxPedido; i++) {
      if (!numerosPedidos.includes(i)) {
        faltantes.push(i);
      }
    }

    setPedidosFaltantes(faltantes);
    setMostrarModalFaltantes(true);
  };

  const cerrarModalFaltantes = () => {
    setMostrarModalFaltantes(false);
  };

  const guardarNota = (pedido, nota) => {
    setNotasFaltantes((prevNotas) => ({
      ...prevNotas,
      [pedido]: nota,
    }));
  };

  // Lógica para borrar un pedido
  const handleDelete = async (pedido) => {
    const { id, historialEstados, estado } = pedido;

    if (historialEstados?.length > 1) {
      alert("No se puede borrar el pedido porque ya inició un proceso.");
      return;
    }

    if (!estado.toLowerCase().includes("en espera")) {
      alert("No se puede borrar el pedido porque no está en estado de espera.");
      return;
    }

    try {
      await deleteDoc(doc(db, "pedidos", id));
      alert("Pedido borrado con éxito.");
      setFilteredPedidos(filteredPedidos.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Error al borrar el pedido:", error);
    }
  };

  return (
    <div className="clientes-pedidos">
      <div className="clientes-header">
        <div className="clientes-left-filters">
          <button
            className={clientesFilters === "Pendientes" ? "clientesFilterSelected" : ""}
            onClick={() => setClientesFilters("Pendientes")}
            disabled={buscandoPedido}
          >
            Pendientes ({conteos.pendientes})
          </button>
          <button
            className={clientesFilters === "Activos" ? "clientesFilterSelected" : ""}
            onClick={() => setClientesFilters("Activos")}
            disabled={buscandoPedido}
          >
            Activos ({conteos.activos})
          </button>
          <button
            className={clientesFilters === "Facturas" ? "clientesFilterSelected" : ""}
            onClick={() => setClientesFilters("Facturas")}
            disabled={buscandoPedido}
          >
            Facturas ({conteos.facturas})
          </button>
        </div>
        <form className="clientes-search" onSubmit={handleSearch}>
          {buscandoPedido && (
            <button type="button" className="reset-button" onClick={handleReset}>
              Restablecer
            </button>
          )}
          <input
            type="text"
            placeholder="Buscar por número de pedido..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>
        <button className="ver-faltantes" onClick={calcularPedidosFaltantes}>
          Ver Faltantes
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Pedido</th>
            <th>Cliente</th>
            <th>Nombre</th>
            <th>B.O.</th>
            <th>Salida</th>
            <th>Estado</th>
            {clientesFilters !== "Facturas" && clientesFilters !== "Pendientes" ? <th>Acciones</th> : <th>Almacén</th>}

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
        {clientesFilters !== "Facturas" && clientesFilters !== "Pendientes" ? (
  <td>
    <button onClick={() => handleDelete(pedido)}>🗑️ Borrar</button>
  </td>
) : (
  <td>{pedido.almacen || "N/A"}</td>
)}

      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="7">No se encontraron pedidos.</td>
    </tr>
  )}
</tbody>

      </table>
      {mostrarModalFaltantes && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Pedidos Faltantes ({pedidosFaltantes.length})</h2>
            <div className="faltantes-scroll">
              {pedidosFaltantes.map((pedido) => (
                <div key={pedido} className="faltante-item">
                  <div className="faltante-id">
                    Pedido: <strong>{pedido}</strong>
                  </div>
                  <textarea
                    className="faltante-nota"
                    placeholder="Agrega una nota..."
                    value={notasFaltantes[pedido] || ""}
                    onChange={(e) => guardarNota(pedido, e.target.value)}
                  />
                </div>
              ))}
            </div>
            <button onClick={cerrarModalFaltantes}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientesPedidos;
