// ========== MODAL DE HISTORIAL ==========
// Maneja el historial de cambios de servicios

// ========== DATOS DE EJEMPLO ==========
const HISTORIAL_EJEMPLO = [
    {
        nroServicio: '3376456',
        horaSalida: '11/06/2025 5:45',
        nroBus: '35 - KBSS-28',
        conductor: 'Juan Alvarez-CM629',
        disenoBus: 'Bus 45 asientos',
        estado: 'Cerrado',
        ruta: '',
        fechaCambio: '11/06/2025',
        usuario: 'Jatenas',
        modificacion: 'Conductor 1 actualizado'
    },
    {
        nroServicio: '3376456',
        horaSalida: '11/06/2025 5:45',
        nroBus: '35 - KBSS-28',
        conductor: 'Juan Alvarez-CM629',
        disenoBus: 'Bus 45 asientos',
        estado: 'Cerrado',
        ruta: '',
        fechaCambio: '11/06/2025',
        usuario: 'Cpoblete',
        modificacion: 'Conductor 2 actualizado'
    },
    {
        nroServicio: '3376456',
        horaSalida: '11/06/2025 5:45',
        nroBus: '38 - SVSS-11',
        conductor: 'Eduardo Rios-CM630',
        disenoBus: 'Bus 45 asientos',
        estado: 'Cerrado',
        ruta: '',
        fechaCambio: '11/06/2025',
        usuario: 'Adiaz',
        modificacion: ''
    },
    {
        nroServicio: '3376456',
        horaSalida: '11/06/2025 5:45',
        nroBus: '38 - SVSS-11',
        conductor: 'Eduardo Rios-CM630',
        disenoBus: 'Bus 45 asientos',
        estado: 'Cerrado',
        ruta: '',
        fechaCambio: '11/06/2025',
        usuario: 'Bsoto',
        modificacion: ''
    }
];

// ========== CLASE PRINCIPAL ==========
class HistoryModalHandler {
    constructor() {
        this.currentServiceData = null;
        this.historyData = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.enhanceHistoryButtons();
        this.setupMutationObserver();
    }

    setupEventListeners() {
        // Event delegation para botones de historial
        document.addEventListener('click', (e) => {
            const historyBtn = e.target.closest('.btn-history, .history-btn');
            if (historyBtn) {
                this.handleHistoryClick(historyBtn, e);
            }
        });

        // Event listener para botón de exportar
        document.addEventListener('click', (e) => {
            if (e.target.id === 'exportarHistorialBtn') {
                this.handleExportClick(e);
            }
        });
    }

    enhanceHistoryButtons() {
        // Buscar todos los botones con icono de historial y agregar clase
        const historyIcons = document.querySelectorAll('.fa-history');
        
        historyIcons.forEach(icon => {
            const button = icon.closest('button');
            if (button && !button.classList.contains('btn-history')) {
                button.classList.add('btn-history');
                button.title = 'Historial';
            }
        });

        // Agregar botones de historial a filas que no los tengan
        this.addMissingHistoryButtons();
    }

    addMissingHistoryButtons() {
        // ✅ Solo seleccionar tablas que necesitan botones de historial
        // Excluir explícitamente las tablas de tarifas
        const tables = document.querySelectorAll('table:not(.tariff-table)');
        
        tables.forEach(table => {
            const tableRows = table.querySelectorAll('tbody tr:not(.history-enhanced)');
            
            tableRows.forEach((row, index) => {
                try {
                    // Skip si ya está procesado
                    if (row._historyEnhanced) return;
                    
                    // ✅ Verificar que NO sea una tabla de tarifas
                    if (row.closest('.tariff-module') || row.closest('.tariff-summary') || row.closest('.tariff-table')) {
                        return; // Salir sin procesar
                    }
                    
                    // ✅ Verificar que la fila no tenga marcadores de protección
                    if (row._tarifaProtected || row.classList.contains('tarifa-protected')) {
                        return; // Salir sin procesar
                    }
                    
                    // Agregar ID de servicio si no existe
                    if (!row.dataset.serviceId) {
                        row.dataset.serviceId = `service-${Date.now()}-${index}`;
                    }
                    
                    // ✅ Solo procesar filas que ya tienen una estructura de botones de acción
                    // o que están en tablas específicas que necesitan historial
                    const isServiceTable = table.classList.contains('detail-table') || 
                                         table.classList.contains('with-summary-buttons') ||
                                         table.closest('.detail-section');
                    
                    if (!isServiceTable) {
                        row._historyEnhanced = true;
                        return;
                    }
                    
                    let actionButtons = row.querySelector('.action-buttons');
                    if (!actionButtons) {
                        const firstCell = row.cells[0];
                        if (firstCell) {
                            // ✅ Solo crear si la celda no tiene contenido importante
                            const cellContent = firstCell.textContent.trim();
                            if (cellContent && !cellContent.match(/^\s*$/) && !firstCell.querySelector('.action-buttons')) {
                                // La celda tiene contenido importante, no la modificar
                                row._historyEnhanced = true;
                                return;
                            }
                            
                            actionButtons = document.createElement('div');
                            actionButtons.className = 'action-buttons';
                            firstCell.innerHTML = '';
                            firstCell.appendChild(actionButtons);
                        }
                    }
                    
                    // Marcar como procesado
                    row._historyEnhanced = true;
                    row.classList.add('history-enhanced');
                    
                } catch (error) {
                    console.error('Error procesando fila:', error, row);
                }
            });
        });
    }

