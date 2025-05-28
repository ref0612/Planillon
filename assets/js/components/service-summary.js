// ========== MODAL DE RESUMEN DE SERVICIO ==========
// Maneja el modal de resumen financiero de servicios

// ========== CLASE PRINCIPAL ==========
class ServiceSummaryHandler {
    constructor() {
        this.currentServiceData = null;
        this.calculationFields = {
            conductor: ['summaryViatico', 'summaryAvance'],
            vehiculo: ['summaryPeaje', 'summaryLosa', 'summaryFar'],
            ingresos: ['summaryEfectivoRuta', 'summaryOtrosIngresos']
        };
        this.init();
    }

    init() {
        try {
            this.setupEventListeners();
            this.enhanceServiceButtons();
            this.setupMutationObserver();
        } catch (error) {
            console.error('Error al inicializar ServiceSummaryHandler:', error);
        }
    }

    handleSummaryClick(summaryBtn, event) {
        try {
            console.log('Botón de resumen clickeado');
            
            const row = summaryBtn.closest('tr');
            if (!row) {
                console.error('No se pudo encontrar la fila padre');
                return;
            }
            
            // Extraer datos del servicio
            const serviceData = {
                numeroCaratula: Math.floor(Math.random() * 900000) + 100000, // Número aleatorio para demo
                servicio: row.cells[2]?.textContent?.trim() || 'Servicio no disponible',
                hora: row.cells[5]?.textContent?.trim() || '--:--',
                conductor: row.cells[6]?.textContent?.trim() || 'No asignado',
                bus: row.cells[4]?.textContent?.trim() || 'No asignado',
                variante: row.cells[3]?.textContent?.trim() || 'No especificada',
                estado: row.querySelector('.status-indicator')?.getAttribute('data-status') || 'active'
            };
            
            console.log('Datos del servicio:', serviceData);
            
            // Mostrar el modal con los datos
            this.showSummaryModal(serviceData);
            
        } catch (error) {
            console.error('Error en handleSummaryClick:', error);
        }
    }
    
    showSummaryModal(serviceData) {
        try {
            this.currentServiceData = serviceData;
            
            // Actualizar los campos del modal
            this.updateModalFields(serviceData);
            
            // Mostrar el modal
            this.displayModal();
            
        } catch (error) {
            console.error('Error en showSummaryModal:', error);
        }
    }
    
    updateModalFields(serviceData) {
        try {
            // Mapeo de campos del servicio a los IDs del modal
            const fieldMappings = {
                'summaryNumeroCaratula': serviceData.numeroCaratula,
                'summaryServicio': serviceData.servicio,
                'summaryHora': this.formatTime(serviceData.hora),
                'summaryConductor': serviceData.conductor,
                'summaryBus': serviceData.bus,
                'summaryVariante': serviceData.variante
            };
            
            // Actualizar cada campo
            Object.entries(fieldMappings).forEach(([fieldId, value]) => {
                const field = document.getElementById(fieldId);
                if (field) {
                    field.value = value;
                } else {
                    console.warn(`Campo no encontrado: ${fieldId}`);
                }
            });
            
        } catch (error) {
            console.error('Error actualizando campos del modal:', error);
        }
    }
    
    formatTime(timeString) {
        if (!timeString) return '--:--';
        // Convertir a formato AM/PM
        const timeParts = timeString.split(':');
        if (timeParts.length < 2) return timeString;
        
        const hour = parseInt(timeParts[0], 10);
        const minutes = timeParts[1] || '00';
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    }

    /**
     * Verifica si un campo es un campo de cálculo basado en su ID
     * @param {string} fieldId - El ID del campo a verificar
     * @returns {boolean} - True si es un campo de cálculo, false en caso contrario
     */
    isCalculationField(fieldId) {
        if (!fieldId) return false;
        
        // Verificar si el campo está en alguna de las categorías de cálculo
        return Object.values(this.calculationFields)
            .flat()
            .includes(fieldId);
    }

    setupEventListeners() {
        try {
            // Event delegation para botones de resumen
            document.addEventListener('click', (e) => {
                try {
                    const summaryBtn = e.target.closest('.action-btn[title="Resumen del Servicio"], .btn-summary');
                    if (summaryBtn) {
                        e.preventDefault();
                        e.stopPropagation();
                        this.handleSummaryClick(summaryBtn, e);
                    }
                } catch (error) {
                    console.error('Error en manejador de clic:', error);
                }
            });

            // Event listeners para los botones del modal
            document.addEventListener('click', (e) => {
                try {
                    if (e.target.id === 'summaryGuardarBtn') {
                        this.handleSaveClick(e);
                    } else if (e.target.id === 'summaryActualizarBtn') {
                        this.handleUpdateClick(e);
                    } else if (e.target.id === 'summaryImprimirBtn') {
                        this.handlePrintClick(e);
                    }
                } catch (error) {
                    console.error('Error en manejador de botones del modal:', error);
                }
            });

            // Event listeners para cálculos automáticos
            document.addEventListener('input', (e) => {
                try {
                    if (this.isCalculationField(e.target.id)) {
                        this.updateCalculations();
                    }
                } catch (error) {
                    console.error('Error en manejador de input:', error);
                }
            });
        } catch (error) {
            console.error('Error al configurar event listeners:', error);
        }
    }

    enhanceServiceButtons() {
        try {
            this.addMissingSummaryButtons();
        } catch (error) {
            console.error('Error al mejorar botones de servicio:', error);
        }
    }

