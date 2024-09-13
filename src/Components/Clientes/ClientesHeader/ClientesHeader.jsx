import React, { useState } from 'react';
import { IonIcon } from "@ionic/react";
import { searchOutline, closeOutline } from 'ionicons/icons';
import { TbFileUpload } from "react-icons/tb";
import { TbPackageImport } from "react-icons/tb";
import { LuFileBox } from "react-icons/lu";
import * as XLSX from 'xlsx'; // Importar XLSX para manejar Excel
import { db } from '../../../firebaseConfig'; // Asegúrate de importar tu configuración de Firebase
import { collection, doc, setDoc, addDoc } from 'firebase/firestore'; // Importar addDoc
import "./ClientesHeader.css";

const ClientesHeader = () => {
  const [file, setFile] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false); // Estado para manejar el arrastre
  const [salida, setSalida] = useState(""); // Estado para el tipo de salida
  const [pedidoNumero, setPedidoNumero] = useState(""); // Estado para almacenar el número de pedido
  const [numeroCliente, setNumeroCliente] = useState(""); // Estado para almacenar el número de cliente
  const [nombreCliente, setNombreCliente] = useState(""); // Estado para almacenar el nombre del cliente
  const [productos, setProductos] = useState([]); // Estado para almacenar los productos procesados
  const [zona, setZona] = useState("");
  const [subZona, setSubZona] = useState("");
  const [clientesFilters, setClientesFilters] = useState("Activos");
  
  const handleFileClick = () => {
    document.getElementById('file-input').click();
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      processFile(selectedFile);
    }
  };

  const capitalizeWords = (str) => {
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const processFile = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });

      // Suponiendo que el primer sheet tiene los datos
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Validar si jsonData tiene contenido
      if (jsonData.length === 0) {
        console.error('El archivo Excel está vacío o no tiene datos válidos.');
        return;
      }

      // Obtener los índices de las columnas según los títulos
      const headers = jsonData[0];
      const indexPedido = headers.indexOf('no_ped');
      const indexCliente = headers.indexOf('agcrcte');
      const indexNombreCliente = headers.indexOf('nom_cte'); // Índice para la columna de nombre del cliente
      const indexNumeroProducto = headers.indexOf('cve_prod');
      const indexCantidadProducto = headers.indexOf('cant_prod');
      const indexPrecioProducto = headers.indexOf('valor_prod');
      const indexIvaProducto = headers.indexOf('iva_prod');
      const indexDescuento1 = headers.indexOf('dcto1');
      const indexDescuento2 = headers.indexOf('dcto2');
      const indexDescripcionProducto = headers.indexOf('desc_prod');
      const indexLugarAlmacenamiento = headers.indexOf('local');
      const indexZona = headers.indexOf('nom_zon');
      const indexSubZona = headers.indexOf('nom_sub');

      // Validar si los índices son válidos
      if (indexPedido === -1 || indexCliente === -1 || indexNombreCliente === -1 || indexNumeroProducto === -1 || indexCantidadProducto === -1 || indexPrecioProducto === -1 || indexIvaProducto === -1 || indexDescuento1 === -1 || indexDescuento2 === -1 || indexDescripcionProducto === -1 || indexLugarAlmacenamiento === -1 || indexZona === -1 || indexSubZona === -1) {
        console.error('No se encontraron todas las columnas necesarias en el archivo Excel.');
        return;
      }

      // Extraer los datos generales del pedido y guardarlos en el estado
      setPedidoNumero(String(jsonData[1][indexPedido])); // Asegurar que sea una cadena de texto
      setNumeroCliente(String(jsonData[1][indexCliente])); // Asegurar que sea una cadena de texto
      setZona(String(jsonData[1][indexZona]));
      setSubZona(String(jsonData[1][indexSubZona]));
      const formattedNombreCliente = capitalizeWords(String(jsonData[1][indexNombreCliente]));

      setNombreCliente(formattedNombreCliente);

      // Procesar productos y guardarlos en el estado
      const productosProcesados = jsonData.slice(1).map(row => ({
        numeroProducto: row[indexNumeroProducto], // Número de producto
        cantidadProducto: row[indexCantidadProducto], // Cantidad de producto
        precioProducto: row[indexPrecioProducto], // Precio de producto
        ivaProducto: row[indexIvaProducto], // IVA de producto
        descuento1: row[indexDescuento1], // Descuento 1
        descuento2: row[indexDescuento2], // Descuento 2
        descripcionProducto: row[indexDescripcionProducto], // Descripción de producto
        lugarAlmacenamiento: row[indexLugarAlmacenamiento] || '', // Lugar de almacenamiento
      }));

      setProductos(productosProcesados);

      console.log('Datos procesados:', { pedidoNumero: jsonData[1][indexPedido], numeroCliente: jsonData[1][indexCliente], nombreCliente: jsonData[1][indexNombreCliente], productos: productosProcesados });
    };
    reader.readAsArrayBuffer(file);
  };

  const saveOrderToFirebase = async () => {
    // Verificar que pedidoNumero sea una cadena de texto válida
    if (typeof pedidoNumero !== 'string' || pedidoNumero.trim() === '') {
      console.error('Número de pedido no válido:', pedidoNumero);
      return;
    }

    if (!numeroCliente || !salida || productos.length === 0) {
      console.error('Faltan datos del pedido, asegúrese de haber subido un archivo válido y seleccionado una opción de salida.');
      return;
    }

    try {
      // Determinar el valor de 'estado' basado en los productos
      let estado = 'Zona BC'; // Valor por defecto

      // Verificar si algún producto tiene lugarAlmacenamiento que comience con "A"
      const hasZonaA = productos.some(producto => producto.lugarAlmacenamiento && producto.lugarAlmacenamiento.startsWith('A'));
      
      if (hasZonaA) {
        estado = 'Zona A'; // Si alguno empieza con "A", cambiar a "Zona A"
      }

      // Usar el número de pedido como ID para el documento
      const pedidoRef = doc(db, 'pedidos', pedidoNumero);

      // Crear un nuevo documento para el pedido en la colección 'pedidos'
      await setDoc(pedidoRef, {
        numeroPedido: pedidoNumero,
        numeroCliente: numeroCliente,
        nombreCliente: nombreCliente, // Guardar el nombre del cliente extraído del Excel
        salida: salida, // Guardar el tipo de salida seleccionado
        activo: true,   // Iniciar como activo
        backorder: false, // Iniciar como no backorder
        estado: estado,  // Estado determinado
        zona: zona,
        subZona: subZona
      });

      // Agregar productos a la subcolección 'productos' dentro del documento de pedido
      const productosCollectionRef = collection(pedidoRef, 'productos');
      productos.forEach(async (producto) => {
        await addDoc(productosCollectionRef, producto);
      });

      console.log('Pedido guardado con éxito en Firebase.');

      // Reiniciar el formulario
      resetForm();
    } catch (error) {
      console.error('Error al guardar el pedido en Firebase:', error);
    }
  };

  const resetForm = () => {
    // Reiniciar todos los estados
    setFile(null);
    setPedidoNumero("");
    setNumeroCliente("");
    setZona("");
    setSubZona("");
    setNombreCliente(""); // Reiniciar nombreCliente
    setProductos([]);
    setSalida("");
    setIsFormVisible(false);
    setIsDragging(false);
    document.getElementById('file-input').value = ''; // Reinicia el valor del input
  };

  const handleFileRemove = () => {
    resetForm(); // Usa la función de reinicio de formulario para limpiar todo
  };

  const handleFormShow = () => {
    setIsFormVisible(!isFormVisible);
  };

  // Manejadores para drag and drop
  const handleDragOver = (event) => {
    event.preventDefault(); // Evitar que el navegador maneje el archivo
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      processFile(droppedFile);
    }
    setIsDragging(false);
  };

  const handleSalidaChange = (event) => {
    setSalida(event.target.value); // Actualizar el tipo de salida seleccionado
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    saveOrderToFirebase();
  };


  return (
    <>
      <div className="clientes-header">
        <div className="clientes-left-filters">
          <button className={clientesFilters === "Activos" ? "clientesFilterSelected " : ""} onClick={() => setClientesFilters("Activos")}>
            Activos
          </button>
          <button className={clientesFilters === "Facturas" ? "clientesFilterSelected " : ""} onClick={() => setClientesFilters("Facturas")}>Facturas</button>
        </div>

        <div className="clientes-right-filters">
          <div className="clientes-search">
            <IonIcon icon={searchOutline} className='clientes-search-icon' />
            <input type="text" placeholder='Buscar un pedido...' />
          </div>
          <button onClick={handleFormShow}>Capturar</button>

          {isFormVisible && (
            <form className={`clientes-form ${isFormVisible ? 'visible' : ''}`} onSubmit={handleSubmit}>
              <button type="button" className="clientes-close-form" onClick={handleFormShow}>
                <IonIcon icon={closeOutline} />
              </button>
              <div className="clientes-form-header">
                <TbFileUpload id='clientes-header-icon' />
                <h2>Subir Pedido </h2>
              </div>

              <input
                type="file"
                id="file-input"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />

              <div
                onClick={file ? null : handleFileClick}
                className={`subir-archivo ${isDragging ? 'dragging' : ''} ${file ? 'file-present' : ''}`} // Añadir clase file-present si hay un archivo
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {file ? (
                  <div className="archivo-subido">
                    <LuFileBox />
                    <div className="archivo-info">
                      <p>{file.name}</p>
                      <button type="button" onClick={handleFileRemove} className="clientes-borrar-archivo">
                        <IonIcon icon={closeOutline} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <TbPackageImport className='clientes-subir-icon' />
                    <p>Arrastra tu archivo o <a href="#" onClick={(e) => { e.preventDefault(); handleFileClick(); }}>Explora</a></p>
                  </>
                )}
              </div>
              <div className="clientes-checkbox">
                <span className="clientes-opciones">
                  <input type="radio" name='salida' value="Mostrador" onChange={handleSalidaChange} />
                  <p>Mostrador</p>
                </span>
                <span className="clientes-opciones">
                  <input type="radio" name='salida' value="Ruta" onChange={handleSalidaChange} />
                  <p>Ruta</p>
                </span>
              </div>
              <button type="submit" className="clientes-enviar-form">Confirmar</button>
            </form>
          )}
        </div>
      </div>
      <div className="clientes-content">
      </div>
    </>
  );
};

export default ClientesHeader;
