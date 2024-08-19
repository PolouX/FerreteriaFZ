import React, { useState, useEffect } from 'react';
import './UsersCards.css';
import { db } from '../../../firebaseConfig';
import { collection, onSnapshot } from 'firebase/firestore';
import { PiUserCircleCheck } from "react-icons/pi";

const UsersCards = ({ onSelectUser }) => {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('Todos');

  // Orden de prioridad para los permisos
  const permissionOrder = {
    'Admin': 1,
    'jefeAlmacen': 2,
    'jefeAtencionClientes': 3,
    'zonaA': 4,
    'zonaBC': 5,
    'empaquetado': 6,
    'credito': 7,
    'clientes': 8
  };

  useEffect(() => {
    const usuariosCollection = collection(db, 'usuarios');

    const unsubscribe = onSnapshot(usuariosCollection, (snapshot) => {
      const usersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Ordenar los usuarios basándose en los permisos
      usersList.sort((a, b) => {
        return permissionOrder[a.permisos] - permissionOrder[b.permisos];
      });

      setUsers(usersList);
    });

    return () => unsubscribe();
  }, []);

  // Filtrar usuarios según el filtro seleccionado
  const filteredUsers = users.filter(user => {
    if (filter === 'Todos') return true;
    if (filter === 'Almacen') {
      return ['zonaA', 'zonaBC', 'empaquetado'].includes(user.permisos);
    }
    if (filter === 'Administrativo') {
      return ['Admin', 'jefeAlmacen', 'jefeAtencionClientes'].includes(user.permisos);
    }
    if (filter === 'Oficina') {
      return ['credito', 'clientes'].includes(user.permisos);
    }
    return false;
  });

  return (
    <div className="userCards-container">
      <div className="cards-filters">
        <button id='user-filters-todos' className={filter === "Todos" ? "user-filter-selected" : ""} onClick={() => setFilter('Todos')}>Todos</button>
        <button id='user-filters-almacen' className={filter === "Almacen" ? "user-filter-selected" : ""} onClick={() => setFilter('Almacen')}>Almacen</button>
        <button id='user-filter-admin' className={filter === "Administrativo" ? "user-filter-selected" : ""} onClick={() => setFilter('Administrativo')}>Administrativo</button>
        <button id='user-filters-oficina' className={filter === "Oficina" ? "user-filter-selected" : ""} onClick={() => setFilter('Oficina')}>Oficina</button>
      </div>
      <div className='cards-users'>
        {filteredUsers.map(user => (
          <div
            className={`user-card ${user.permisos}`}
            key={user.id}
            onClick={() => onSelectUser(user)}  // Llamar a la función onSelectUser al hacer clic en un usuario
          >
            <PiUserCircleCheck className='user-icon' />
            <span className="user-nombre-apellido">
              {user.nombre} <br /> {user.apellido}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsersCards;
