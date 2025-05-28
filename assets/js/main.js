// ========== GESTOR DE TRÁFICO - JAVASCRIPT PRINCIPAL ==========
// Archivo principal que inicializa toda la aplicación

// Variables globales de la aplicación
window.AppConfig = {
    initialized: false,
    currentUser: null,
    currentStatusElement: null,
    currentServiceData: null
};

// ========== INICIALIZACIÓN DE LA APLICACIÓN ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando Gestor de Tráfico...');
    
    // Inicializar componentes principales
    initializeApp();
    
    // Configurar event listeners globales
    setupGlobalEventListeners();
    
    // Inicializar tooltips de Bootstrap
    initializeTooltips();
    
    // Marcar como inicializado
    window.AppConfig.initialized = true;
    
    console.log('Aplicación inicializada correctamente');
});

// ========== FUNCIONES DE INICIALIZACIÓN ==========
function initializeApp() {
    // Inicializar sidebar
    initializeSidebar();
    
    // Inicializar formularios
    initializeForms();
    
    // Inicializar tablas
    initializeTables();
    
    // Inicializar modales
    initializeModals();
    
    // Configurar vista de tarifas
    
}

function initializeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.querySelector('.menu-toggle');
    
    if (!sidebar || !menuToggle) return;
    
    // Configurar toggle del sidebar
    menuToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleSidebar();
    });
    
    // Cerrar sidebar al hacer clic fuera (solo en móvil)
    document.addEventListener('click', function(event) {
        if (window.innerWidth <= 768) {
            if (!sidebar.contains(event.target) && !menuToggle.contains(event.target)) {
                sidebar.classList.remove('open');
            }
        }
    });
}

function initializeForms() {
    // Configurar formulario de búsqueda
    const searchForm = document.querySelector('.search-module');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleSearchSubmit();
        });
    }
    
    // Configurar selects y inputs
    initializeFormControls();
}

function initializeTables() {
    // Configurar tabla principal
    const detailTable = document.querySelector('.detail-table');
    if (detailTable) {
        setupTableInteractions();
    }
}

function initializeModals() {
    // Limpiar modales al cargar
    cleanUpModals();
    
    // Configurar event listeners de modales
    setupModalEventListeners();
}



// ========== FUNCIONES UTILITARIAS ==========
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('open');
    }
}

function handleSearchSubmit() {
    const origen = document.getElementById('origen')?.value;
    const destino = document.getElementById('destino')?.value;
    const fecha = document.getElementById('fecha')?.value;
    
    console.log('Búsqueda realizada:', { origen, destino, fecha });
    
    // Aquí se implementaría la lógica de búsqueda
    // Por ahora solo mostramos un mensaje
    showNotification('Búsqueda realizada correctamente', 'success');
}

function initializeFormControls() {
    // Configurar fecha por defecto
    const fechaInput = document.getElementById('fecha');
    if (fechaInput && !fechaInput.value) {
        const today = new Date().toISOString().split('T')[0];
        fechaInput.value = today;
    }
    
    // Configurar otros controles si es necesario
    setupSelectControls();
}

function setupSelectControls() {
    // Configurar selects con Select2 si está disponible
    if (typeof $ !== 'undefined' && $.fn.select2) {
        $('.select2-enable').select2({
            theme: 'bootstrap-5',
            width: '100%'
        });
    }
}

function setupTableInteractions() {
    // Configurar hover effects y interacciones de tabla
    const tableRows = document.querySelectorAll('.detail-table tbody tr');
    
    tableRows.forEach(row => {
        // Agregar efectos de hover personalizados si es necesario
        row.addEventListener('mouseenter', function() {
            // Lógica personalizada de hover
        });
        
        row.addEventListener('mouseleave', function() {
            // Lógica personalizada de salida de hover
        });
    });
}

function setupGlobalEventListeners() {
    // Listener para redimensionar ventana
    window.addEventListener('resize', function() {
        handleWindowResize();
    });
    
    // Listener para teclas globales
    document.addEventListener('keydown', function(e) {
        handleGlobalKeyPress(e);
    });
    
    // Listener para errores globales
    window.addEventListener('error', function(e) {
        console.error('Error global capturado:', e);
    });
}

function handleWindowResize() {
    // Cerrar sidebar en móvil cuando se redimensiona
    if (window.innerWidth > 768) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.remove('open');
        }
    }
    
    // Otras lógicas de redimensionamiento
    updateResponsiveElements();
}

function handleGlobalKeyPress(e) {
    // ESC para cerrar modales
    if (e.key === 'Escape') {
        closeAllModals();
    }
    
    // Ctrl+S para guardar (prevenir comportamiento por defecto)
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        // Lógica de guardado si hay algo activo
    }
}

function updateResponsiveElements() {
    // Actualizar elementos que necesiten ajustes responsivos
    const metricsGrid = document.querySelector('.metrics-grid');
    if (metricsGrid && window.innerWidth <= 768) {
        // Ajustes específicos para móvil
    }
}

// ========== FUNCIONES DE MODAL ==========
function setupModalEventListeners() {
    // Event listeners para botones de cierre
    document.addEventListener('click', function(e) {
        const closeButton = e.target.closest('[data-bs-dismiss="modal"]');
        if (closeButton) {
            e.preventDefault();
            const modal = closeButton.closest('.modal');
            if (modal && modal.id) {
                closeModal(modal.id);
            }
        }
        
        // Clic en backdrop
        if (e.target.classList.contains('modal')) {
            e.preventDefault();
            closeModal(e.target.id);
        }
    });
}

function cleanUpModals() {
    // Eliminar todos los modales y backdrops
    document.querySelectorAll('.modal.show').forEach(modal => {
        modal.classList.remove('show');
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
        modal.removeAttribute('aria-modal');
    });
    
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
        backdrop.remove();
    });
    
    // Restablecer el body
    document.body.classList.remove('modal-open');
    document.body.style.paddingRight = '';
    document.body.style.overflow = '';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        const bsModal = bootstrap.Modal.getInstance(modal);
        if (bsModal) {
            bsModal.hide();
            setTimeout(cleanUpModals, 300);
            return;
        }
    }
    
    cleanUpModals();
}

function closeAllModals() {
    cleanUpModals();
}

// ========== FUNCIONES DE TOOLTIPS ==========
function initializeTooltips() {
    if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
        const tooltipTriggerList = [].slice.call(
            document.querySelectorAll('[data-bs-toggle="tooltip"]')
        );
        
        tooltipTriggerList.forEach(function(tooltipTriggerEl) {
            if (!tooltipTriggerEl._tooltip) {
                new bootstrap.Tooltip(tooltipTriggerEl);
                tooltipTriggerEl._tooltip = true;
            }
        });
    }
}

// ========== FUNCIONES DE NOTIFICACIÓN ==========
function showNotification(message, type = 'info', duration = 3000) {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} notification-toast`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remover después del tiempo especificado
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, duration);
}

// ========== FUNCIONES UTILITARIAS GLOBALES ==========
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction() {
        const context = this;
        const args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ========== EXPORTAR FUNCIONES GLOBALES ==========
// Hacer funciones disponibles globalmente
window.toggleSidebar = toggleSidebar;
window.closeModal = closeModal;
window.closeAllModals = closeAllModals;
window.showNotification = showNotification;
window.initializeTooltips = initializeTooltips;

// Forzar limpieza al cargar la página
window.addEventListener('load', cleanUpModals);