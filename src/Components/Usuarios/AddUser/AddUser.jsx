import React, { useState } from 'react';
import "./AddUser.css";

// Iconos
import { IonIcon } from "@ionic/react";
import { GoPackageDependencies } from "react-icons/go";
import { LiaUserShieldSolid } from "react-icons/lia";
import { cubeOutline, chatbubbleOutline, walletOutline } from 'ionicons/icons';
import { RiCustomerService2Line } from "react-icons/ri";

// Base de datos
import { db } from "../../../firebaseConfig.jsx";
import { collection, addDoc } from "firebase/firestore";

const AddUser = () => {

  // Permisos seleccionados efecto
  const [selectedRoles, setSelectedRoles] = useState([]);
  const zonaRoles = ['zonaA', 'zonaBC', 'empaquetado'];

  const handleRoleClick = (role) => {
    if (zonaRoles.includes(role)) {
      setSelectedRoles((prev) => {
        if (prev.includes(role)) {
          return prev.filter(r => r !== role);
        } else {
          return [...prev.filter(r => zonaRoles.includes(r)), role];
        }
      });
    } else {
      setSelectedRoles([role]);
    }
  };

  const isSelected = (role) => selectedRoles.includes(role);

  // Funcionamiento para crear un usuario
  const [addNombre, setAddNombre] = useState('');
  const [addApellido, setAddApellido] = useState('');
  const [addContra, setAddContra] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (addNombre && addApellido && addContra && selectedRoles.length > 0) {
      try {
        const docRef = await addDoc(collection(db, 'usuarios'), {
          nombre: addNombre,
          apellido: addApellido,
          contrasena: addContra,
          permisos: selectedRoles.join(', ') // Guardar los roles seleccionados como una cadena separada por comas
        });
        console.log("Document written with ID: ", docRef.id);
  
        // Limpiar los campos del formulario después de agregar el usuario
        setAddNombre('');
        setAddApellido('');
        setAddContra('');
        setSelectedRoles([]);
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    } else {
      alert('Por favor completa todos los campos antes de enviar.');
    }
  };

  return (
    <>

      <form onSubmit={handleSubmit} className="newuser-card">
          <h2>Agregar usuario</h2>
            <div className="adduser-datos">
              <div className="adduser-nombre">
                <input 
                  type="text" 
                  placeholder='Nombre...' 
                  value={addNombre}
                  onChange={(e) => setAddNombre(e.target.value)}
                  required
                />
              </div>
              <div className="adduser-apellido">
                <input 
                  type="text" 
                  placeholder='Apellido...' 
                  value={addApellido}
                  onChange={(e) => setAddApellido(e.target.value)}
                  required
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
                    onClick={() => handleRoleClick('zonaA')}
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
                    onClick={() => handleRoleClick('zonaBC')}
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
                    onClick={() => handleRoleClick('empaquetado')}
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
                    onClick={() => handleRoleClick('jefeAlmacen')}
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
                    onClick={() => handleRoleClick('credito')}
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
                    onClick={() => handleRoleClick('clientes')}
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
                    onClick={() => handleRoleClick('jefeAtencionClientes')}
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
                    onClick={() => handleRoleClick('Admin')}
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
                  required
                />
            </div>  
            <button className="adduser-submit">Agregar</button>      
      </form>
    </>
  );
};

export default AddUser;
