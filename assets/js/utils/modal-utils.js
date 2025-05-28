// ========== UTILIDADES DE MODALES ==========
// Funciones para manejo centralizado de modales

// ========== GESTIÓN DE MODALES ==========
class ModalManager {
    constructor() {
        this.activeModals = new Set();
        this.setupGlobalListeners();
    }

    setupGlobalListeners() {
        // Listener para botones de cierre
        document.addEventListener('click', (e) => {
            const closeButton = e.target.closest('[data-bs-dismiss="modal"]');
            if (closeButton) {
                e.preventDefault();
                const modal = closeButton.closest('.modal');
                if (modal) {
                    this.hideModal(modal.id);
                }
            }

            // Clic en backdrop
            if (e.target.classList.contains('modal')) {
                e.preventDefault();
                this.hideModal(e.target.id);
            }
        });

        // Listener para tecla ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideTopModal();
            }
        });

        // Limpiar al cargar página
        window.addEventListener('load', () => {
            this.cleanupAllModals();
        });
    }

    showModal(modalId, options = {}) {
        const modalElement = document.getElementById(modalId);
        if (!modalElement) {
            console.error(`Modal con ID '${modalId}' no encontrado`);
            return null;
        }

        try {
            // Usar Bootstrap si está disponible
            if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                const modal = new bootstrap.Modal(modalElement, options);
                modal.show();
                this.activeModals.add(modalId);
                
                // Listener para cuando se cierre
                modalElement.addEventListener('hidden.bs.modal', () => {
                    this.activeModals.delete(modalId);
                    this.cleanupModal(modalElement);
                }, { once: true });
                
                return modal;
            } else {
                // Fallback manual
                this.showModalManually(modalElement);
                this.activeModals.add(modalId);
                return { element: modalElement };
            }
        } catch (error) {
            console.error('Error al mostrar modal:', error);
            return null;
        }
    }

    hideModal(modalId) {
        const modalElement = document.getElementById(modalId);
        if (!modalElement) return;

        try {
            if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                const modal = bootstrap.Modal.getInstance(modalElement);
                if (modal) {
                    modal.hide();
                } else {
                    this.hideModalManually(modalElement);
                }
            } else {
                this.hideModalManually(modalElement);
            }
            
            this.activeModals.delete(modalId);
        } catch (error) {
            console.error('Error al cerrar modal:', error);
            this.cleanupModal(modalElement);
        }
    }

    hideTopModal() {
        if (this.activeModals.size > 0) {
            const topModalId = Array.from(this.activeModals).pop();
            this.hideModal(topModalId);
        }
    }

    hideAllModals() {
        const modalsToClose = Array.from(this.activeModals);
        modalsToClose.forEach(modalId => {
            this.hideModal(modalId);
        });
    }

    showModalManually(modalElement) {
        // Mostrar modal manualmente sin Bootstrap
        modalElement.style.display = 'block';
        modalElement.classList.add('show');
        modalElement.setAttribute('aria-modal', 'true');
        modalElement.removeAttribute('aria-hidden');
        
        // Crear backdrop
        this.createBackdrop();
        
        // Configurar body
        document.body.classList.add('modal-open');
        
        // Animación
        setTimeout(() => {
            modalElement.style.opacity = '1';
        }, 150);
    }

    hideModalManually(modalElement) {
        // Ocultar modal manualmente
        modalElement.style.opacity = '0';
        
        setTimeout(() => {
            modalElement.style.display = 'none';
            modalElement.classList.remove('show');
            modalElement.setAttribute('aria-hidden', 'true');
            modalElement.removeAttribute('aria-modal');
            
            this.removeBackdrop();
            
            // Restablecer body si no hay más modales
            if (this.activeModals.size <= 1) {
                document.body.classList.remove('modal-open');
                document.body.style.paddingRight = '';
                document.body.style.overflow = '';
            }
        }, 150);
    }

    createBackdrop() {
        if (!document.querySelector('.modal-backdrop')) {
            const backdrop = document.createElement('div');
            backdrop.className = 'modal-backdrop fade show';
            document.body.appendChild(backdrop);
        }
    }

    removeBackdrop() {
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop && this.activeModals.size <= 1) {
            backdrop.remove();
        }
    }

    cleanupModal(modalElement) {
        // Limpiar estado del modal
        modalElement.style.display = 'none';
        modalElement.style.opacity = '';
        modalElement.classList.remove('show');
        modalElement.setAttribute('aria-hidden', 'true');
        modalElement.removeAttribute('aria-modal');
    }

    cleanupAllModals() {
        // Limpiar todos los modales y backdrops
        document.querySelectorAll('.modal.show').forEach(modal => {
            this.cleanupModal(modal);
        });

        document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
            backdrop.remove();
        });

        // Restablecer body
        document.body.classList.remove('modal-open');
        document.body.style.paddingRight = '';
        document.body.style.overflow = '';
        
        // Limpiar registro de modales activos
        this.activeModals.clear();
    }

    isModalActive(modalId) {
        return this.activeModals.has(modalId);
    }

    getActiveModals() {
        return Array.from(this.activeModals);
    }
}

