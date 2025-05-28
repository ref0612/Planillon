// ========== EDITOR DE SERVICIOS ==========
// Maneja la edición de servicios y formularios relacionados

// ========== CLASE PRINCIPAL ==========
class EditServiceHandler {
    constructor() {
        this.currentServiceData = null;
        this.formTemplate = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadFormTemplate();
    }

    /**
     * Carga la plantilla del formulario de edición
     * Este método se llama automáticamente al inicializar el componente
     */
    async loadFormTemplate() {
        // Verificar si ya tenemos la plantilla cargada
        if (this.formTemplate) {
            return this.formTemplate;
        }

        // Intentar cargar la plantilla desde el DOM
        const templateElement = document.getElementById('edit-service-template');
        if (templateElement) {
            this.formTemplate = templateElement.innerHTML;
            return this.formTemplate;
        }
        
        // Usar la plantilla de respaldo
        this.formTemplate = `
            <div class="modal fade" id="editServiceModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Editar Servicio</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                        </div>
                        <div class="modal-body" id="editServiceFormContainer">
                            <!-- El contenido del formulario se cargará aquí dinámicamente -->
                        </div>
                    </div>
                </div>
            </div>
        `;
        return this.formTemplate;
    }

    setupEventListeners() {
        // Event delegation para botones de editar
        document.addEventListener('click', (e) => {
            const editButton = e.target.closest('.action-btn[title="Editar"]');
            if (editButton) {
                this.handleEditClick(editButton, e);
            }
        });

        // Event listener para guardar cambios
        document.addEventListener('click', (e) => {
            if (e.target.id === 'guardarCambiosBtn') {
                this.handleSaveChanges(e);
            }
        });

        // Event listeners para formulario
        this.setupFormListeners();
    }

    setupFormListeners() {
        // Event delegation para selects con Select2
        document.addEventListener('change', (e) => {
            if (e.target.matches('.select2-buscar')) {
                this.handleSelectChange(e);
            }
        });
    }

    handleEditClick(editButton, event) {
        event.preventDefault();
        event.stopPropagation();

        console.log('Botón de editar clickeado');

        const row = editButton.closest('tr');
        if (!row) {
            console.error('No se encontró la fila');
            return;
        }

        // Extraer datos del servicio
        const serviceData = this.extractServiceData(row);
        console.log('Datos del servicio:', serviceData);

        // Mostrar modal de edición
        this.showEditModal(serviceData);
    }

    extractServiceData(row) {
        const cells = row.cells;
        
        return {
            numero: cells[2]?.textContent?.trim() || '',
            fecha: new Date().toISOString().split('T')[0],
            variante: cells[3]?.textContent?.trim() || '',
            hora: cells[5]?.textContent?.trim() || '',
            chofer1: cells[6]?.textContent?.trim() || '',
            chofer2: '', // No hay columna para conductor 2
            bus: cells[4]?.textContent?.trim() || '',
            estado: row.querySelector('.status-indicator')?.classList.contains('status-alert') ? 'alerta' : 'normal'
        };
    }

    showEditModal(serviceData) {
        console.log('Mostrando modal de edición con datos:', serviceData);

        try {
            this.currentServiceData = serviceData;

            // Verificar que existe el modal
            const modalElement = document.getElementById('editServiceModal');
            if (!modalElement) {
                console.error('Error: No se encontró el elemento del modal con ID editServiceModal');
                return;
            }

            console.log('Elemento del modal encontrado');

            // Cargar contenido del formulario
            this.loadFormContent(serviceData);

            // Mostrar modal
            if (window.ModalUtils) {
                window.ModalUtils.show('editServiceModal');
            } else {
                // Fallback
                const modal = new bootstrap.Modal(modalElement);
                modal.show();
            }

            console.log('Modal mostrado correctamente');

        } catch (error) {
            console.error('Error en showEditModal:', error);
            this.showError('Ocurrió un error al intentar abrir el formulario de edición.');
        }
    }

