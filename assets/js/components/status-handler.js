// ========== MANEJADOR DE ESTADOS ==========
// Gestiona los indicadores de estado y el modal de cambio de estado

// ========== CONFIGURACIÓN DE ESTADOS ==========
const STATUS_CONFIG = {
    active: { 
        label: 'Abierto', 
        color: '#10b981', 
        class: 'status-active' 
    },
    alert: { 
        label: 'Cerrado', 
        color: '#ef4444', 
        class: 'status-alert' 
    },
    pending: { 
        label: 'Suspendido', 
        color: '#f59e0b', 
        class: 'status-pending' 
    },
    inactive: { 
        label: 'Panne', 
        color: '#6b7280', 
        class: 'status-inactive' 
    },
    recaudado: { 
        label: 'Recaudado', 
        color: '#8b5cf6', 
        class: 'status-recaudado' 
    }
};

// ========== CLASE PRINCIPAL ==========
class StatusHandler {
    constructor() {
        this.currentStatusElement = null;
        this.currentServiceData = null;
        this.observers = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeStatusIndicators();
        this.setupMutationObserver();
    }

    setupEventListeners() {
        // Event delegation para indicadores de estado
        document.addEventListener('click', (e) => {
            const statusIndicator = e.target.closest('.status-indicator');
            if (statusIndicator) {
                this.handleStatusClick(statusIndicator, e);
            }
        });

        // Event listeners para opciones de estado en modal
        document.addEventListener('click', (e) => {
            const statusOption = e.target.closest('.status-option');
            if (statusOption) {
                this.selectStatus(statusOption.dataset.status);
            }
        });
    }

    initializeStatusIndicators() {
        const indicators = document.querySelectorAll('.status-indicator');
        indicators.forEach(indicator => {
            this.setupStatusIndicator(indicator);
        });
    }

    setupStatusIndicator(indicator) {
        // Skip si ya está inicializado
        if (indicator._statusInitialized) return;

        // Configurar cursor
        indicator.style.cursor = 'pointer';

        // Establecer estado por defecto si no existe
        if (!indicator.getAttribute('data-status')) {
            const statusClass = Array.from(indicator.classList)
                .find(cls => cls.startsWith('status-') && cls !== 'status-indicator');
            
            if (statusClass) {
                const status = statusClass.replace('status-', '');
                indicator.setAttribute('data-status', status);
            } else {
                indicator.setAttribute('data-status', 'active');
                indicator.classList.add('status-active');
            }
        }

        // Configurar tooltip
        this.setupTooltip(indicator);

        // Marcar como inicializado
        indicator._statusInitialized = true;
    }

