import React, { useEffect, useState } from 'react';
import { db } from '../../../firebaseConfig'; // Asegúrate de importar tu configuración de Firebase
import { collection, onSnapshot } from 'firebase/firestore';
import "./ClientesPedidos.css";

const ClientesPedidos = () => {
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
    <div className="clientes-pedidos">

      <table>
        <thead>
          <tr>
            <th>Pedido</th>
            <th>Cliente</th>
            <th>Nombre</th>
            <th id='clientes-bo'>B.O.</th>
            <th>Salida</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.map((pedido) => (
            <tr key={pedido.id}>
              <td>{pedido.numeroPedido}</td>
              <td>{pedido.numeroCliente}</td>
              <td>{pedido.nombreCliente}</td>
              <td id='clientes-bo'>{pedido.backorder ? '✔️' : '❌'}</td>
              <td>{pedido.salida}</td>
              <td>{pedido.estado}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClientesPedidos;
