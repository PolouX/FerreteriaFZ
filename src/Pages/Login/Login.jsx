import React, { useState } from 'react';
import './Login.css';
import { LiaUserShieldSolid } from "react-icons/lia";
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const Login = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log("Iniciar sesión clicado");

    try {
      const docRef = doc(db, "usuarios", "79VRcY3RIKs0Pr6V4s5x"); // Asegúrate de que este ID sea correcto
      console.log("Buscando documento con ID:", docRef.id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        console.log("Documento encontrado");
        const userData = docSnap.data();
        console.log("Datos del usuario:", userData);
        if (userData.contraseña === password) {
          console.log("Contraseña correcta");
          navigate('/admin/usuarios');
        } else {
          console.log("Contraseña incorrecta");
          setError('Contraseña incorrecta');
        }
      } else {
        console.log("No se encontró el documento");
        setError('Usuario no encontrado');
      }
    } catch (error) {
      console.error("Error obteniendo el documento:", error);
      setError('Error obteniendo el documento');
    }
  };

  return (
    <>
      <div className="content">
        <div className="wrapper">
          <form onSubmit={handleLogin}>
            <div className="heading">
              <img src="./src/Assets/Logo.png" alt="Logo de ferreterias zapopan" width='50px'/>
              <h1>¡Inicia sesión!</h1>
              <p>Ingresa tus datos para continuar.</p>
            </div>

            <div className="contra">
              <p>Contraseña</p>
              <div className="input-container">
                <LiaUserShieldSolid className='icon'/>
                <input 
                  type="password" 
                  placeholder='Ingrese su contraseña...' 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required
                />
              </div>
            </div>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <button type='submit'>Iniciar sesión</button>
          </form>
        </div>
      </div>
      <div className="gradiante">
        <div className="titulo">
          <h1>¡Bienvenido de vuelta!</h1>
          <p>Gestiona tus pedidos con facilidad: crea, revisa, surte y factura de manera eficiente.</p>
        </div>
        <img src="./src/Assets/Dashboard.png" alt=""/>
      </div>    
    </>
  )
}

export default Login;
