import React, { useState } from 'react';
import { IonIcon } from "@ionic/react";
import { getAuth } from "firebase/auth";
import { searchOutline, closeOutline, walletOutline } from 'ionicons/icons';
import { TbFileUpload } from "react-icons/tb";
import { TbPackageImport } from "react-icons/tb";
import { LuFileBox } from "react-icons/lu";
import * as XLSX from 'xlsx'; // Importar XLSX para manejar Excel
import { db } from '../../../firebaseConfig'; // Configuración de Firebase
import { collection, doc, setDoc, addDoc } from 'firebase/firestore'; // Firestore
import "./ClientesHeader.css";
import AuthContext from '../../../AuthContext';
import { useContext } from 'react';

const ClientesHeader = () => {
  const [file, setFile] = useState(null);
  const { user } = useContext(AuthContext);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false); // Estado para manejar el arrastre
  const [salida, setSalida] = useState("Ruta"); // Aquí predefinimos como "Ruta"
  const [pedidoNumero, setPedidoNumero] = useState(""); // Estado para almacenar el número de pedido
  const [nota, setNota] = useState(""); // Para almacenar la nota del pedido
  const [isNoteModalVisible, setIsNoteModalVisible] = useState(false); // Estado para el modal de la nota
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
      const indexAlmacen = headers.indexOf('agcrlug');
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
      //setPedidoNumero(String(jsonData[1][indexPedido]));
      const pedidoNumeroExtraido = String(jsonData[1][indexPedido] || "").trim();
if (!pedidoNumeroExtraido) {
  console.error("Número de pedido extraído del Excel es inválido:", jsonData[1][indexPedido]);
} else {
  console.log("Número de pedido extraído del Excel:", pedidoNumeroExtraido);
}
setPedidoNumero(pedidoNumeroExtraido);

      setNumeroCliente(String(jsonData[1][indexCliente]));
      setZona(String(jsonData[1][indexZona] || ""));
      setSubZona(String(jsonData[1][indexSubZona] || ""));
      setNombreCliente(
        capitalizeWords(String(jsonData[1][indexNombreCliente] || ""))
      );