    loadFormContent(serviceData) {
        const modalBody = document.querySelector('#editServiceModal .modal-body');
        if (!modalBody) return;

        // Crear el contenido del formulario
        const formContent = this.createFormContent(serviceData);
        modalBody.innerHTML = formContent;

        // Inicializar Select2 después de cargar el contenido
        setTimeout(() => {
            this.initializeSelect2();
        }, 100);
    }

    createFormContent(serviceData) {
        return `
            <form>
                <!-- Detalles del servicio -->
                <div class="border rounded p-1 mb-1" style="border-color:#ddd; background:#fff;">
                    <div class="row gx-1 gy-0 align-items-center">
                        <div class="col-4 col-md-2 d-flex align-items-center">
                            <label class="form-label mb-0 text-muted" style="font-size:10px; color:#666; width: auto; white-space: nowrap; margin-right: 0.25rem;">N° servicio</label>
                            <input type="text" class="form-control form-control-sm miniinput" value="${serviceData.numero}" readonly style="background:#f7f7fa; height: 22px; font-size: 10px; padding: 0 5px;">
                        </div>
                        <div class="col-8 col-md-5 d-flex align-items-center" style="margin-left: 0.5rem;">
                            <label class="form-label mb-0 text-muted" style="font-size:10px; color:#666; width: auto; white-space: nowrap; margin-right: 0.25rem;">Servicio</label>
                            <input type="text" class="form-control form-control-sm miniinput" value="${serviceData.numero}" readonly style="background:#f7f7fa; height: 22px; font-size: 10px; padding: 0 5px;">
                        </div>
                        <div class="col-6 col-md-2 d-flex align-items-center"> 
                            <label class="form-label mb-0 text-muted" style="font-size:10px; color:#666; width: auto; white-space: nowrap; margin-right: 0.25rem;">Hora</label>
                            <input type="text" class="form-control form-control-sm miniinput" value="${serviceData.hora}" readonly style="background:#f7f7fa; height: 22px; font-size: 10px; padding: 0 5px;">
                        </div>
                    </div>
                </div>

                <!-- Sección Editar servicios -->
                <div class="border rounded p-3 mb-3" style="border-color:#ddd; background:#fff;">
                    <div class="fw-bold mb-3" style="font-size:15px; color:#222;">Editar servicios</div>
                    <div class="row gx-3 gy-2">
                        <!-- Izquierda -->
                        <div class="col-12 col-md-6">
                            <div class="row align-items-center mb-2">
                                <label class="col-4 col-form-label text-muted" style="font-size:12px;">Ruta</label>
                                <div class="col-8">
                                    <select class="form-select form-select-sm miniinput" id="editServiceRuta">
                                        <option selected>Melipilla - Stgo x Terminal</option>
                                        <option>Santiago - Melipilla x Terminal</option>
                                        <option>Valparaíso - Santiago</option>
                                    </select>
                                </div>
                            </div>
                            <div class="row align-items-center mb-2">
                                <label class="col-4 col-form-label text-muted" style="font-size:12px;">Hora salida</label>
                                <div class="col-8">
                                    <input type="time" class="form-control form-control-sm miniinput" value="${this.convertToTimeFormat(serviceData.hora)}" id="editServiceHora">
                                </div>
                            </div>
                            <div class="row align-items-center mb-2">
                                <label class="col-4 col-form-label text-muted" style="font-size:12px;">Tipo de bus</label>
                                <div class="col-8">
                                    <select class="form-select form-select-sm miniinput" id="editServiceTipoBus">
                                        <option selected>2-Bus-46-Asientos</option>
                                        <option>1-Bus-45-Asientos</option>
                                        <option>3-Bus-50-Asientos</option>
                                    </select>
                                </div>
                            </div>
                            <div class="row align-items-center mb-0">
                                <label class="col-4 col-form-label text-muted" style="font-size:12px;">Bus</label>
                                <div class="col-8">
                                    <select class="form-select form-select-sm miniinput select2-buscar" id="editServiceBus">
                                        <option value="${serviceData.bus}" selected>${serviceData.bus}</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <!-- Derecha -->
                        <div class="col-12 col-md-6">
                            <div class="row align-items-center mb-2">
                                <label class="col-4 col-form-label text-muted" style="font-size:12px;">Conductor 1</label>
                                <div class="col-8">
                                    <select class="form-select form-select-sm miniinput select2-buscar" id="editServiceChofer1">
                                        <option value="${serviceData.chofer1}" selected>${serviceData.chofer1}</option>
                                    </select>
                                </div>
                            </div>
                            <div class="row align-items-center mb-2">
                                <label class="col-4 col-form-label text-muted" style="font-size:12px;">Conductor 2</label>
                                <div class="col-8">
                                    <select class="form-select form-select-sm miniinput select2-buscar" id="editServiceChofer2">
                                        <option value="">Seleccionar conductor</option>
                                        <option value="Juan Pérez">Juan Pérez</option>
                                        <option value="María González">María González</option>
                                    </select>
                                </div>
                            </div>
                            <div class="row align-items-center mb-2">
                                <label class="col-4 col-form-label text-muted" style="font-size:12px;">Auxiliar</label>
                                <div class="col-8">
                                    <select class="form-select form-select-sm miniinput select2-buscar" id="editServiceAuxiliar">
                                        <option value="">Seleccionar auxiliar</option>
                                        <option value="Carlos Rodríguez">Carlos Rodríguez</option>
                                        <option value="Ana López">Ana López</option>
                                    </select>
                                </div>
                            </div>
                            <div class="row align-items-center mb-0">
                                <label class="col-4 col-form-label text-muted" style="font-size:12px;">Operado por</label>
                                <div class="col-8">
                                    <select class="form-select form-select-sm miniinput" id="editServiceOperadoPor">
                                        <option selected>Conductor 1</option>
                                        <option>Conductor 2</option>
                                        <option>Auxiliar</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Botones -->
                <div class="d-flex justify-content-end gap-2">
                    <button type="button" class="btn" style="background:#fff;color:#ef4444; border-radius:8px;border:1px solid #ef4444;min-width:110px;font-size:13px;height:32px;" id="guardarCambiosBtn">Guardar cambios</button>
                </div>
            </form>
        `;
    }

