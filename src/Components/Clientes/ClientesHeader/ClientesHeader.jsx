import React, { useState } from 'react';
import { IonIcon } from "@ionic/react";
import { searchOutline, closeOutline, walletOutline } from 'ionicons/icons';
import { TbFileUpload } from "react-icons/tb";
import { TbPackageImport } from "react-icons/tb";
import { LuFileBox } from "react-icons/lu";
import * as XLSX from 'xlsx'; // Importar XLSX para manejar Excel
import { db } from '../../../firebaseConfig'; // Configuración de Firebase
import { collection, doc, setDoc, addDoc } from 'firebase/firestore'; // Firestore
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
  const [creditoActivo, setCreditoActivo] = useState(false); // Estado para manejar "Crédito"
  const [searchTerm, setSearchTerm] = useState(""); // Estado para el término de búsqueda
  const [filteredPedidos, setFilteredPedidos] = useState([]); // Pedidos filtrados


  const toggleCredito = () => {
    setCreditoActivo((prev) => {
      console.log(`Crédito activado: ${!prev}`);
      return !prev;
    });
  };
  

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
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const processFile = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });

      // Suponiendo que el primer sheet tiene los datos
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      let jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Limpiar filas vacías
      jsonData = jsonData.filter((row) =>
        row.some((cell) => cell !== null && cell !== undefined && cell !== "")
      );

      // Validar si jsonData tiene contenido
      if (jsonData.length === 0) {
        console.error('El archivo Excel está vacío o no tiene datos válidos.');
        return;
      }

      // Obtener los índices de las columnas según los títulos
      const headers = jsonData[0];
      const indexPedido = headers.indexOf('no_ped');
      const indexCliente = headers.indexOf('agcrcte');
      const indexNombreCliente = headers.indexOf('nom_cte');
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
      if (
        indexPedido === -1 ||
        indexCliente === -1 ||
        indexNombreCliente === -1 ||
        indexNumeroProducto === -1 ||
        indexCantidadProducto === -1 ||
        indexPrecioProducto === -1
      ) {
        console.error('No se encontraron todas las columnas necesarias en el archivo Excel.');
        return;
      }

      // Extraer los datos generales del pedido y guardarlos en el estado
      setPedidoNumero(String(jsonData[1][indexPedido]));
      setNumeroCliente(String(jsonData[1][indexCliente]));
      setZona(String(jsonData[1][indexZona] || ""));
      setSubZona(String(jsonData[1][indexSubZona] || ""));
      setNombreCliente(
        capitalizeWords(String(jsonData[1][indexNombreCliente] || ""))
      );

      // Procesar productos y validarlos
      const productosProcesados = jsonData.slice(1).map((row, index) => {
        if (
          row[indexNumeroProducto] &&
          row[indexCantidadProducto] &&
          row[indexPrecioProducto]
        ) {
          return {
            numeroProducto: row[indexNumeroProducto],
            cantidadProducto: row[indexCantidadProducto],
            precioProducto: row[indexPrecioProducto],
            ivaProducto: row[indexIvaProducto] || 0,
            descuento1: row[indexDescuento1] || 0,
            descuento2: row[indexDescuento2] || 0,
            descripcionProducto: row[indexDescripcionProducto] || "",
            lugarAlmacenamiento: row[indexLugarAlmacenamiento] || "",
          };
        } else {
          console.warn(
            `Fila inválida detectada en índice ${index + 1}:`,
            row
          );
          return null;
        }
      });

      // Filtrar productos válidos
      const productosValidos = productosProcesados.filter(
        (producto) => producto !== null
      );

      setProductos(productosValidos);

      console.log('Datos procesados:', {
        pedidoNumero: jsonData[1][indexPedido],
        numeroCliente: jsonData[1][indexCliente],
        nombreCliente: jsonData[1][indexNombreCliente],
        productos: productosValidos,
      });
    };
    reader.readAsArrayBuffer(file);
  };

  const saveOrderToFirebase = async () => {
    if (typeof pedidoNumero !== 'string' || pedidoNumero.trim() === '') {
      console.error('Número de pedido no válido:', pedidoNumero);
      return;
    }

    if (!numeroCliente || !salida || productos.length === 0) {
      console.error('Faltan datos del pedido, asegúrese de haber subido un archivo válido y seleccionado una opción de salida.');
      return;
    }

    try {
      let estado;

if (creditoActivo) {
  estado = 'Pendiente de aprobación'; // No se inicia proceso, solo espera autorización
} else {
  estado = 'En espera - Zona BC';

  const perteneceZonaA = productos.some(
    (producto) =>
      producto.lugarAlmacenamiento &&
      producto.lugarAlmacenamiento.toUpperCase().startsWith('A')
  );

  if (perteneceZonaA) {
    estado = 'En espera - Zona A';
  }
}

      const timestampActual = new Date();
      const pedidoRef = doc(db, 'pedidos', pedidoNumero);

      await setDoc(pedidoRef, {
        numeroPedido: pedidoNumero,
        numeroCliente: numeroCliente,
        nombreCliente: nombreCliente,
        salida: salida,
        activo: true,
        backorder: false,
        prioridad: false,
        estado: estado,
        zona: creditoActivo ? '' : zona, // La zona solo aplica si no es crédito
      subZona: creditoActivo ? '' : subZona,
        timestamp: timestampActual,
        historialEstados: [
          {
            estado: estado,
            timestampInicio: timestampActual,
          },
        ],
        credito: creditoActivo, // Agregar información de crédito
      });

      const productosCollectionRef = collection(pedidoRef, 'productos');
      productos.forEach(async (producto) => {
        await addDoc(productosCollectionRef, producto);
      });

      console.log('Pedido guardado con éxito en Firebase.');
      resetForm();
    } catch (error) {
      console.error('Error al guardar el pedido en Firebase:', error);
    }
  };

  const resetForm = () => {
    setFile(null);
    setPedidoNumero("");
    setNumeroCliente("");
    setZona("");
    setSubZona("");
    setNombreCliente("");
    setProductos([]);
    setSalida("");
    setCreditoActivo(false); // Resetear el estado de crédito
    setIsFormVisible(false);
    setIsDragging(false);
    document.getElementById('file-input').value = '';
  };

  const handleFileRemove = () => {
    resetForm();
  };

  const handleFormShow = () => {
    setIsFormVisible(!isFormVisible);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
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
    setSalida(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
  
    if (creditoActivo && !salida) {
      alert("Debes seleccionar si el pedido es para Ruta o Mostrador al activar Crédito.");
      return;
    }
  
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
                className={`subir-archivo ${isDragging ? 'dragging' : ''} ${file ? 'file-present' : ''}`}
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
                <button id='clientes-credito' onClick={toggleCredito}>
                  <IonIcon icon={walletOutline} />
                </button>
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