// Detección de "VALLARTA"
const indexLugar = headers.indexOf('agcrlug'); // Cambia según el encabezado correcto
if (indexLugar !== -1) {
    const esDeVallarta = jsonData.some(
        (row, idx) => idx !== 0 && String(row[indexLugar]).toUpperCase() === "VALLARTA"
    );

    if (esDeVallarta) {
        const pedidoNumeroDirecto = String(jsonData[1][indexPedido] || "").trim();
        const nombreClienteDirecto = String(jsonData[1][indexNombreCliente] || "").trim(); // Obtener nombre del cliente
        
        // Validar número de pedido
        if (!pedidoNumeroDirecto) {
            console.error("Número de pedido no válido antes de llamar a handleVallarta:", pedidoNumeroDirecto);
            return;
        }

        // Validar nombre del cliente
        if (!nombreClienteDirecto) {
            console.error("Nombre del cliente no válido antes de llamar a handleVallarta:", nombreClienteDirecto);
            return;
        }

        console.log("Número de pedido directo para Vallarta:", pedidoNumeroDirecto);
        console.log("Nombre del cliente antes de handleVallarta:", nombreClienteDirecto);

        // Llamar a handleVallarta
        handleVallarta(jsonData, headers, pedidoNumeroDirecto, nombreClienteDirecto);
    }
}
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
            almacen: row[indexAlmacen],
          };
        } else {
          console.warn(
            `Fila inválida detectada en índice ${index + 1}:`,
          );
          return null;
        }
      });

      const calcularConteos = (pedidos) => {
        const activos = pedidos.filter((pedido) => pedido.estado !== "Finalizado" && pedido.estado !== "Pendiente de aprobación").length;
        const pendientes = pedidos.filter((pedido) => pedido.estado === "Pendiente de aprobación").length;
        const facturas = pedidos.filter((pedido) => pedido.estado === "Finalizado").length;
      
        setConteosClientes({ activos, pendientes, facturas });
      };

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

  //---------------------
  const saveOrderToFirebase = async () => {
    if (typeof pedidoNumero !== "string" || pedidoNumero.trim() === "") {
      console.error("Número de pedido no válido:", pedidoNumero);
      return;
    }
  
    if (!numeroCliente || !salida || productos.length === 0) {
      console.error(
        "Faltan datos del pedido, asegúrese de haber subido un archivo válido y seleccionado una opción de salida."
      );
      return;
    }
  
    try {
      const capturadoPor = {
        nombre: user?.nombre,
        apellido: user?.apellido,
      };
  
      // Declara y asigna el valor a "estado"
      let estado;
  
      // Detectar si todos los lugares de almacenamiento están vacíos
      const lugarVacio = productos.every(
        (producto) =>
          !producto.lugarAlmacenamiento ||
          producto.lugarAlmacenamiento.trim() === ""
      );
  
      if (creditoActivo) {
        // Si crédito está activo, pasa a "Pendiente de aprobación"
        estado = "Pendiente de aprobación";
      } else if (lugarVacio) {
        // Si no hay crédito y los lugares están vacíos, pasa a "Finalizado"
        estado = "Finalizado";
      } else {
        // Si no hay crédito y los lugares están llenos, sigue flujo normal
        estado = "En espera - Zona BC";
  
        const perteneceZonaA = productos.some(
          (producto) =>
            producto.lugarAlmacenamiento &&
            producto.lugarAlmacenamiento.toUpperCase().startsWith("A")
        );
  
        if (perteneceZonaA) {
          estado = "En espera - Zona A";
        }
      }
  
      const timestampActual = new Date();
  
      const pedidoRef = doc(db, "pedidos", String(pedidoNumero).trim());
      console.log("Guardando pedido con referencia:", String(pedidoNumero).trim());
  
      await setDoc(pedidoRef, {
        numeroPedido: pedidoNumero,
        numeroCliente: numeroCliente,
        nombreCliente: nombreCliente,
        salida: salida,
        nota: nota,
        activo: true,
        backorder: false,
        prioridad: false,
        estado: estado,
        capturadoPor: capturadoPor,
        zona: zona,
        almacen: productos[0]?.almacen || "",
        subZona: subZona,
        timestamp: timestampActual,
        historialEstados: [
          {
            estado: estado,
            timestampInicio: timestampActual,
          },
        ],
        credito: creditoActivo, // Indica si el pedido es de crédito
      });
  
      const productosCollectionRef = collection(pedidoRef, "productos");
      productos.forEach(async (producto) => {
        await addDoc(productosCollectionRef, producto);
      });
  
      console.log(`Pedido guardado con éxito con estado: ${estado}`);
      resetForm();
    } catch (error) {
      console.error("Error al guardar el pedido en Firebase:", error);
    }
  };
  
  
  //------------------------
  const aprobarCredito = async (pedidoNumero) => {
    try {
      // Referencia al pedido en la base de datos
      const pedidoRef = doc(db, "pedidos", pedidoNumero);
      const pedidoSnap = await pedidoRef.get();
  
      if (!pedidoSnap.exists) {
        console.error(`El pedido ${pedidoNumero} no existe.`);
        return;
      }
  
      const pedidoData = pedidoSnap.data();
  
      // Verificar si todos los productos tienen "local" vacío
      const productosCollectionRef = collection(pedidoRef, "productos");
      const productosSnap = await productosCollectionRef.get();
      const productos = productosSnap.docs.map((doc) => doc.data());
  
      const lugarVacio = productos.every(
        (producto) =>
          !producto.lugarAlmacenamiento ||
          producto.lugarAlmacenamiento.trim() === ""
      );
  
      // Cambiar estado según condiciones
      const nuevoEstado = lugarVacio ? "Finalizado" : "En espera - Zona BC";
  
      // Actualizar estado
      await setDoc(
        pedidoRef,
        {
          estado: nuevoEstado,
          historialEstados: [
            ...pedidoData.historialEstados,
            {
              estado: nuevoEstado,
              timestampInicio: new Date(),
            },
          ],
        },
        { merge: true }
      );
  
      console.log(
        `Pedido ${pedidoNumero} aprobado por crédito y actualizado a ${nuevoEstado}.`
      );
    } catch (error) {
      console.error(`Error al aprobar el pedido ${pedidoNumero}:`, error);
    }
  };  

