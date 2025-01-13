import React, { useEffect, useState } from 'react';
import { db } from '../../../firebaseConfig';
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import "./ClientesPedidos.css";

const ClientesPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [filteredPedidos, setFilteredPedidos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const pedidosRef = collection(db, 'pedidos');

    // Escuchar cambios en tiempo real
    const unsubscribe = onSnapshot(pedidosRef, (snapshot) => {
      const pedidosData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPedidos(pedidosData);
      setFilteredPedidos(pedidosData); // Inicialmente, mostrar todos
    });

    return () => unsubscribe();
  }, []);

  // Función para manejar la búsqueda
  const handleSearch = (event) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);

    if (term.trim() === "") {
      setFilteredPedidos(pedidos);
    } else {
      const results = pedidos.filter(
        (pedido) =>
          pedido.numeroPedido.toLowerCase().includes(term) ||
          pedido.nombreCliente.toLowerCase().includes(term) ||
          pedido.numeroCliente.toLowerCase().includes(term)
      );
      setFilteredPedidos(results);
    }
  };

  // Función para destacar y ordenar pedidos que cumplen con las condiciones
  const getDestacadosYOrdenados = () => {
    const destacados = filteredPedidos.filter((pedido) => {
      // Destacar solo si el estado es "En espera"
      return pedido.estado.toLowerCase().includes("en espera");
    });

    const noDestacados = filteredPedidos.filter(
      (pedido) => !pedido.estado.toLowerCase().includes("en espera")
    );

    return [...destacados, ...noDestacados];
  };

  // Función para borrar un pedido si cumple las condiciones
  const borrarPedido = async (id, estado, historialEstados) => {
    // Validar si el historial tiene más de un estado (ya pasó de "En espera")
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

  const destacadosYOrdenados = getDestacadosYOrdenados();

  return (
    <div className="clientes-pedidos">
      <div className="clientes-header">
        {/* Campo de búsqueda */}
        <div className="clientes-search">
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
          {destacadosYOrdenados.length > 0 ? (
            destacadosYOrdenados.map((pedido) => (
              <tr
                key={pedido.id}
                className={
                  pedido.estado.toLowerCase().includes("en espera")
                    ? "destacado"
                    : ""
                }
              >
                <td>{pedido.numeroPedido}</td>
                <td>{pedido.numeroCliente}</td>
                <td>{pedido.nombreCliente}</td>
                <td>{pedido.backorder ? "✔️" : "❌"}</td>
                <td>{pedido.salida}</td>
                <td>{pedido.estado}</td>
                <td>
                  <button
                    onClick={() =>
                      borrarPedido(
                        pedido.id,
                        pedido.estado,
                        pedido.historialEstados
                      )
                    }
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