    convertToTimeFormat(timeString) {
        // Convertir hora del formato "06:30" a "06:30" para input time
        if (!timeString) return '';
        
        // Si ya está en formato correcto
        if (timeString.match(/^\d{2}:\d{2}$/)) {
            return timeString;
        }
        
        // Intentar extraer hora de diferentes formatos
        const timeMatch = timeString.match(/(\d{1,2}):(\d{2})/);
        if (timeMatch) {
            const hours = timeMatch[1].padStart(2, '0');
            const minutes = timeMatch[2];
            return `${hours}:${minutes}`;
        }
        
        return '';
    }

    initializeSelect2() {
        try {
            // Verificar si hay elementos con la clase select2-buscar
            const $selects = $('.select2-buscar');
            if ($selects.length === 0) {
                console.log('No se encontraron elementos para inicializar con Select2');
                return;
            }

            // Destruir solo las instancias existentes de Select2
            $selects.each(function() {
                const $select = $(this);
                if ($select.hasClass('select2-hidden-accessible')) {
                    $select.select2('destroy');
                }
                $select.off('select2:select');
            });
            
            console.log('Select2 limpiado correctamente');
            
            // Configuración básica de Select2
            $selects.select2({
                theme: 'bootstrap-5',
                dropdownParent: $('#editServiceModal'),
                placeholder: 'Seleccionar...',
                allowClear: true,
                width: '100%',
                minimumInputLength: 0
            });
            
            console.log('Select2 inicializado correctamente en', $selects.length, 'elementos');
            
        } catch (select2Error) {
            console.error('Error al inicializar Select2:', select2Error);
        }
    }