//-----------------------------  

  const resetForm = () => {
    setFile(null);
    setPedidoNumero("");
    setNumeroCliente("");
    setZona("");
    setSubZona("");
    setNombreCliente("");
    setProductos([]);
    setSalida("Ruta");
    setNota("");
    setCreditoActivo(false); // Resetear el estado de crédito
    setIsFormVisible(false);
    setIsDragging(false);
    document.getElementById('file-input').value = '';
  };

  //VALLARTA -----------------------------------
  const handleVallarta = (data, headers, pedidoNumero, nombreCliente) => {
    const indexCodigo = headers.indexOf('cve_prod');
    const indexDescripcion = headers.indexOf('desc_prod');
    const indexCantidad = headers.indexOf('cant_prod');
  
    const productosVallarta = data
      .slice(1) // Ignorar encabezado
      .filter((row) => row[headers.indexOf('agcrlug')].toUpperCase() === "VALLARTA")
      .map((row) => ({
        codigo: row[indexCodigo] || "",
        descripcion: row[indexDescripcion] || "",
        cantidad: row[indexCantidad] || "",
      }));
      console.log("Nombre del cliente dentro de handleVallarta:", nombreCliente);
    printFormatoSurtir(productosVallarta, pedidoNumero, nombreCliente);
  };
  
  const printFormatoSurtir = (productos, pedidoNumero, nombreCliente) => {
    console.log("Nombre del cliente:", nombreCliente);
    const contenido = productos
        .map((producto) => `
            <tr>
                <td>${producto.codigo}</td>
                <td>${producto.descripcion}</td>
                <td>${producto.cantidad}</td>
            </tr>
        `)
        .join("");

    const ventana = window.open("", "Imprimir", "height=600,width=800");
    ventana.document.write(`
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    font-size: 12px;
                    margin: 20px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 10px;
                }
                th, td {
                    border: 1px solid black;
                    padding: 5px;
                    text-align: left;
                }
                .header {
                    margin-bottom: 15px;
                }
                .header h2 {
                    font-size: 16px;
                }
                .header p {
                    font-size: 12px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h2>Formato de Surtir - VALLARTA</h2>
                <p><strong>Número de Pedido:</strong> ${pedidoNumero}</p>
                <p><strong>Nombre del Cliente:</strong> ${nombreCliente}</p>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Código</th>
                        <th>Descripción</th>
                        <th>Cantidad</th>
                    </tr>
                </thead>
                <tbody>
                    ${contenido}
                </tbody>
            </table>
        </body>
        </html>
    `);
    ventana.document.close();
    ventana.print();
};

  
  const finalizarPedidoVallarta = async (pedidoNumero, nombreCliente, numeroCliente, zona, subZona, salida) => {
    try {
      const pedidoNumeroStr = String(pedidoNumero).trim();
      if (!pedidoNumeroStr) {
        console.error("Número de pedido no válido:", pedidoNumero);
        return;
      }
  
      if (!pedidoNumero || typeof pedidoNumero !== "string" || pedidoNumero.trim() === "") {
        console.error("Número de pedido no válido antes de crear referencia Firestore:", pedidoNumero);
        return;
      }
      
      const pedidoRef = doc(db, "pedidos", String(pedidoNumero).trim());
      console.log("Referencia de documento Firestore creada con pedidoNumero:", String(pedidoNumero).trim());
      
  
      await setDoc(
        pedidoRef,
        {
          numeroPedido: pedidoNumeroStr,
          nombreCliente: nombreCliente,
          numeroCliente: numeroCliente,
          salida: salida,
          estado: "Finalizado",
          activo: true,
          backorder: false,
          prioridad: false,
          zona: zona,
          subZona: subZona,
          timestamp: new Date(),
        },
        { merge: true }
      );
  
      console.log(`Pedido ${pedidoNumeroStr} guardado como Finalizado.`);
    } catch (error) {
      console.error("Error al guardar el pedido como Finalizado:", error);
    }
  };
  
  
    
//---------------------------------------

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

    if (!file) {
      alert("Por favor, sube un archivo antes de confirmar.");
      return;
    }
    if (!salida || (salida !== "Ruta" && salida !== "Mostrador")) {
      alert("Por favor, selecciona si el pedido es para Mostrador o Ruta.");
      return;
    }
    setIsNoteModalVisible(true);
  };
  
  return (
    <>
      <div className="clientes-header">
        <div className="clientes-right-filters">
          
          <button onClick={handleFormShow}>Capturar</button>
          {isFormVisible && (
            <form className={`clientes-form ${isFormVisible ? 'visible' : ''}`} onSubmit={handleSubmit}>

{/* Modal para la nota */}
{isNoteModalVisible && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h2>Agregar Nota</h2>
      <textarea
        placeholder="Escribe una nota para este pedido..."
        value={nota}
        onChange={(e) => setNota(e.target.value)}
      />
      <div className="modal-buttons">
        <button onClick={() => setIsNoteModalVisible(false)}>Cancelar</button>
        <button
          onClick={() => {
            setIsNoteModalVisible(false);
            saveOrderToFirebase(); // Guardar pedido
          }}
        >
          Confirmar Nota
        </button>
      </div>
    </div>
  </div>
)}

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
                  <input 
                  type="radio" 
                  name='salida' 
                  value="Mostrador" 
                  onChange={handleSalidaChange}
                  checked={salida == "Mostrador"}
                  />
                  <p>Mostrador</p>
                </span>
                <span className="clientes-opciones">
                  <input 
                  type="radio" 
                  name='salida' 
                  value="Ruta" 
                  onChange={handleSalidaChange} 
                  checked={salida === "Ruta" || !salida}
                  />
                  <p>Ruta</p>
                </span>
                <button id='clientes-credito' 
                type="button"
                onClick={toggleCredito}
                className={creditoActivo ? 'active' : ''}
                >
                  <IonIcon icon={walletOutline} />
                </button>
                
              </div>
              <div className="clientes-nota">
</div>
<button type="submit" 
className="clientes-enviar-form">Confirmar</button>

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
