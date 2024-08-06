import React, {useState, useEffect} from 'react'
import "./Usuarios.css";
import { db } from '../../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

const Usuarios = () => {
  // useState para mantener los usuarios obtenidos de la base de datos
  const [users, setUsers] = useState([]);

  // useEffect para obtener los datos cuando el componente se monta
  useEffect(() => {
    const fetchUsers = async () => {
      const usuarios = collection(db, 'usuarios');
      const querySnapshot = await getDocs(usuarios);
      const usersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersList);
    };

    fetchUsers();
  }, []); // El array vacío [] asegura que el efecto solo se ejecute una vez al montar el componente

  return (
    <table className='usuarios-table-container'>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Rol</th>
          <th>Contraseña</th>
          <th>Editar</th>
        </tr>
      </thead>
      <tbody>
        {users.map(user => (
          <tr key={user.id}>
            <td>{`${user.nombre} ${user.apellido}`}</td>
            <td>{user.permisos}</td>
            <td>{user.contrasena}</td>
            <td><button className="edit">Editar</button></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Usuarios;