    setupMutationObserver() {
        const observer = new MutationObserver((mutations) => {
            let shouldEnhance = false;
            
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length) {
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
                    
                    if (!hasTariffNodes) {
                        shouldEnhance = true;
                    }
                }
            });
            
            if (shouldEnhance) {
                setTimeout(() => {
                    this.enhanceHistoryButtons();
                }, 100);
            }
        });
        
        observer.observe(document.body, { 
            childList: true, 
            subtree: true 
        });
    }

    handleHistoryClick(historyBtn, event) {
        event.preventDefault();
        event.stopPropagation();
        
        const row = historyBtn.closest('tr');
        if (!row) return;
        
        const serviceData = this.extractServiceData(row);
        this.showHistoryModal(serviceData);
    }

    extractServiceData(row) {
        const cells = row.cells;
        
        return {
            numero: cells[2]?.textContent?.trim() || 'N/A',
            hora: cells[5]?.textContent?.trim() || 'N/A',
            chofer: cells[6]?.textContent?.trim() || 'N/A',
            bus: cells[4]?.textContent?.trim() || 'N/A',
            estado: row.querySelector('.status-indicator')?.getAttribute('data-status') || 'Desconocido',
            variante: cells[3]?.textContent?.trim() || 'N/A',
            serviceId: row.dataset.serviceId || `service-${Date.now()}`
        };
    }

    showHistoryModal(serviceData) {
        this.currentServiceData = serviceData;
        
        // Actualizar título del modal
        this.updateModalTitle(serviceData.numero);
        
        // Cargar datos del historial
        this.loadHistoryData(serviceData);
        
        // Poblar tabla
        this.populateHistoryTable();
        
        // Configurar botón de exportar
        this.setupExportButton();
        
        // Mostrar modal
        this.displayModal();
    }

    updateModalTitle(serviceNumber) {
        const titleElement = document.getElementById('historialModalLabel');
        if (titleElement) {
            titleElement.textContent = `Historial de Cambios - ${serviceNumber}`;
        }
    }

    loadHistoryData(serviceData) {
        // En una aplicación real, esto vendría de una API
        // Por ahora usamos datos de ejemplo
        this.historyData = HISTORIAL_EJEMPLO.map(item => ({
            ...item,
            nroServicio: serviceData.numero
        }));
        
        console.log('Datos de historial cargados:', this.historyData);
    }

    populateHistoryTable() {
        const tbody = document.getElementById('historialTablaBody');
        if (!tbody) return;
        
        // Limpiar tabla
        tbody.innerHTML = '';
        
        // Agregar filas
        this.historyData.forEach(item => {
            const tr = this.createHistoryRow(item);
            tbody.appendChild(tr);
        });
        
        // Actualizar contador
        this.updateRecordCount();
    }

    createHistoryRow(item) {
        const tr = document.createElement('tr');
        
        // Aplicar estilos condicionales
        const modificacionClass = item.modificacion ? 'text-primary fw-bold' : '';
        
        tr.innerHTML = `
            <td class="text-center" style="padding: 4px;">${item.nroServicio}</td>
            <td class="text-center" style="padding: 4px;">${item.horaSalida}</td>
            <td class="text-center" style="padding: 4px;">${item.nroBus}</td>
            <td style="padding: 4px;">${item.conductor}</td>
            <td style="padding: 4px;">${item.disenoBus}</td>
            <td class="text-center" style="padding: 4px;">${item.estado}</td>
            <td class="text-center" style="padding: 4px;">${item.ruta || ''}</td>
            <td class="text-center" style="padding: 4px;">${item.fechaCambio}</td>
            <td style="padding: 4px;">${item.usuario}</td>
            <td style="padding: 4px; ${item.modificacion ? 'color: #0066cc;' : ''}" class="${modificacionClass}">${item.modificacion}</td>
        `;
        
        // Agregar clase especial para filas destacadas
        if (item.modificacion) {
            tr.classList.add('highlight-row');
        }
        
        return tr;
    }

    updateRecordCount() {
        const totalElement = document.getElementById('totalRegistros');
        if (totalElement) {
            totalElement.textContent = this.historyData.length;
        }
    }

    setupExportButton() {
        const exportBtn = document.getElementById('exportarHistorialBtn');
        if (exportBtn) {
            // Remover listeners previos
            exportBtn.replaceWith(exportBtn.cloneNode(true));
            
            // Agregar nuevo listener
            const newExportBtn = document.getElementById('exportarHistorialBtn');
            newExportBtn.addEventListener('click', (e) => {
                this.handleExportClick(e);
            });
        }
    }

    displayModal() {
        if (window.ModalUtils) {
            window.ModalUtils.show('historialModal');
        } else {
            // Fallback
            const modalElement = document.getElementById('historialModal');
            if (modalElement && typeof bootstrap !== 'undefined') {
                const modal = new bootstrap.Modal(modalElement);
                modal.show();
            }
        }
    }

    handleExportClick(event) {
        event.preventDefault();
        
        try {
            this.exportToExcel();
        } catch (error) {
            console.error('Error al exportar el historial:', error);
            this.showError('Ocurrió un error al exportar el historial. Por favor, intente nuevamente.');
        }
    }

    exportToExcel() {
        if (!this.currentServiceData || !this.historyData.length) {
            this.showError('No hay datos para exportar');
            return;
        }
        
        // Crear contenido CSV
        let csvContent = '\uFEFF'; // BOM para Excel
        
        // Encabezados
        const headers = [
            'N° servicio',
            'Hora salida',
            'N° bus',
            'Conductor',
            'Diseño bus',
            'Estado',
            'Ruta',
            'Fecha cambio',
            'Usuario modifica',
            'Modificación'
        ];
        
        csvContent += headers.join(';') + '\r\n';
        
        // Filas de datos
        this.historyData.forEach(item => {
            const row = [
                `"${item.nroServicio}"`,
                `"${item.horaSalida}"`,
                `"${item.nroBus}"`,
                `"${item.conductor}"`,
                `"${item.disenoBus}"`,
                `"${item.estado}"`,
                `"${item.ruta || ''}"`,
                `"${item.fechaCambio}"`,
                `"${item.usuario}"`,
                `"${item.modificacion}"`
            ];
            csvContent += row.join(';') + '\r\n';
        });
        
        // Crear y descargar archivo
        this.downloadCSV(csvContent);
        
        // Mostrar mensaje de éxito
        this.showSuccess('Historial exportado correctamente');
    }

    downloadCSV(csvContent) {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        const filename = `historial_servicio_${this.currentServiceData.numero || 'desconocido'}_${new Date().toISOString().split('T')[0]}.csv`;
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Limpiar URL
        URL.revokeObjectURL(url);
    }

    showSuccess(message) {
        if (window.showNotification) {
            window.showNotification(message, 'success');
        } else {
            console.log('Success:', message);
        }
    }

    showError(message) {
        if (window.showNotification) {
            window.showNotification(message, 'error');
        } else {
            console.error('Error:', message);
        }
    }

    // Método público para abrir modal desde código externo
    openHistoryModal(serviceId, serviceData) {
        console.log('Abriendo modal de historial para:', serviceId, serviceData);
        
        // Formatear datos si vienen en formato diferente
        const formattedData = {
            numero: serviceData.serviceNumber || serviceData.numero || serviceId,
            hora: serviceData.departureTime || serviceData.hora || '',
            chofer: serviceData.driver || serviceData.chofer || '',
            bus: serviceData.bus || '',
            serviceId: serviceId
        };
        
        this.showHistoryModal(formattedData);
    }

    // Método para destruir el handler
    destroy() {
        this.currentServiceData = null;
        this.historyData = [];
    }
}

// ========== FUNCIONES GLOBALES PARA COMPATIBILIDAD ==========
function mostrarHistorial(servicio) {
    historyModalHandler.showHistoryModal(servicio);
}

function openHistoryModal(serviceId, serviceData) {
    historyModalHandler.openHistoryModal(serviceId, serviceData);
}

// ========== INICIALIZACIÓN ==========
const historyModalHandler = new HistoryModalHandler();

// ========== EXPORTAR ==========
window.HistoryModalHandler = HistoryModalHandler;
window.historyModalHandler = historyModalHandler;
window.mostrarHistorial = mostrarHistorial;
window.openHistoryModal = openHistoryModal;