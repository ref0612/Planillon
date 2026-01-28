// ========== EDITOR DE SERVICIOS ==========
// Maneja la edición de servicios y formularios relacionados

// ========== CLASE PRINCIPAL ==========
class EditServiceHandler {
    constructor() {
        this.currentServiceData = null;
        this.formTemplate = null;
        
        // Variables para reasignación de asientos
        this.currentBusSeats = [];
        this.newBusSeats = [];
        this.seatMappings = {};
        this.originalModalFooter = null;
        this.busConfigurations = {};
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadFormTemplate();
        this.initializeBusConfigurations();
    }

    /**
     * Inicializa las configuraciones de buses
     */
    initializeBusConfigurations() {
        this.busConfigurations = {
            '21': { type: '2+2 Semi Cama', seats: 46, layout: 'layout-46' },
            '32': { type: '2+2 Semi Cama', seats: 46, layout: 'layout-46' },
            '45': { type: '2+2 Ejecutivo', seats: 42, layout: 'layout-42' },
            '54': { type: '2+1 Salón Cama', seats: 36, layout: 'layout-36' },
            '63': { type: '2+2 Semi Cama', seats: 46, layout: 'layout-46' },
            '87': { type: '2+2 Premium', seats: 50, layout: 'layout-46' },
            '76': { type: '2+1 Premium', seats: 38, layout: 'layout-36' },
            // Bus actual (simulado como bus pequeño para demo)
            'default': { type: '2+2 Mini', seats: 20, layout: 'layout-20' }
        };
    }

