import React, { useState, useEffect } from 'react';
import "./AddUser.css";
import { IonIcon } from "@ionic/react";
import { GoPackageDependencies } from "react-icons/go";
import { LiaUserShieldSolid } from "react-icons/lia";
import { cubeOutline, chatbubbleOutline, walletOutline } from 'ionicons/icons';
import { RiCustomerService2Line } from "react-icons/ri";
import { db } from '../../../firebaseConfig'; // Importa la configuración de Firebase
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";

const AddUser = ({ selectedUser, setSelectedUser }) => {  // Recibe setSelectedUser como prop
  const [addNombre, setAddNombre] = useState('');
  const [addApellido, setAddApellido] = useState('');
  const [addContra, setAddContra] = useState('');
  const [selectedRoles, setSelectedRoles] = useState([]);

  const [isFormValid, setIsFormValid] = useState(false);

  const combinableRoles = ["zonaA", "zonaBC", "empaquetado"];
  const uniqueRoles = ["Admin", "jefeAlmacen", "credito", "clientes", "jefeAtencionClientes"];

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

  useEffect(() => {
    // Validar si todos los campos están llenos y al menos un rol está seleccionado
    const isValid = addNombre && addApellido && addContra && selectedRoles.length > 0;
    setIsFormValid(isValid);
  }, [addNombre, addApellido, addContra, selectedRoles]);

  const isSelected = (role) => selectedRoles.includes(role);

  const handleRoleToggle = (role) => {
    if (combinableRoles.includes(role)) {
      setSelectedRoles((prevRoles) => {
        const newRoles = prevRoles.filter(r => !uniqueRoles.includes(r));
        if (newRoles.includes(role)) {
          return newRoles.filter(r => r !== role);
        } else {
          return [...newRoles, role];
        }
      });
    } else {
      setSelectedRoles([role]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Evitar que la página se recargue

    const newUser = {
      nombre: addNombre,
      apellido: addApellido,
      contrasena: addContra,
      permisos: selectedRoles.join(', '),
    };

    try {
      if (selectedUser) {
        // Actualizar el usuario existente en Firestore
        const userDocRef = doc(db, "usuarios", selectedUser.id);
        await updateDoc(userDocRef, newUser);
      } else {
        // Crear un nuevo usuario en Firestore
        const docRef = await addDoc(collection(db, "usuarios"), newUser);
        console.log("Usuario agregado con ID: ", docRef.id);
      }

      // Limpia el formulario y restablece selectedUser después de crear o actualizar el usuario
      setAddNombre('');
      setAddApellido('');
      setAddContra('');
      setSelectedRoles([]);
      setSelectedUser(null); // Restablecer el estado de selectedUser a null
    } catch (error) {
      console.error("Error al guardar el usuario: ", error);
      alert(`Error al guardar el usuario: ${error.message || 'Error desconocido'}`);
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
              className={`adduser-roleicon ${isSelected('admin') ? 'selected' : ''}`}
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
        disabled={!isFormValid} // Deshabilitar el botón si el formulario no es válido
      >
        {selectedUser ? 'Guardar Cambios' : 'Crear Usuario'}
      </button>
    </form>
  );
};

export default AddUser;
