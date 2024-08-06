import React, { useState, useContext } from 'react';
import './Login.css';
import { LiaUserShieldSolid } from "react-icons/lia";
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import AuthContext from '../../AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { setIsAuthenticated } = useContext(AuthContext);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");
  const handleInputChange = async (e) => {
    setInputValue(e.target.value);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log(inputValue);

    const usuarios = collection(db, "usuarios");
    const q = query(usuarios, where('contrasena', '==', inputValue));

    try {
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.log('Contraseña incorrecta');
        setInputValue("");
        setError("¡Contraseña incorrecta!");
      } else {
        const doc = querySnapshot.docs[0];
        setError("");
        setIsAuthenticated(true);
        
        navigate("/admin/usuarios");
      }
    } catch (err) {
      console.log('Error buscando el usuario');
      setError("Error buscando al usuario");
    }
  };

  return (
    <>
      <div className="content">
        <div className="wrapper">
          <form onSubmit={handleLogin}>
            <div className="heading">
              <img src="./src/Assets/Logo.png" alt="Logo de ferreterias zapopan" width='50px' />
              <h1>¡Inicia sesión!</h1>
              <p>Ingresa tus datos para continuar.</p>
            </div>

            <div className="contra">
              <p>Contraseña</p>
              <div className={`input-container ${error ? 'login-input-error' : ''}`}>
                <LiaUserShieldSolid className='icon' />
                <input
                  type="password"
                  onChange={handleInputChange}
                  value={inputValue}
                  placeholder='Ingrese su contraseña...'
                  required
                />
              </div>
              {error && <p className='login_error'>{error}</p>}
            </div>
            
            <button className="login_boton" type='submit'>Iniciar sesión</button>
          </form> 
        </div>
      </div>
      <div className="gradiante">
        <div className="titulo">
          <h1>¡Bienvenido de vuelta!</h1>
          <p>Gestiona tus pedidos con facilidad: crea, revisa, surte y factura de manera eficiente.</p>
        </div>
        <img src="./src/Assets/Dashboard.png" alt="" />
      </div>
    </>
  );
}

export default Login;
