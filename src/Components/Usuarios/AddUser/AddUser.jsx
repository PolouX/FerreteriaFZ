import React, { useState, useEffect } from 'react';
import "./AddUser.css";
import { IonIcon } from "@ionic/react";
import { GoPackageDependencies } from "react-icons/go";
import { LiaUserShieldSolid } from "react-icons/lia";
import { cubeOutline, chatbubbleOutline, walletOutline } from 'ionicons/icons';
import { RiCustomerService2Line } from "react-icons/ri";
import { db } from '../../../firebaseConfig'; 
import { collection, addDoc, updateDoc, doc, query, where, getDocs } from "firebase/firestore";

const AddUser = ({ selectedUser, setSelectedUser }) => {  
  const [addNombre, setAddNombre] = useState('');
  const [addApellido, setAddApellido] = useState('');
  const [addContra, setAddContra] = useState('');
  const [selectedRoles, setSelectedRoles] = useState([]);

  useEffect(() => {
    if (selectedUser) {
      setAddNombre(selectedUser.nombre);
      setAddApellido(selectedUser.apellido);
      setAddContra(selectedUser.contrasena);
      setSelectedRoles(selectedUser.permisos.split(', '));
    } else {
      setAddNombre('');
      setAddApellido('');
      setAddContra('');
      setSelectedRoles([]);
    }
  }, [selectedUser]);

  const isSelected = (role) => selectedRoles.includes(role);

  const handleRoleToggle = (role) => {
    setSelectedRoles((prevRoles) => {
      const combinableRoles = ['zonaA', 'zonaBC', 'empaquetado'];
      const nonCombinableRoles = ['admin', 'credito'];
  
      if (combinableRoles.includes(role)) {
        // Si hay un rol no combinable seleccionado, deseleccionarlo primero antes de seleccionar un rol combinable
        if (prevRoles.some(r => nonCombinableRoles.includes(r))) {
          return [role]; // Deselecciona el rol no combinable y selecciona solo el rol combinable
        } else {
          // Alternar la selección del rol combinable
          if (prevRoles.includes(role)) {
            return prevRoles.filter(r => r !== role);
          } else {
            return [...prevRoles, role];
          }
        }
      } else if (nonCombinableRoles.includes(role)) {
        // Si se selecciona un rol no combinable, deseleccionar todos los roles actuales y seleccionar solo este
        return [role];
      } else {
        // Lógica para otros roles no combinables o únicos
        return [role];
      }
    });
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Verificar si todos los campos están llenos
    if (!addNombre || !addApellido || !addContra || selectedRoles.length === 0) {
      window.alert("Por favor, completa todos los campos del formulario.");
      return;
    }

    // Verificar si la contraseña ya existe en la base de datos
    const q = query(collection(db, "usuarios"), where("contrasena", "==", addContra));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty && (!selectedUser || (selectedUser && querySnapshot.docs[0].id !== selectedUser.id))) {
      window.alert("La contraseña ya está en uso. Por favor, elige una contraseña diferente.");
      return;
    }

    const newUser = {
      nombre: addNombre,
      apellido: addApellido,
      contrasena: addContra,
      permisos: selectedRoles.join(', '),
    };

    try {
      if (selectedUser) {
        const userDocRef = doc(db, "usuarios", selectedUser.id);
        await updateDoc(userDocRef, newUser);
      } else {
        await addDoc(collection(db, "usuarios"), newUser);
      }

      // Limpiar el formulario
      setAddNombre('');
      setAddApellido('');
      setAddContra('');
      setSelectedRoles([]);
      setSelectedUser(null);
    } catch (error) {
      console.error("Error al guardar el usuario: ", error);
      window.alert(`Error al guardar el usuario: ${error.message || 'Error desconocido'}`);
    }
  };

  return (
    <form className="newuser-card" onSubmit={handleSubmit}>
      <h2>{selectedUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</h2>
      <div className="adduser-datos">
        <div className="adduser-nombre">
          <input 
            type="text" 
            placeholder='Nombre...' 
            value={addNombre}
            onChange={(e) => setAddNombre(e.target.value)} 
          />
        </div>
        <div className="adduser-apellido">
          <input 
            type="text" 
            placeholder='Apellido...' 
            value={addApellido}
            onChange={(e) => setAddApellido(e.target.value)} 
          />
        </div>
      </div>
      <div className="adduser-roles">
        <p>Permisos:</p>
        <div className="adduser-roles-row1">
          <div className="adduser-rolebutton">
            <button
              type="button"
              className={`adduser-roleicon ${isSelected('zonaA') ? 'selected' : ''}`}
              id='zonaA'
              onClick={() => handleRoleToggle('zonaA')}
            >
              A
            </button>
            <span>Zona A</span>
          </div>
          <div className="adduser-rolebutton">
            <button
              type="button"
              id='zonaBC'
              className={`adduser-roleicon ${isSelected('zonaBC') ? 'selected' : ''}`}
              onClick={() => handleRoleToggle('zonaBC')}
            >
              BC
            </button>
            <span>Zona BC</span>
          </div>
          <div className="adduser-rolebutton">
            <button
              type="button"
              id='empaquetado'
              className={`adduser-roleicon ${isSelected('empaquetado') ? 'selected' : ''}`}
              onClick={() => handleRoleToggle('empaquetado')}
            >
              <GoPackageDependencies />
            </button>
            <span>Empaquetado</span>
          </div>
          <div className="adduser-rolebutton">
            <button
              type="button"
              id='jefeAlmacen'
              className={`adduser-roleicon ${isSelected('jefeAlmacen') ? 'selected' : ''}`}
              onClick={() => handleRoleToggle('jefeAlmacen')}
            >
              <IonIcon icon={cubeOutline} />
            </button>
            <span>Jefe de Almacén</span>
          </div>
        </div>
        <div className="adduser-roles-row2">
          <div className="adduser-rolebutton">
            <button
              type="button"
              id='credito'
              className={`adduser-roleicon ${isSelected('credito') ? 'selected' : ''}`}
              onClick={() => handleRoleToggle('credito')}
            >
              <IonIcon icon={walletOutline} />
            </button>
            <span>Crédito</span>
          </div>
          <div className="adduser-rolebutton">
            <button
              type="button"
              id='clientes'
              className={`adduser-roleicon ${isSelected('clientes') ? 'selected' : ''}`}
              onClick={() => handleRoleToggle('clientes')}
            >
              <IonIcon icon={chatbubbleOutline} />
            </button>
            <span>Atención a Clientes</span>
          </div>
          <div className="adduser-rolebutton">
            <button
              type="button"
              id='jefeAtencionClientes'
              className={`adduser-roleicon ${isSelected('jefeAtencionClientes') ? 'selected' : ''}`}
              onClick={() => handleRoleToggle('jefeAtencionClientes')}
            >
              <RiCustomerService2Line />
            </button>
            <span>Jefa de Atención a Clientes</span>
          </div>
          <div className="adduser-rolebutton">
            <button
              type="button"
              id='admin'
              className={`adduser-roleicon ${isSelected('Admin') ? 'selected' : ''}`}
              onClick={() => handleRoleToggle('Admin')}
            >
              <LiaUserShieldSolid />
            </button>
            <span>Admin</span>
          </div>
        </div>
      </div>
      <div id="adduser-lrg">
        <input 
          type="text" 
          placeholder='Contraseña...' 
          value={addContra}
          onChange={(e) => setAddContra(e.target.value)} 
        />
      </div>
      <button 
        type="submit" 
        className="adduser-submit"
      >
        {selectedUser ? 'Guardar Cambios' : 'Crear Usuario'}
      </button>
    </form>
  );
};

export default AddUser;
