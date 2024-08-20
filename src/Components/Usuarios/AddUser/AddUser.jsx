import React, { useState, useEffect } from 'react';
import "./AddUser.css";
import { IonIcon } from "@ionic/react";
import { GoPackageDependencies } from "react-icons/go";
import { LiaUserShieldSolid } from "react-icons/lia";
import { cubeOutline, chatbubbleOutline, walletOutline } from 'ionicons/icons';
import { RiCustomerService2Line } from "react-icons/ri";

const AddUser = ({ selectedUser }) => {
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
      // Limpiar el formulario cuando no hay usuario seleccionado
      setAddNombre('');
      setAddApellido('');
      setAddContra('');
      setSelectedRoles([]);
    }
  }, [selectedUser]);

  const isSelected = (role) => selectedRoles.includes(role);

  if (!selectedUser) {
    return (
      <div className="newuser-card">
        <p>No hay ningún usuario seleccionado.</p>
        <p>Seleccione un usuario para ver su información o</p>
        <button 
          className="adduser-submit" 
          onClick={() => {
            setAddNombre('');
            setAddApellido('');
            setAddContra('');
            setSelectedRoles([]);
          }}>
          Crear Nuevo Usuario
        </button>
      </div>
    );
  }

  return (
    <form className="newuser-card">
      <h2>Información de usuario</h2>
      <div className="adduser-datos">
        <div className="adduser-nombre">
          <input 
            type="text" 
            placeholder='Nombre...' 
            value={addNombre}
            readOnly={!selectedUser} // Hacer editable solo si no hay un usuario seleccionado
          />
        </div>
        <div className="adduser-apellido">
          <input 
            type="text" 
            placeholder='Apellido...' 
            value={addApellido}
            readOnly={!selectedUser} // Hacer editable solo si no hay un usuario seleccionado
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
              disabled={!selectedUser}
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
              disabled={!selectedUser}
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
              disabled={!selectedUser}
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
              disabled={!selectedUser}
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
              disabled={!selectedUser}
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
              disabled={!selectedUser}
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
              disabled={!selectedUser}
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
              disabled={!selectedUser}
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
          readOnly={!selectedUser} // Hacer editable solo si no hay un usuario seleccionado
        />
      </div>
    </form>
  );
};

export default AddUser;
