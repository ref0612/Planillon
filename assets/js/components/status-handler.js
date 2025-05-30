// ========== MANEJADOR DE ESTADOS ==========
// Gestiona los indicadores de estado y el modal de cambio de estado

// ========== CONFIGURACIÓN MEJORADA DE ESTADOS ==========
const STATUS_CONFIG = {
    active: { 
        label: 'Abierto', 
        color: '#10b981', 
        class: 'status-active',
        bgColor: 'rgba(16, 185, 129, 0.1)',
        textColor: '#047857',
        borderColor: '#10b981'
    },
    alert: { 
        label: 'Inactivo', 
        color: '#ef4444', 
        class: 'status-alert',
        bgColor: 'rgba(239, 68, 68, 0.1)',
        textColor: '#dc2626',
        borderColor: '#ef4444'
    },
    pending: { 
        label: 'Suspendido', 
        color: '#f59e0b', 
        class: 'status-pending',
        bgColor: 'rgba(245, 158, 11, 0.1)',
        textColor: '#d97706',
        borderColor: '#f59e0b'
    },
    inactive: { 
        label: 'Panne', 
        color: '#6b7280', 
        class: 'status-inactive',
        bgColor: 'rgba(107, 114, 128, 0.1)',
        textColor: '#4b5563',
        borderColor: '#6b7280'
    },
    recaudado: { 
        label: 'Recaudado', 
        color: '#8b5cf6', 
        class: 'status-recaudado',
        bgColor: 'rgba(139, 92, 246, 0.1)',
        textColor: '#7c3aed',
        borderColor: '#8b5cf6'
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
        this.injectAnimations();
    }

    setupEventListeners() {
        // Event delegation para indicadores de estado
        document.addEventListener('click', (e) => {
            const statusIndicator = e.target.closest('.status-indicator');
            if (statusIndicator) {
                this.handleStatusClick(statusIndicator, e);
            }
        });

        // Event listeners mejorados para opciones de estado en modal
        document.addEventListener('click', (e) => {
            const statusOption = e.target.closest('.status-option');
            if (statusOption) {
                const status = statusOption.dataset.status;
                if (status) {
                    this.selectStatus(status);
                }
            }
        });

        // Event listener para hover effects
        document.addEventListener('mouseenter', (e) => {
            const statusOption = e.target.closest('.status-option');
            if (statusOption && !statusOption.classList.contains('selected')) {
                this.applyHoverEffect(statusOption);
            }
        }, true);

        document.addEventListener('mouseleave', (e) => {
            const statusOption = e.target.closest('.status-option');
            if (statusOption && !statusOption.classList.contains('selected')) {
                this.removeHoverEffect(statusOption);
            }
        }, true);
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

        console.log('Status indicator clicked:', indicator);

        const row = indicator.closest('tr');
        if (!row) {
            console.log('No row found');
            return;
        }

        const serviceData = this.extractServiceData(row);
        if (!serviceData) {
            console.log('No service data found');
            return;
        }

        console.log('Opening status modal with data:', serviceData);
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
        console.log('openStatusModal called with:', { element, serviceData });
        
        this.currentStatusElement = element;
        this.currentServiceData = serviceData;

        // Actualizar contenido del modal
        this.updateModalContent(serviceData);

        // Obtener estado actual
        const currentStatus = element.getAttribute('data-status') || 'active';
        console.log('Current status:', currentStatus);
        
        // Mostrar modal primero
        const modal = document.getElementById('statusModal');
        if (!modal) {
            console.error('Modal statusModal no encontrado');
            return;
        }

        if (window.ModalUtils) {
            console.log('Using ModalUtils to show modal');
            window.ModalUtils.show('statusModal');
        } else if (typeof bootstrap !== 'undefined') {
            console.log('Using Bootstrap to show modal');
            const bsModal = new bootstrap.Modal(modal);
            bsModal.show();
        } else {
            console.error('No modal system available');
            return;
        }

        // Aplicar selección mejorada después de que el modal esté visible
        setTimeout(() => {
            console.log('Applying status selection:', currentStatus);
            this.selectStatus(currentStatus);
        }, 150);
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
        console.log('selectStatus called with:', status);
        
        // Remover clase 'selected' de todas las opciones
        document.querySelectorAll('.status-option').forEach(option => {
            option.classList.remove('selected');
            
            // Remover estilos inline previos
            option.style.backgroundColor = '';
            option.style.borderColor = '';
            option.style.boxShadow = '';
            
            const textSpan = option.querySelector('span');
            if (textSpan) {
                textSpan.style.color = '';
                textSpan.style.fontWeight = '';
            }
            
            const colorCircle = option.querySelector('.status-color');
            if (colorCircle) {
                colorCircle.style.transform = '';
                colorCircle.style.boxShadow = '';
            }
        });

        // Agregar clase 'selected' a la opción seleccionada
        const selectedOption = document.querySelector(`.status-option[data-status="${status}"]`);
        console.log('Selected option element:', selectedOption);
        
        if (selectedOption) {
            selectedOption.classList.add('selected');
            
            // Obtener configuración del estado
            const config = STATUS_CONFIG[status];
            if (config) {
                // Aplicar estilos dinámicos específicos del estado
                selectedOption.style.backgroundColor = config.bgColor;
                selectedOption.style.borderColor = config.borderColor;
                selectedOption.style.boxShadow = `0 0 0 1px ${config.borderColor}, 0 4px 12px ${config.bgColor}`;
                
                // Cambiar color del texto
                const textSpan = selectedOption.querySelector('span');
                if (textSpan) {
                    textSpan.style.color = config.textColor;
                    textSpan.style.fontWeight = '600';
                }
                
                // Efecto en el círculo de color
                const colorCircle = selectedOption.querySelector('.status-color');
                if (colorCircle) {
                    colorCircle.style.transform = 'scale(1.1)';
                    colorCircle.style.boxShadow = `0 2px 8px ${config.bgColor}`;
                }
            }
            
            // Marcar el radio button correspondiente
            const radio = selectedOption.querySelector('input[type="radio"]');
            if (radio) {
                radio.checked = true;
            }
            
            // Trigger animación
            selectedOption.style.animation = 'none';
            selectedOption.offsetHeight; // Force reflow
            selectedOption.style.animation = 'statusPulse 0.5s ease-out';
        }
    }

    applyHoverEffect(option) {
        const status = option.dataset.status;
        const config = STATUS_CONFIG[status];
        
        if (config) {
            option.style.backgroundColor = config.bgColor.replace('0.1', '0.05');
            option.style.borderColor = config.borderColor.replace('1)', '0.3)');
            option.style.transform = 'translateX(2px)';
            option.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        }
    }

    removeHoverEffect(option) {
        if (!option.classList.contains('selected')) {
            option.style.backgroundColor = '';
            option.style.borderColor = '';
            option.style.transform = '';
            option.style.boxShadow = '';
        }
    }

    saveStatus() {
        console.log('saveStatus called');
        
        if (!this.currentStatusElement) {
            console.error('No hay elemento de estado seleccionado');
            return false;
        }

        const selectedOption = document.querySelector('.status-option.selected');
        if (!selectedOption) {
            console.error('No hay estado seleccionado');
            return false;
        }

        const selectedStatus = selectedOption.dataset.status;
        console.log('Saving status:', selectedStatus);

        try {
            // Actualizar el indicador de estado
            this.updateStatusIndicator(this.currentStatusElement, selectedStatus);

            // Cerrar modal con animación suave
            this.closeModalWithAnimation();

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

    closeModalWithAnimation() {
        // Animar salida de opciones seleccionadas
        const selectedOption = document.querySelector('.status-option.selected');
        if (selectedOption) {
            selectedOption.style.animation = 'fadeOut 0.3s ease-in';
        }

        // Cerrar modal después de la animación
        setTimeout(() => {
            if (window.ModalUtils) {
                window.ModalUtils.hide('statusModal');
            } else {
                const modal = document.getElementById('statusModal');
                if (modal && typeof bootstrap !== 'undefined') {
                    const bsModal = bootstrap.Modal.getInstance(modal);
                    if (bsModal) bsModal.hide();
                }
            }
            
            // Limpiar estilos después de cerrar
            setTimeout(() => {
                this.cleanupModalStyles();
            }, 300);
        }, 150);
    }

    cleanupModalStyles() {
        document.querySelectorAll('.status-option').forEach(option => {
            option.classList.remove('selected');
            option.style.backgroundColor = '';
            option.style.borderColor = '';
            option.style.boxShadow = '';
            option.style.animation = '';
            
            const textSpan = option.querySelector('span');
            if (textSpan) {
                textSpan.style.color = '';
                textSpan.style.fontWeight = '';
            }
            
            const colorCircle = option.querySelector('.status-color');
            if (colorCircle) {
                colorCircle.style.transform = '';
                colorCircle.style.boxShadow = '';
            }
        });
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

    // Método para inyectar animaciones CSS
    injectAnimations() {
        if (!document.querySelector('#status-animations')) {
            const style = document.createElement('style');
            style.id = 'status-animations';
            style.textContent = `
                @keyframes fadeOut {
                    from {
                        opacity: 1;
                        transform: translateX(2px) scale(1);
                    }
                    to {
                        opacity: 0.7;
                        transform: translateX(0) scale(0.98);
                    }
                }

                @keyframes statusPulse {
                    0% {
                        transform: translateX(2px) scale(1);
                    }
                    50% {
                        transform: translateX(2px) scale(1.02);
                    }
                    100% {
                        transform: translateX(2px) scale(1);
                    }
                }
            `;
            document.head.appendChild(style);
        }
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