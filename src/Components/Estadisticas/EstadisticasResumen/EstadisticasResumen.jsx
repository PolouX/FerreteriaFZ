import React, { useRef, useState, useEffect } from 'react';
import "./EstadisticasResumen.css";
import { IonIcon } from "@ionic/react";
import { pieChartOutline, personOutline } from 'ionicons/icons';

const EstadisticasResumen = () => {
    const data = [10, 15, 10, 29, 30, 7, 40, 10, 15, 10, 29, 30, 7, 40, 10, 15, 10, 29, 30, 7, 40, 10, 15, 10, 29, 30, 7, 40];
    const containerRef = useRef(null);
    const [maxBars, setMaxBars] = useState(data.length);

    useEffect(() => {
        const updateMaxBars = () => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.offsetWidth;
                const barWidth = 60; // Ancho de la barra más el gap (50px de barra + 10px de gap)
                const maxBars = Math.floor(containerWidth / barWidth);
                setMaxBars(maxBars);
            }
        };

        // Calcula la cantidad de barras que caben al cargar
        updateMaxBars();

        // Ajusta la cantidad de barras al redimensionar la ventana
        window.addEventListener('resize', updateMaxBars);

        // Limpieza del event listener
        return () => {
            window.removeEventListener('resize', updateMaxBars);
        };
    }, []);

    return (
        <div className="estadisticas-resumen">
            <div className="estadisticas-resumen-header">
                <h2>Resumen</h2>
                <div className="estadisticas-header-botones">
                    <button>
                        <IonIcon icon={pieChartOutline} />
                    </button>
                    <button>
                        <IonIcon icon={personOutline} />
                    </button>
                    <input type="text" className="estadisticas-resumen-buscar" placeholder='Buscar usuario...' />
                </div>
            </div>
            <div className="estadisticas-resumen-content" >
                <div className="bar-chart-container" ref={containerRef}>
                    <div className='bar-stats'>
                        {data.slice(0, maxBars).map((value, index) => (
                            <div key={index} className="bar" style={{ height: `${value * 4}px` }}>
                                <p>Ago 24</p>
                            </div>
                        ))}
                    </div>
                    
                </div>
            </div>
        </div>
    );
};

export default EstadisticasResumen;