// ========== FUNCIONES DE CONTENIDO DINÁMICO ==========
function setModalContent(modalId, content) {
    const modal = document.getElementById(modalId);
    if (!modal) return false;

    const modalBody = modal.querySelector('.modal-body');
    if (modalBody) {
        modalBody.innerHTML = content;
        return true;
    }
    return false;
}

function setModalTitle(modalId, title) {
    const modal = document.getElementById(modalId);
    if (!modal) return false;

    const modalTitle = modal.querySelector('.modal-title');
    if (modalTitle) {
        modalTitle.textContent = title;
        return true;
    }
    return false;
}

function addModalFooterButton(modalId, buttonConfig) {
    const modal = document.getElementById(modalId);
    if (!modal) return null;

    const modalFooter = modal.querySelector('.modal-footer');
    if (!modalFooter) return null;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = buttonConfig.className || 'btn btn-primary';
    button.textContent = buttonConfig.text || 'Botón';
    
    if (buttonConfig.onclick) {
        button.addEventListener('click', buttonConfig.onclick);
    }
    
    if (buttonConfig.attributes) {
        Object.keys(buttonConfig.attributes).forEach(attr => {
            button.setAttribute(attr, buttonConfig.attributes[attr]);
        });
    }

    modalFooter.appendChild(button);
    return button;
}

function clearModalFooter(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return false;

    const modalFooter = modal.querySelector('.modal-footer');
    if (modalFooter) {
        modalFooter.innerHTML = '';
        return true;
    }
    return false;
}

// ========== FUNCIONES DE LOADING ==========
function showModalLoading(modalId, message = 'Cargando...') {
    const loadingContent = `
        <div class="text-center p-4">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-2">${message}</p>
        </div>
    `;
    
    return setModalContent(modalId, loadingContent);
}

function hideModalLoading(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return false;

    const spinner = modal.querySelector('.spinner-border');
    if (spinner) {
        const container = spinner.closest('.text-center');
        if (container) {
            container.remove();
            return true;
        }
    }
    return false;
}

// ========== FUNCIONES DE CONFIRMACIÓN ==========
function showConfirmModal(options = {}) {
    const defaultOptions = {
        title: 'Confirmar acción',
        message: '¿Está seguro de que desea continuar?',
        confirmText: 'Confirmar',
        cancelText: 'Cancelar',
        confirmClass: 'btn-danger',
        onConfirm: () => {},
        onCancel: () => {}
    };

    const config = { ...defaultOptions, ...options };

    // Crear modal dinámico si no existe
    let confirmModal = document.getElementById('confirmModal');
    if (!confirmModal) {
        confirmModal = createConfirmModal();
        document.body.appendChild(confirmModal);
    }

    // Configurar contenido
    setModalTitle('confirmModal', config.title);
    setModalContent('confirmModal', `<p>${config.message}</p>`);

    // Limpiar y agregar botones
    clearModalFooter('confirmModal');
    
    addModalFooterButton('confirmModal', {
        text: config.cancelText,
        className: 'btn btn-secondary',
        onclick: () => {
            modalManager.hideModal('confirmModal');
            config.onCancel();
        }
    });

    addModalFooterButton('confirmModal', {
        text: config.confirmText,
        className: `btn ${config.confirmClass}`,
        onclick: () => {
            modalManager.hideModal('confirmModal');
            config.onConfirm();
        }
    });

    // Mostrar modal
    return modalManager.showModal('confirmModal');
}

function createConfirmModal() {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'confirmModal';
    modal.tabIndex = -1;
    modal.setAttribute('aria-labelledby', 'confirmModalLabel');
    modal.setAttribute('aria-hidden', 'true');

    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="confirmModalLabel">Confirmar</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                </div>
                <div class="modal-body"></div>
                <div class="modal-footer"></div>
            </div>
        </div>
    `;

    return modal;
}

// ========== INICIALIZACIÓN ==========
const modalManager = new ModalManager();

// ========== EXPORTAR FUNCIONES ==========
window.ModalUtils = {
    manager: modalManager,
    show: (modalId, options) => modalManager.showModal(modalId, options),
    hide: (modalId) => modalManager.hideModal(modalId),
    hideAll: () => modalManager.hideAllModals(),
    setContent: setModalContent,
    setTitle: setModalTitle,
    addFooterButton: addModalFooterButton,
    clearFooter: clearModalFooter,
    showLoading: showModalLoading,
    hideLoading: hideModalLoading,
    showConfirm: showConfirmModal,
    isActive: (modalId) => modalManager.isModalActive(modalId),
    getActive: () => modalManager.getActiveModals()
};

// Hacer funciones disponibles globalmente para compatibilidad
window.closeModal = (modalId) => modalManager.hideModal(modalId);
window.closeAllModals = () => modalManager.hideAllModals();