    addMissingSummaryButtons() {
        try {
            // ✅ Solo procesar tablas que necesitan botones de resumen
            // Excluir explícitamente las tablas de tarifas
            const tables = document.querySelectorAll('table.with-summary-buttons:not(.tariff-table)');
            
            if (!tables.length) return;
        
            tables.forEach(table => {
                // ✅ Verificar que no sea una tabla de tarifas
                if (table.closest('.tariff-module') || table.closest('.tariff-summary') || table.classList.contains('tariff-table')) {
                    return; // Salir sin procesar
                }
                
                const tableRows = table.querySelectorAll('tbody tr:not(.summary-enhanced):not(.tarifa-protected)');
                
                tableRows.forEach((row) => {
                    try {
                        // ✅ Verificaciones adicionales de protección
                        if (row._tarifaProtected || row.classList.contains('tarifa-protected') || row.closest('.tariff-table')) {
                            return; // No procesar filas protegidas
                        }
                        
                        let actionButtons = row.querySelector('.action-buttons');
                        if (!actionButtons) {
                            const firstCell = row.cells[0];
                            if (firstCell) {
                                // ✅ Verificar que la celda no tenga contenido importante de tarifas
                                const cellContent = firstCell.textContent.trim();
                                const hasTariffContent = /^(G\d+|B\d+|CARAB|PRELI|TOTAL|Clásico|Ejecutivo|Semi Cama|Salón Cama|Pet Seat|Premium)$/i.test(cellContent);
                                
                                if (hasTariffContent) {
                                    return; // No modificar celdas con contenido de tarifas
                                }
                                
                                actionButtons = document.createElement('div');
                                actionButtons.className = 'action-buttons';
                                firstCell.innerHTML = '';
                                firstCell.appendChild(actionButtons);
                            }
                        }
                        
                        if (actionButtons && !row.querySelector('.btn-summary')) {
                            const summaryBtn = document.createElement('button');
                            summaryBtn.className = 'action-btn me-1 btn-summary';
                            summaryBtn.title = 'Resumen del Servicio';
                            summaryBtn.innerHTML = '<i class="fas fa-file-alt"></i>';
                            actionButtons.appendChild(summaryBtn);
                        }
                        
                        row.classList.add('summary-enhanced');
                    } catch (error) {
                        console.error('Error procesando fila:', error, row);
                    }
                });
            });
        } catch (error) {
            console.error('Error en addMissingSummaryButtons:', error);
        }
    }

    setupMutationObserver() {
        try {
            const observer = new MutationObserver((mutations) => {
                try {
                    const shouldEnhance = mutations.some(mutation => {
                        if (mutation.addedNodes.length > 0) {
                            // ✅ Verificar que los nodos añadidos no sean de tarifas
                            const addedNodes = Array.from(mutation.addedNodes);
                            const hasTariffNodes = addedNodes.some(node => {
                                if (node.nodeType === 1) { // Element node
                                    return node.closest('.tariff-module') || 
                                           node.closest('.tariff-summary') ||
                                           node.classList.contains('tariff-table') ||
                                           node.querySelector('.tariff-table');
                                }
                                return false;
                            });
                            
                            return !hasTariffNodes; // Solo procesar si no hay nodos de tarifas
                        }
                        return false;
                    });
                    
                    if (shouldEnhance) {
                        setTimeout(() => {
                            this.enhanceServiceButtons();
                        }, 100);
                    }
                } catch (error) {
                    console.error('Error en MutationObserver callback:', error);
                }
            });
            
            observer.observe(document.body, { 
                childList: true, 
                subtree: true 
            });
        } catch (error) {
            console.error('Error al configurar MutationObserver:', error);
        }
    }

    displayModal() {
        try {
            console.log('Mostrando modal...');
            const modalElement = document.getElementById('serviceSummaryModal');
            
            if (!modalElement) {
                console.error('No se encontró el elemento del modal');
                return;
            }
            
            // Usar Bootstrap 5 para mostrar el modal
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
            
            // Limpiar al cerrar
            modalElement.addEventListener('hidden.bs.modal', () => {
                this.currentServiceData = null;
            }, { once: true });
            
        } catch (error) {
            console.error('Error al mostrar el modal:', error);
        }
    }

    handleSaveClick(event) {
        try {
            event.preventDefault();
            console.log('Guardando cambios del resumen...');
            
            // Implementar lógica de guardado aquí
            if (window.showNotification) {
                window.showNotification('Cambios guardados correctamente', 'success');
            }
        } catch (error) {
            console.error('Error al guardar:', error);
        }
    }

    handleUpdateClick(event) {
        try {
            event.preventDefault();
            console.log('Actualizando resumen...');
            
            // Implementar lógica de actualización aquí
            if (window.showNotification) {
                window.showNotification('Resumen actualizado', 'success');
            }
        } catch (error) {
            console.error('Error al actualizar:', error);
        }
    }

    handlePrintClick(event) {
        try {
            event.preventDefault();
            console.log('Imprimiendo recibo...');
            
            // Implementar lógica de impresión aquí
            window.print();
        } catch (error) {
            console.error('Error al imprimir:', error);
        }
    }

    updateCalculations() {
        try {
            // Implementar cálculos automáticos aquí
            console.log('Actualizando cálculos...');
        } catch (error) {
            console.error('Error en cálculos:', error);
        }
    }
}

// Inicialización segura
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Esperar un poco para que las tablas de tarifas se protejan primero
        setTimeout(() => {
            window.serviceSummaryHandler = new ServiceSummaryHandler();
            console.log('ServiceSummaryHandler inicializado correctamente');
        }, 600); // Inicializar después del módulo de tarifas
    } catch (error) {
        console.error('Error al inicializar ServiceSummaryHandler:', error);
    }
});