    handleSelectChange(event) {
        console.log('Select cambiado:', event.target.id, event.target.value);
        // Aquí se puede agregar lógica adicional cuando cambia un select
    }

    handleSaveChanges(event) {
        event.preventDefault();
        console.log('Guardando cambios...');

        try {
            // Recopilar datos del formulario
            const formData = this.collectFormData();
            console.log('Datos del formulario:', formData);

            // Validar datos
            if (!this.validateFormData(formData)) {
                return;
            }

            // Simular guardado (aquí iría la llamada a la API)
            this.saveServiceData(formData);

            // Cerrar modal
            if (window.ModalUtils) {
                window.ModalUtils.hide('editServiceModal');
            } else {
                const modal = bootstrap.Modal.getInstance(document.getElementById('editServiceModal'));
                if (modal) modal.hide();
            }

            // Mostrar mensaje de éxito
            this.showSuccess('Los cambios se han guardado correctamente');

            // Actualizar tabla si es necesario
            this.updateTableRow(formData);

        } catch (error) {
            console.error('Error al guardar cambios:', error);
            this.showError('Ocurrió un error al guardar los cambios');
        }
    }

    collectFormData() {
        return {
            ruta: document.getElementById('editServiceRuta')?.value || '',
            hora: document.getElementById('editServiceHora')?.value || '',
            tipoBus: document.getElementById('editServiceTipoBus')?.value || '',
            bus: document.getElementById('editServiceBus')?.value || '',
            chofer1: document.getElementById('editServiceChofer1')?.value || '',
            chofer2: document.getElementById('editServiceChofer2')?.value || '',
            auxiliar: document.getElementById('editServiceAuxiliar')?.value || '',
            operadoPor: document.getElementById('editServiceOperadoPor')?.value || ''
        };
    }

    validateFormData(formData) {
        // Validaciones básicas
        if (!formData.hora) {
            this.showError('La hora de salida es requerida');
            return false;
        }

        if (!formData.chofer1) {
            this.showError('El conductor 1 es requerido');
            return false;
        }

        if (!formData.bus) {
            this.showError('El bus es requerido');
            return false;
        }

        return true;
    }

    saveServiceData(formData) {
        // Aquí iría la lógica para guardar en el servidor
        console.log('Guardando en servidor:', formData);
        
        // Simular delay de red
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true });
            }, 500);
        });
    }

    updateTableRow(formData) {
        // Actualizar la fila de la tabla con los nuevos datos
        // Esta es una implementación básica
        console.log('Actualizando fila de tabla con:', formData);
    }

    showSuccess(message) {
        if (window.showNotification) {
            window.showNotification(message, 'success');
        } else {
            alert(message);
        }
    }

    showError(message) {
        if (window.showNotification) {
            window.showNotification(message, 'error');
        } else {
            alert(message);
        }
    }

    // Método para limpiar el formulario
    clearForm() {
        const modal = document.getElementById('editServiceModal');
        if (modal) {
            const form = modal.querySelector('form');
            if (form) {
                form.reset();
            }
        }
    }

    // Método para destruir el handler
    destroy() {
        this.currentServiceData = null;
        this.formTemplate = null;
    }
}

// ========== FUNCIONES AUXILIARES ==========
function initEditServiceHandler() {
    console.log('Inicializando manejador de edición...');
    return new EditServiceHandler();
}

// ========== INICIALIZACIÓN ==========
const editServiceHandler = new EditServiceHandler();

// ========== EXPORTAR ==========
window.EditServiceHandler = EditServiceHandler;
window.editServiceHandler = editServiceHandler;
window.initEditServiceHandler = initEditServiceHandler;