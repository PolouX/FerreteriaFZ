import React, { useState, useEffect } from 'react';
import './UsersCards.css';
import { db } from '../../../firebaseConfig';
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { PiUserCircleCheck } from "react-icons/pi";
import { MdOutlineDeleteOutline } from "react-icons/md";

const UsersCards = ({ onSelectUser }) => {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('Todos');
  const [selectedUserId, setSelectedUserId] = useState(null);

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
        const aPermissions = a.permisos.split(', ');
        const bPermissions = b.permisos.split(', ');
  
        // Encontrar el permiso con mayor prioridad según permissionOrder
        const aPriority = Math.min(...aPermissions.map(p => permissionOrder[p]));
        const bPriority = Math.min(...bPermissions.map(p => permissionOrder[p]));
  
        // Si están en la misma categoría, no cambies el orden
        if (aPriority === bPriority) return 0;
  
        return aPriority - bPriority;
      });
  
      setUsers(usersList);
    });
  
    return () => unsubscribe();
  }, []);
  

  const filteredUsers = users.filter(user => {
    if (filter === 'Todos') return true;
    if (filter === 'Almacen') {
      return ['zonaA', 'zonaBC', 'empaquetado'].some(role => user.permisos.includes(role));
    }
    if (filter === 'Administrativo') {
      return ['Admin', 'jefeAlmacen', 'jefeAtencionClientes'].some(role => user.permisos.includes(role));
    }
    if (filter === 'Oficina') {
      return ['credito', 'clientes'].some(role => user.permisos.includes(role));
    }
    return false;
  });
  

  const handleUserClick = (user) => {
    if (selectedUserId === user.id) {
      setSelectedUserId(null);
      onSelectUser(null);
    } else {
      setSelectedUserId(user.id);
      onSelectUser(user);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    const confirmed = window.confirm(`¿Estás seguro de que deseas eliminar a ${userName}?`);
    if (confirmed) {
      try {
        await deleteDoc(doc(db, "usuarios", userId));
      } catch (error) {
        console.error("Error eliminando el usuario: ", error);
        alert("Hubo un error al eliminar el usuario. Inténtalo de nuevo.");
      }
    }
  };

  return (
    <div className="userCards-container">
      <div className="cards-filters">
        <button id='user-filters-todos' className={filter === "Todos" ? "user-filter-selected" : ""} onClick={() => setFilter('Todos')}>Todos</button>
        <button id='user-filters-almacen' className={filter === "Almacen" ? "user-filter-selected" : ""} onClick={() => setFilter('Almacen')}>Almacén</button>
        <button id='user-filter-admin' className={filter === "Administrativo" ? "user-filter-selected" : ""} onClick={() => setFilter('Administrativo')}>Administrativo</button>
        <button id='user-filters-oficina' className={filter === "Oficina" ? "user-filter-selected" : ""} onClick={() => setFilter('Oficina')}>Oficina</button>
      </div>
      <div className='cards-users'>
        {filteredUsers.map(user => (
          <div
            className={`user-card ${user.permisos} ${selectedUserId === user.id ? 'selected' : ''}`}
            key={user.id}
            onClick={() => handleUserClick(user)}
          >
            <button
              className="user-card-delete"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteUser(user.id, `${user.nombre} ${user.apellido}`);
              }}
            >
              <MdOutlineDeleteOutline />
            </button>
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