    setupTooltip(indicator) {
        const status = indicator.getAttribute('data-status');
        const statusText = this.getStatusText(status);

        indicator.setAttribute('data-bs-toggle', 'tooltip');
        indicator.setAttribute('data-bs-placement', 'top');
        indicator.setAttribute('title', statusText);

        // Inicializar tooltip si Bootstrap está disponible
        if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
            if (!indicator._tooltip) {
                new bootstrap.Tooltip(indicator);
                indicator._tooltip = true;
            }
        }
    }

    setupMutationObserver() {
        const observer = new MutationObserver((mutations) => {
            let shouldUpdate = false;
            
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length) {
                    shouldUpdate = true;
                }
            });
            
            if (shouldUpdate) {
                setTimeout(() => {
                    this.initializeStatusIndicators();
                }, 100);
            }
        });

        observer.observe(document.body, { 
            childList: true, 
            subtree: true 
        });

        this.observers.push(observer);
    }

    handleStatusClick(indicator, event) {
        event.preventDefault();
        event.stopPropagation();

        const row = indicator.closest('tr');
        if (!row) return;

        const serviceData = this.extractServiceData(row);
        if (!serviceData) return;

        this.openStatusModal(indicator, serviceData);
    }

    extractServiceData(row) {
        const cells = row.cells;
        if (cells.length < 7) return null;

        return {
            service: cells[2]?.textContent?.trim() || '',
            variant: cells[3]?.textContent?.trim() || '',
            time: cells[5]?.textContent?.trim() || '',
            driver: cells[6]?.textContent?.trim() || '',
            bus: cells[4]?.textContent?.trim() || ''
        };
    }

    openStatusModal(element, serviceData) {
        this.currentStatusElement = element;
        this.currentServiceData = serviceData;

        // Actualizar contenido del modal
        this.updateModalContent(serviceData);

        // Mostrar estado actual
        const currentStatus = element.getAttribute('data-status') || 'active';
        this.selectStatus(currentStatus);

        // Mostrar modal
        if (window.ModalUtils) {
            window.ModalUtils.show('statusModal');
        } else {
            // Fallback
            const modal = document.getElementById('statusModal');
            if (modal && typeof bootstrap !== 'undefined') {
                const bsModal = new bootstrap.Modal(modal);
                bsModal.show();
            }
        }
    }

    updateModalContent(serviceData) {
        const elements = {
            servicioNombre: document.getElementById('servicioNombre'),
            servicioVariante: document.getElementById('servicioVariante'),
            servicioHora: document.getElementById('servicioHora')
        };

        if (elements.servicioNombre) {
            elements.servicioNombre.textContent = serviceData.service;
        }
        if (elements.servicioVariante) {
            elements.servicioVariante.textContent = serviceData.variant;
        }
        if (elements.servicioHora) {
            elements.servicioHora.textContent = serviceData.time;
        }
    }

    selectStatus(status) {
        // Remover clase 'selected' de todas las opciones
        document.querySelectorAll('.status-option').forEach(option => {
            option.classList.remove('selected');
        });

        // Agregar clase 'selected' a la opción seleccionada
        const selectedOption = document.querySelector(`.status-option[data-status="${status}"]`);
        if (selectedOption) {
            selectedOption.classList.add('selected');
            const radio = selectedOption.querySelector('input[type="radio"]');
            if (radio) {
                radio.checked = true;
            }
        }
    }

    saveStatus() {
        if (!this.currentStatusElement) {
            console.error('No hay elemento de estado seleccionado');
            return false;
        }

        const selectedRadio = document.querySelector('input[name="status"]:checked');
        if (!selectedRadio) {
            console.error('No hay estado seleccionado');
            return false;
        }

        const selectedStatus = selectedRadio.value;

        try {
            // Actualizar el indicador de estado
            this.updateStatusIndicator(this.currentStatusElement, selectedStatus);

            // Cerrar modal
            if (window.ModalUtils) {
                window.ModalUtils.hide('statusModal');
            } else {
                const modal = document.getElementById('statusModal');
                if (modal && typeof bootstrap !== 'undefined') {
                    const bsModal = bootstrap.Modal.getInstance(modal);
                    if (bsModal) bsModal.hide();
                }
            }

            // Notificar cambio
            this.notifyStatusChange(selectedStatus);

            // Log del cambio
            console.log('Estado actualizado:', {
                service: this.currentServiceData?.service,
                status: selectedStatus,
                timestamp: new Date().toISOString()
            });

            return true;
        } catch (error) {
            console.error('Error al guardar estado:', error);
            return false;
        }
    }

    updateStatusIndicator(element, status) {
        if (!element || !STATUS_CONFIG[status]) return;

        // Actualizar clases
        element.className = 'status-indicator';
        element.classList.add(STATUS_CONFIG[status].class);

        // Actualizar atributo data-status
        element.setAttribute('data-status', status);

        // Actualizar tooltip
        const statusText = this.getStatusText(status);
        element.setAttribute('title', statusText);
        element.setAttribute('data-bs-original-title', statusText);

        // Reinicializar tooltip
        if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
            const tooltip = bootstrap.Tooltip.getInstance(element);
            if (tooltip) {
                tooltip.dispose();
                new bootstrap.Tooltip(element);
            }
        }

        // Trigger evento personalizado
        element.dispatchEvent(new CustomEvent('statusChanged', {
            detail: { 
                status, 
                element,
                serviceData: this.currentServiceData 
            }
        }));
    }

    notifyStatusChange(status) {
        const statusText = this.getStatusText(status);
        const serviceName = this.currentServiceData?.service || 'Servicio';
        
        if (window.showNotification) {
            window.showNotification(
                `Estado de ${serviceName} cambiado a: ${statusText}`,
                'success'
            );
        }
    }

    getStatusText(status) {
        return STATUS_CONFIG[status]?.label || 'Desconocido';
    }

    getStatusColor(status) {
        return STATUS_CONFIG[status]?.color || '#6b7280';
    }

    getAllStatuses() {
        return Object.keys(STATUS_CONFIG);
    }

    getStatusConfig(status) {
        return STATUS_CONFIG[status] || null;
    }

    // Método para agregar listeners personalizados
    addEventListener(type, callback) {
        document.addEventListener(type, callback);
    }

    // Método para destruir el handler
    destroy() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers = [];
        this.currentStatusElement = null;
        this.currentServiceData = null;
    }
}

// ========== FUNCIONES GLOBALES PARA COMPATIBILIDAD ==========
function openStatusModal(element, service, variant, time) {
    const serviceData = { service, variant, time };
    statusHandler.openStatusModal(element, serviceData);
}

function selectStatus(status) {
    statusHandler.selectStatus(status);
}

function saveStatus() {
    return statusHandler.saveStatus();
}

function getStatusText(status) {
    return statusHandler.getStatusText(status);
}

// ========== INICIALIZACIÓN ==========
const statusHandler = new StatusHandler();

// ========== EXPORTAR ==========
window.StatusHandler = StatusHandler;
window.statusHandler = statusHandler;

// Funciones globales para compatibilidad con código existente
window.openStatusModal = openStatusModal;
window.selectStatus = selectStatus;
window.saveStatus = saveStatus;
window.getStatusText = getStatusText;