    /**
     * Carga la plantilla del formulario de edición
     */
    async loadFormTemplate() {
        if (this.formTemplate) {
            return this.formTemplate;
        }

        const templateElement = document.getElementById('edit-service-template');
        if (templateElement) {
            this.formTemplate = templateElement.innerHTML;
            return this.formTemplate;
        }
        
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
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-primary" id="guardarCambiosBtn">Guardar cambios</button>
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

        const serviceData = this.extractServiceData(row);
        console.log('Datos del servicio:', serviceData);

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
            chofer2: '', 
            bus: cells[4]?.textContent?.trim() || '',
            estado: row.querySelector('.status-indicator')?.classList.contains('status-alert') ? 'alerta' : 'normal'
        };
    }

    showEditModal(serviceData) {
        console.log('Mostrando modal de edición con datos:', serviceData);

        try {
            this.currentServiceData = serviceData;

            const modalElement = document.getElementById('editServiceModal');
            if (!modalElement) {
                console.error('Error: No se encontró el elemento del modal con ID editServiceModal');
                return;
            }

            // Resetear modal al estado original
            this.resetModalToOriginalState();

            // Cargar contenido del formulario
            this.loadFormContent(serviceData);

            // Guardar botones originales después de cargar contenido
            setTimeout(() => {
                this.saveOriginalFooter();
            }, 100);

            // Mostrar modal
            if (window.ModalUtils) {
                window.ModalUtils.show('editServiceModal');
            } else {
                const modal = new bootstrap.Modal(modalElement);
                modal.show();
            }

            console.log('Modal mostrado correctamente');

        } catch (error) {
            console.error('Error en showEditModal:', error);
            this.showError('Ocurrió un error al intentar abrir el formulario de edición.');
        }
    }

    resetModalToOriginalState() {
        const modal = document.getElementById('editServiceModal');
        if (!modal) return;

        const modalBody = modal.querySelector('.modal-body');
        if (modalBody) {
            const tabs = modalBody.querySelector('.nav-tabs');
            const tabContent = modalBody.querySelector('.tab-content');
            
            if (tabs && tabContent) {
                const serviceDetailsPane = tabContent.querySelector('#service-details .p-3');
                if (serviceDetailsPane) {
                    modalBody.innerHTML = serviceDetailsPane.innerHTML;
                } else {
                    modalBody.innerHTML = '';
                }
            }
        }

        // Restaurar botones originales si están guardados
        if (this.originalModalFooter) {
            const footer = modal.querySelector('.modal-footer');
            if (footer) {
                footer.innerHTML = this.originalModalFooter;
            }
        }

        // Limpiar variables de asientos
        this.currentBusSeats = [];
        this.newBusSeats = [];
        this.seatMappings = {};
    }

    saveOriginalFooter() {
        const modal = document.getElementById('editServiceModal');
        const footer = modal?.querySelector('.modal-footer');
        
        if (footer && !this.originalModalFooter) {
            this.originalModalFooter = footer.innerHTML;
            console.log('Botones originales guardados');
        }
    }

    loadFormContent(serviceData) {
        const modalBody = document.querySelector('#editServiceModal .modal-body');
        if (!modalBody) return;

        const formContent = this.createFormContent(serviceData);
        modalBody.innerHTML = formContent;

        setTimeout(() => {
            this.initializeSelect2();
        }, 100);
    }

    createFormContent(serviceData) {
        return `
            <form>
                <!-- Información del servicio (Solo lectura) -->
                <div class="service-info-section">
                    <div class="row g-3">
                        <div class="col-md-4">
                            <label class="form-label">N° servicio</label>
                            <input type="text" class="form-control form-control-sm" value="${serviceData.numero}" readonly>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label">Servicio</label>
                            <input type="text" class="form-control form-control-sm" value="${serviceData.numero}" readonly>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label">Hora</label>
                            <input type="text" class="form-control form-control-sm" value="${serviceData.hora}" readonly>
                        </div>
                    </div>
                </div>

                <!-- Sección Editar servicios -->
                <div class="card">
                    <div class="card-header">
                        <h6>Editar servicios</h6>
                    </div>
                    <div class="card-body">
                        <div class="row g-3">
                            <!-- Columna izquierda -->
                            <div class="col-md-6">
                                <div class="form-group-styled">
                                    <label class="form-label">Ruta</label>
                                    <input type="text" class="form-control form-control-styled" value="${serviceData.variante || ''}" id="editServiceRuta" readonly>
                                </div>
                                <div class="form-group-styled">
                                    <label class="form-label">Hora salida</label>
                                    <input type="time" class="form-control form-control-styled" value="${this.convertToTimeFormat(serviceData.hora)}" id="editServiceHora">
                                </div>
                                <div class="form-group-styled">
                                    <label class="form-label">Tipo de bus</label>
                                    <select class="form-select form-select-styled" id="editServiceTipoBus">
                                        <option value="2-46" selected>2+2 Semi Cama - 46 Asientos</option>
                                        <option value="2-42">2+2 Ejecutivo - 42 Asientos</option>
                                        <option value="1-36">2+1 Salón Cama - 36 Asientos</option>
                                        <option value="2-50">2+2 Premium - 50 Asientos</option>
                                    </select>
                                </div>
                                <div class="form-group-styled">
                                    <label class="form-label">Bus</label>
                                    <select class="form-select form-select-styled select2-buscar" id="editServiceBus">
                                        <option value="${serviceData.bus}" selected>Bus ${serviceData.bus}</option>
                                        <option value="21">Bus 21</option>
                                        <option value="32">Bus 32</option>
                                        <option value="45">Bus 45</option>
                                        <option value="54">Bus 54</option>
                                        <option value="63">Bus 63</option>
                                        <option value="87">Bus 87</option>
                                        <option value="76">Bus 76</option>
                                    </select>
                                </div>
                            </div>

                            <!-- Columna derecha -->
                            <div class="col-md-6">
                                <div class="form-group-styled">
                                    <label class="form-label">Conductor 1</label>
                                    <select class="form-select form-select-styled select2-buscar" id="editServiceChofer1">
                                        <option value="${serviceData.chofer1}" selected>${serviceData.chofer1}</option>
                                        <option value="Jatenas">Jatenas</option>
                                        <option value="Martínez">Martínez</option>
                                        <option value="González">González</option>
                                        <option value="Contreras">Contreras</option>
                                        <option value="Herrera">Herrera</option>
                                        <option value="López">López</option>
                                        <option value="Ramírez">Ramírez</option>
                                        <option value="Muñoz">Muñoz</option>
                                        <option value="Fernández">Fernández</option>
                                        <option value="Bravo">Bravo</option>
                                        <option value="Paredes">Paredes</option>
                                    </select>
                                </div>
                                <div class="form-group-styled">
                                    <label class="form-label">Conductor 2</label>
                                    <select class="form-select form-select-styled select2-buscar" id="editServiceChofer2">
                                        <option value="">Seleccionar conductor</option>
                                        <option value="Jatenas">Jatenas</option>
                                        <option value="Martínez">Martínez</option>
                                        <option value="González">González</option>
                                        <option value="Contreras">Contreras</option>
                                        <option value="Herrera">Herrera</option>
                                        <option value="López">López</option>
                                        <option value="Ramírez">Ramírez</option>
                                        <option value="Muñoz">Muñoz</option>
                                        <option value="Fernández">Fernández</option>
                                        <option value="Bravo">Bravo</option>
                                        <option value="Paredes">Paredes</option>
                                    </select>
                                </div>
                                <div class="form-group-styled">
                                    <label class="form-label">Auxiliar</label>
                                    <select class="form-select form-select-styled select2-buscar" id="editServiceAuxiliar">
                                        <option value="">Seleccionar auxiliar</option>
                                        <option value="Carlos Rodríguez">Carlos Rodríguez</option>
                                        <option value="Ana López">Ana López</option>
                                        <option value="Miguel Torres">Miguel Torres</option>
                                        <option value="Carmen Silva">Carmen Silva</option>
                                        <option value="Roberto Díaz">Roberto Díaz</option>
                                    </select>
                                </div>
                                <div class="form-group-styled">
                                    <label class="form-label">Operado por</label>
                                    <select class="form-select form-select-styled" id="editServiceOperadoPor">
                                        <option value="conductor1" selected>Conductor 1</option>
                                        <option value="conductor2">Conductor 2</option>
                                        <option value="auxiliar">Auxiliar</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        `;
    }

    convertToTimeFormat(timeString) {
        if (!timeString) return '';
        
        if (timeString.match(/^\d{2}:\d{2}$/)) {
            return timeString;
        }
        
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
            const $selects = $('.select2-buscar');
            if ($selects.length === 0) {
                console.log('No se encontraron elementos para inicializar con Select2');
                return;
            }

            $selects.each(function() {
                const $select = $(this);
                if ($select.hasClass('select2-hidden-accessible')) {
                    $select.select2('destroy');
                }
                $select.off('select2:select');
            });
            
            console.log('Select2 limpiado correctamente');
            
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
    }

    handleSaveChanges(event) {
        event.preventDefault();
        console.log('Guardando cambios...');

        try {
            const formData = this.collectFormData();
            console.log('Datos del formulario:', formData);

            if (!this.validateFormData(formData)) {
                return;
            }

            // Detectar cambios
            const busChanged = this.requiresSeatReassignment(formData);
            // Si solo cambia el bus
            if (busChanged) {
                this.showSeatReassignmentStep(formData);
                return;
            }
            // Guardar directamente si no hay cambios críticos
            this.saveServiceData(formData);
            this.closeModal();
            this.showSuccess('Los cambios se han guardado correctamente');
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
        console.log('Guardando en servidor:', formData);
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true });
            }, 500);
        });
    }

    updateTableRow(formData) {
        console.log('Actualizando fila de tabla con:', formData);
    }

    closeModal() {
        if (window.ModalUtils) {
            window.ModalUtils.hide('editServiceModal');
        } else {
            const modal = bootstrap.Modal.getInstance(document.getElementById('editServiceModal'));
            if (modal) modal.hide();
        }
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

    showInfo(message) {
        if (window.showNotification) {
            window.showNotification(message, 'info');
        } else {
            console.log('Info:', message);
        }
    }

    // ========== FUNCIONALIDAD DE REASIGNACIÓN DE ASIENTOS ==========
    
    requiresSeatReassignment(formData) {
        const originalBus = this.currentServiceData?.bus;
        const newBus = formData.bus;
        
        console.log('Verificando reasignación:', {
            originalBus: originalBus,
            newBus: newBus,
            cambio: originalBus !== newBus
        });
        
        if (originalBus !== newBus) {
            const hasOccupiedSeats = this.hasOccupiedSeats();
            console.log('Hay asientos ocupados:', hasOccupiedSeats);
            return hasOccupiedSeats;
        }
        return false;
    }

    hasOccupiedSeats() {
        // Simular que hay asientos ocupados
        return true;
    }

    showSeatReassignmentStep(formData) {
        console.log('Mostrando paso de reasignación de asientos');
        
        this.addSeatReassignmentTab(formData);
        this.switchToSeatReassignmentTab();
        this.loadSeatData(formData);
        
        this.showInfo('Cambio de bus detectado. Por favor, reasigne los asientos ocupados.');
    }

    addSeatReassignmentTab(formData) {
        const modal = document.getElementById('editServiceModal');
        if (!modal) {
            console.error('Modal no encontrado');
            return;
        }

        let tabsContainer = modal.querySelector('.nav-tabs');
        let tabContentContainer = modal.querySelector('.tab-content');
        
        if (!tabsContainer) {
            console.log('Creando estructura de pestañas');
            const modalBody = modal.querySelector('.modal-body');
            const originalContent = modalBody.innerHTML;
            
            modalBody.innerHTML = `
                <ul class="nav nav-tabs" id="editServiceTabs" role="tablist">
                    <li class="nav-item" role="presentation">
                        <button class="nav-link active" id="service-details-tab" data-bs-toggle="tab" 
                                data-bs-target="#service-details" type="button" role="tab">
                            <i class="fas fa-info-circle me-1"></i>
                            Detalles del Servicio
                        </button>
                    </li>
                </ul>
                <div class="tab-content" id="editServiceTabsContent">
                    <div class="tab-pane fade show active" id="service-details" role="tabpanel">
                        <div class="p-3">
                            ${originalContent}
                        </div>
                    </div>
                </div>
            `;
            
            tabsContainer = modal.querySelector('.nav-tabs');
            tabContentContainer = modal.querySelector('.tab-content');
        }

        if (modal.querySelector('#seat-mapping-tab')) {
            console.log('Pestaña de reasignación ya existe');
            return;
        }

        console.log('Agregando pestaña de reasignación');
        
        const seatMappingTab = document.createElement('li');
        seatMappingTab.className = 'nav-item';
        seatMappingTab.setAttribute('role', 'presentation');
        seatMappingTab.innerHTML = `
            <button class="nav-link" id="seat-mapping-tab" data-bs-toggle="tab" 
                    data-bs-target="#seat-mapping" type="button" role="tab">
                <i class="fas fa-exchange-alt me-1"></i>
                Reasignación de Asientos
            </button>
        `;
        tabsContainer.appendChild(seatMappingTab);

        const seatMappingContent = document.createElement('div');
        seatMappingContent.className = 'tab-pane fade';
        seatMappingContent.id = 'seat-mapping';
        seatMappingContent.setAttribute('role', 'tabpanel');
        seatMappingContent.innerHTML = this.getSeatReassignmentHTML(formData);
        tabContentContainer.appendChild(seatMappingContent);
    }

    getSeatReassignmentHTML(formData) {
        const currentBusConfig = this.busConfigurations[this.currentServiceData?.bus] || this.busConfigurations['default'];
        const newBusConfig = this.busConfigurations[formData.bus] || this.busConfigurations[formData.bus] || this.busConfigurations['21'];
        
        return `
            <div class="p-0">
                <!-- Información del cambio -->
                <div class="bg-light p-3 border-bottom">
                    <div class="row text-center">
                        <div class="col-md-4">
                            <small class="text-muted d-block">Ruta:</small>
                            <strong id="seatMappingRoute">${formData.ruta || 'Melipilla - Santiago'}</strong>
                        </div>
                        <div class="col-md-4">
                            <small class="text-muted d-block">Hora:</small>
                            <strong id="seatMappingTime">${formData.hora || this.currentServiceData?.hora}</strong>
                        </div>
                        <div class="col-md-4">
                            <small class="text-muted d-block">Asientos ocupados:</small>
                            <strong class="text-danger" id="seatMappingOccupied">12 asientos</strong>
                        </div>
                    </div>
                </div>

                <!-- Contenedor principal -->
                <div class="seat-mapping-container">
                    <!-- Bus Actual -->
                    <div class="bus-info">
                        <h5>Bus Actual (${this.currentServiceData?.bus})</h5>
                        <div class="bus-details" id="currentBusDetails">
                            Tipo: ${currentBusConfig.type}<br>
                            Asientos: ${currentBusConfig.seats}<br>
                            Ocupados: 12
                        </div>
                        <div class="seat-map ${currentBusConfig.layout}" id="currentBusMap">
                            <!-- Asientos se llenan dinámicamente -->
                        </div>
                    </div>

                    <!-- Tabla de mapeo -->
                    <div class="mapping-table-container">
                        <div class="mapping-table">
                            <div class="mapping-table-header">
                                <h6>
                                    <i class="fas fa-arrows-alt-h me-2"></i>
                                    Asignación de Asientos
                                </h6>
                                
                                <!-- Botones de auto-asignación -->
                                <div class="auto-actions mt-3">
                                    <button class="auto-btn primary" onclick="editServiceHandler.autoMapByNumber()">
                                        <i class="fas fa-magic me-1"></i>
                                        Auto-asignar por número
                                    </button>
                                    <button class="auto-btn" onclick="editServiceHandler.autoMapSequential()">
                                        <i class="fas fa-sort-numeric-down me-1"></i>
                                        Asignar secuencial
                                    </button>
                                    <button class="auto-btn" onclick="editServiceHandler.clearAllMappings()">
                                        <i class="fas fa-eraser me-1"></i>
                                        Limpiar todo
                                    </button>
                                </div>
                            </div>
                            
                            <div class="table-responsive">
                                <table class="table table-sm mb-0">
                                    <thead>
                                        <tr>
                                            <th>Asiento Actual</th>
                                            <th>Pasajero</th>
                                            <th>Nuevo Asiento</th>
                                            <th>Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody id="mappingTableBody">
                                        <!-- Se llena dinámicamente -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <!-- Bus Nuevo -->
                    <div class="bus-info">
                        <h5>Bus Nuevo (${formData.bus})</h5>
                        <div class="bus-details" id="newBusDetails">
                            Tipo: ${newBusConfig.type}<br>
                            Asientos: ${newBusConfig.seats}<br>
                            Disponibles: ${newBusConfig.seats}
                        </div>
                        <div class="seat-map ${newBusConfig.layout}" id="newBusMap">
                            <!-- Asientos se llenan dinámicamente -->
                        </div>
                    </div>
                </div>

                <!-- Leyenda -->
                <div class="legend">
                    <div class="legend-item">
                        <div class="legend-color" style="background: #ef4444;"></div>
                        <span>Ocupado (actual)</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background: #8b5cf6;"></div>
                        <span>Asignado (nuevo)</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background: #10b981;"></div>
                        <span>Disponible</span>
                    </div>
                </div>
            </div>
        `;
    }

    switchToSeatReassignmentTab() {
        const modal = document.getElementById('editServiceModal');
        if (!modal) return;

        console.log('Cambiando a pestaña de reasignación');

        modal.querySelectorAll('.nav-link').forEach(tab => {
            tab.classList.remove('active');
        });
        modal.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('show', 'active');
        });

        const seatMappingTab = modal.querySelector('#seat-mapping-tab');
        const seatMappingPane = modal.querySelector('#seat-mapping');
        
        if (seatMappingTab && seatMappingPane) {
            seatMappingTab.classList.add('active');
            seatMappingPane.classList.add('show', 'active');
            console.log('Pestaña de reasignación activada');
        } else {
            console.error('No se encontraron elementos de pestaña de reasignación');
        }

        this.updateModalButtonsForSeatMapping();
    }

    updateModalButtonsForSeatMapping() {
        const modal = document.getElementById('editServiceModal');
        const footer = modal.querySelector('.modal-footer');
        
        if (footer) {
            footer.innerHTML = `
                <button type="button" class="btn btn-secondary" onclick="editServiceHandler.returnToServiceDetails()">
                    <i class="fas fa-arrow-left me-1"></i>
                    Volver a detalles
                </button>
                <button type="button" class="btn btn-warning" onclick="editServiceHandler.saveAsDraft()">
                    <i class="fas fa-save me-1"></i>
                    Guardar como borrador
                </button>
                <button type="button" class="btn btn-danger" onclick="editServiceHandler.confirmBusChange()">
                    <i class="fas fa-check me-1"></i>
                    Confirmar cambio de bus
                </button>
            `;
            console.log('Botones de reasignación configurados');
        }
    }

    loadSeatData(formData) {
        console.log('Cargando datos de asientos');
        
        // Datos simulados de asientos ocupados del bus actual
        this.currentBusSeats = [
            { number: 1, occupied: true, passenger: 'Juan Pérez' },
            { number: 2, occupied: true, passenger: 'María González' },
            { number: 3, occupied: false, passenger: null },
            { number: 4, occupied: true, passenger: 'Carlos López' },
            { number: 5, occupied: true, passenger: 'Ana Martínez' },
            { number: 6, occupied: false, passenger: null },
            { number: 7, occupied: true, passenger: 'Luis Torres' },
            { number: 8, occupied: true, passenger: 'Carmen Silva' },
            { number: 9, occupied: false, passenger: null },
            { number: 10, occupied: true, passenger: 'Roberto Díaz' },
            { number: 11, occupied: true, passenger: 'Elena Ruiz' },
            { number: 12, occupied: false, passenger: null },
            { number: 13, occupied: true, passenger: 'Diego Morales' },
            { number: 14, occupied: true, passenger: 'Laura Herrera' },
            { number: 15, occupied: false, passenger: null },
            { number: 16, occupied: true, passenger: 'Fernando Castro' },
            { number: 17, occupied: true, passenger: 'Patricia Vega' },
            { number: 18, occupied: false, passenger: null },
            { number: 19, occupied: true, passenger: 'Andrés Molina' },
            { number: 20, occupied: false, passenger: null }
        ];

        // Configuración del nuevo bus
        const newBusConfig = this.busConfigurations[formData.bus] || this.busConfigurations['21'];
        this.newBusSeats = Array.from({length: newBusConfig.seats}, (_, i) => ({
            number: i + 1,
            occupied: false,
            passenger: null,
            assigned: false
        }));

        this.seatMappings = {};

        this.updateSeatMappingInfo(formData);
        
        setTimeout(() => {
            this.renderCurrentBusMap();
            this.renderNewBusMap();
            this.renderMappingTable();
        }, 100);
    }

    updateSeatMappingInfo(formData) {
        const routeEl = document.getElementById('seatMappingRoute');
        const timeEl = document.getElementById('seatMappingTime');
        const occupiedEl = document.getElementById('seatMappingOccupied');
        
        if (routeEl) routeEl.textContent = formData.ruta || this.currentServiceData?.numero || '';
        if (timeEl) timeEl.textContent = formData.hora || this.currentServiceData?.hora || '';
        
        const occupiedCount = this.currentBusSeats.filter(seat => seat.occupied).length;
        if (occupiedEl) occupiedEl.textContent = `${occupiedCount} asientos`;
    }

    renderCurrentBusMap() {
        const mapContainer = document.getElementById('currentBusMap');
        if (!mapContainer) {
            console.error('No se encontró el contenedor del mapa actual');
            return;
        }
        
        mapContainer.innerHTML = '';
        
        this.currentBusSeats.forEach(seat => {
            const seatElement = document.createElement('div');
            seatElement.className = `seat ${seat.occupied ? 'occupied' : 'available'}`;
            seatElement.textContent = seat.number;
            seatElement.setAttribute('data-seat', seat.number);
            
            if (seat.occupied) {
                seatElement.title = `Asiento ${seat.number} - ${seat.passenger}`;
            }
            
            mapContainer.appendChild(seatElement);
        });
    }

    renderNewBusMap() {
        const mapContainer = document.getElementById('newBusMap');
        if (!mapContainer) {
            console.error('No se encontró el contenedor del mapa nuevo');
            return;
        }
        
        mapContainer.innerHTML = '';
        
        this.newBusSeats.forEach(seat => {
            const seatElement = document.createElement('div');
            seatElement.className = `seat ${seat.assigned ? 'mapped' : 'available'}`;
            seatElement.textContent = seat.number;
            seatElement.setAttribute('data-seat', seat.number);
            seatElement.onclick = () => this.selectNewSeat(seat.number);
            
            mapContainer.appendChild(seatElement);
        });
    }

    renderMappingTable() {
        const tbody = document.getElementById('mappingTableBody');
        if (!tbody) {
            console.error('No se encontró el cuerpo de la tabla de mapeo');
            return;
        }
        
        tbody.innerHTML = '';
        
        const occupiedSeats = this.currentBusSeats.filter(seat => seat.occupied);
        
        occupiedSeats.forEach(seat => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${seat.number}</strong></td>
                <td>${seat.passenger}</td>
                <td>
                    <select class="seat-select" onchange="editServiceHandler.updateMapping(${seat.number}, this.value)">
                        <option value="">Seleccionar...</option>
                        ${this.generateSeatOptions(seat.number)}
                    </select>
                </td>
                <td><span class="badge bg-warning" id="status-${seat.number}">Pendiente</span></td>
            `;
            tbody.appendChild(row);
        });
    }

    generateSeatOptions(currentSeat) {
        let options = '';
        this.newBusSeats.forEach(seat => {
            const isAssigned = Object.values(this.seatMappings).includes(seat.number);
            const isCurrentMapping = this.seatMappings[currentSeat] === seat.number;
            
            if (!isAssigned || isCurrentMapping) {
                const selected = isCurrentMapping ? 'selected' : '';
                options += `<option value="${seat.number}" ${selected}>${seat.number}</option>`;
            }
        });
        return options;
    }

    updateMapping(oldSeat, newSeat) {
        // Limpiar mapeo anterior si existe
        if (this.seatMappings[oldSeat]) {
            const oldNewSeat = this.seatMappings[oldSeat];
            this.newBusSeats[oldNewSeat - 1].assigned = false;
        }
        
        if (newSeat) {
            this.seatMappings[oldSeat] = parseInt(newSeat);
            this.newBusSeats[newSeat - 1].assigned = true;
            
            // Actualizar estado
            const statusElement = document.getElementById(`status-${oldSeat}`);
            if (statusElement) {
                statusElement.className = 'badge bg-success';
                statusElement.textContent = 'Asignado';
            }
        } else {
            delete this.seatMappings[oldSeat];
            
            // Actualizar estado
            const statusElement = document.getElementById(`status-${oldSeat}`);
            if (statusElement) {
                statusElement.className = 'badge bg-warning';
                statusElement.textContent = 'Pendiente';
            }
        }
        
        this.renderNewBusMap();
        this.renderMappingTable();
    }

    autoMapByNumber() {
        this.clearAllMappings();
        
        const occupiedSeats = this.currentBusSeats.filter(seat => seat.occupied);
        
        occupiedSeats.forEach(seat => {
            if (seat.number <= this.newBusSeats.length && !this.newBusSeats[seat.number - 1].assigned) {
                this.updateMapping(seat.number, seat.number);
            } else {
                const availableSeat = this.newBusSeats.find(newSeat => !newSeat.assigned);
                if (availableSeat) {
                    this.updateMapping(seat.number, availableSeat.number);
                }
            }
        });
        
        this.showSuccess('Auto-asignación por número completada');
    }

    autoMapSequential() {
        this.clearAllMappings();
        
        const occupiedSeats = this.currentBusSeats.filter(seat => seat.occupied);
        
        occupiedSeats.forEach((seat, index) => {
            const newSeatNumber = index + 1;
            this.updateMapping(seat.number, newSeatNumber);
        });
        
        this.showSuccess('Asignación secuencial completada');
    }

    clearAllMappings() {
        this.seatMappings = {};
        this.newBusSeats.forEach(seat => seat.assigned = false);
        this.renderNewBusMap();
        this.renderMappingTable();
    }

    selectNewSeat(seatNumber) {
        console.log(`Asiento ${seatNumber} seleccionado`);
    }

    returnToServiceDetails() {
        const modal = document.getElementById('editServiceModal');
        if (!modal) return;

        modal.querySelectorAll('.nav-link').forEach(tab => {
            tab.classList.remove('active');
        });
        modal.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('show', 'active');
        });

        const detailsTab = modal.querySelector('#service-details-tab');
        const detailsPane = modal.querySelector('#service-details');
        
        if (detailsTab && detailsPane) {
            detailsTab.classList.add('active');
            detailsPane.classList.add('show', 'active');
        }

        this.restoreOriginalModalButtons();
    }

    restoreOriginalModalButtons() {
        const modal = document.getElementById('editServiceModal');
        const footer = modal.querySelector('.modal-footer');
        
        if (footer && this.originalModalFooter) {
            footer.innerHTML = this.originalModalFooter;
            console.log('Botones originales restaurados');
        }
    }

    saveAsDraft() {
        this.showInfo('Cambios guardados como borrador');
    }

    confirmBusChange() {
        const occupiedSeats = this.currentBusSeats.filter(seat => seat.occupied);
        const mappedSeats = Object.keys(this.seatMappings).length;
        
        if (mappedSeats < occupiedSeats.length) {
            this.showError('Por favor, asigne todos los asientos antes de confirmar');
            return;
        }
        
        // Simular confirmación del cambio
        this.showSuccess('Cambio de bus confirmado exitosamente');
        
        // Restaurar estado original del modal después de confirmar
        setTimeout(() => {
            this.resetModalToOriginalState();
            this.closeModal();
        }, 1500);
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
        this.currentBusSeats = [];
        this.newBusSeats = [];
        this.seatMappings = {};
        this.originalModalFooter = null;
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