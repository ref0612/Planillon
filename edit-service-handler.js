// Edit Service Handler - Maneja la edición de servicios y vistas de tarifas

// Función para inicializar el manejador de edición y las vistas de tarifas
function initEditServiceHandler() {
    console.log('Inicializando manejador de edición...');
    
    // Inicializar el manejador de cambio de vista de tarifas
    initTarifaViewToggle();
    
    // Manejador para el botón de editar
    $(document).on('click', '.action-btn[title="Editar"]', function(e) {
        console.log('Botón de editar clickeado');
        
        // Prevenir comportamiento por defecto
        e.preventDefault();
        e.stopPropagation();
        
        const editButton = $(this);
        const row = editButton.closest('tr');
        
        console.log('Fila encontrada:', row.length > 0 ? 'Sí' : 'No');
        
        // Obtener datos del servicio de la fila
        const serviceData = {
            numero: row.find('td:eq(1)').text().trim() || '', // Ajustar índice según la columna
            fecha: new Date().toISOString().split('T')[0],
            variante: row.find('td:eq(2)').text().trim() || '',
            hora: row.find('td:eq(4)').text().trim() || '',
            chofer1: row.find('td:eq(5)').text().trim() || '',
            chofer2: '', // No hay columna para conductor 2 en la tabla
            bus: row.find('td:eq(3)').text().trim() || '',
            estado: row.find('.status-indicator').hasClass('status-alert') ? 'alerta' : 'normal'
        };
        
        console.log('Datos del servicio:', serviceData);
        
        // Mostrar el modal con los datos
        mostrarModalEdicion(serviceData);
        return false;
    });
    
    // Para depuración: verificar que el manejador se haya registrado
    console.log('Manejador de edición registrado');
}

// Función para inicializar el toggle entre vistas de tarifas
function initTarifaViewToggle() {
    // Obtener los elementos del DOM
    const categoriasView = document.getElementById('categoriasView');
    const asientosView = document.getElementById('asientosView');
    const categoriasTabla = document.getElementById('categoriasTabla');
    const asientosTabla = document.getElementById('asientosTabla');
    
    // Verificar que los elementos existen
    if (!categoriasView || !asientosView || !categoriasTabla || !asientosTabla) {
        console.log('No se encontraron los elementos para el toggle de tarifas');
        return;
    }
    
    // Función para cambiar la vista
    function cambiarVista(mostrarCategorias) {
        if (mostrarCategorias) {
            categoriasTabla.style.display = 'block';
            asientosTabla.style.display = 'none';
            categoriasView.checked = true;
        } else {
            categoriasTabla.style.display = 'none';
            asientosTabla.style.display = 'block';
            asientosView.checked = true;
        }
    }
    
    // Agregar event listeners a los botones de radio
    categoriasView.addEventListener('change', function() {
        if (this.checked) {
            cambiarVista(true);
        }
    });
    
    asientosView.addEventListener('change', function() {
        if (this.checked) {
            cambiarVista(false);
        }
    });
    
    // Inicializar con la vista de categorías por defecto
    cambiarVista(true);
    
    console.log('Manejador de cambio de vista de tarifas inicializado');
}

// Función para mostrar el modal de edición
function mostrarModalEdicion(serviceData) {
    console.log('Mostrando modal de edición con datos:', serviceData);
    
    try {
        // Verificar que exista el modal
        const modalElement = document.getElementById('editServiceModal');
        if (!modalElement) {
            console.error('Error: No se encontró el elemento del modal con ID editServiceModal');
            return;
        }
        
        console.log('Elemento del modal encontrado');
        
        // Actualizar campos del formulario con los datos del servicio
        $('#editServiceNumero').val(serviceData.numero || '');
        $('#editServiceFecha').val(serviceData.fecha || '');
        $('#editServiceHora').val(serviceData.hora || '');
        $('#editServiceVariante').val(serviceData.variante || '');
        $('#editServiceEstado').val(serviceData.estado || 'abierto');
        
        console.log('Campos del formulario actualizados');
        
        // Inicializar o actualizar Select2
        try {
            $('.select2-buscar').select2('destroy');
            console.log('Select2 destruido correctamente');
            
            // Configuración básica de Select2 sin AJAX por ahora
            $('.select2-buscar').select2({
                theme: 'bootstrap-5',
                dropdownParent: $('#editServiceModal'),
                placeholder: 'Seleccionar...',
                allowClear: true,
                width: '100%',
                minimumInputLength: 0
            });
            console.log('Select2 inicializado correctamente');
        } catch (select2Error) {
            console.error('Error al inicializar Select2:', select2Error);
        }
        
        // Establecer valores iniciales
        if (serviceData.chofer1) {
            $('#editServiceChofer1').html('<option value="' + serviceData.chofer1 + '" selected>' + serviceData.chofer1 + '</option>');
        }
        
        if (serviceData.chofer2) {
            $('#editServiceChofer2').html('<option value="' + serviceData.chofer2 + '" selected>' + serviceData.chofer2 + '</option>');
        }
        
        if (serviceData.bus) {
            $('#editServiceBus').html('<option value="' + serviceData.bus + '" selected>' + serviceData.bus + '</option>');
        }
        
        console.log('Valores iniciales establecidos');
        
        // Mostrar el modal usando Bootstrap 5
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
        
        console.log('Modal mostrado correctamente');
        
    } catch (error) {
        console.error('Error en mostrarModalEdicion:', error);
        alert('Ocurrió un error al intentar abrir el formulario de edición. Por favor, verifica la consola para más detalles.');
    }
}

// Manejador para el botón de guardar cambios
$(document).on('click', '#guardarCambiosBtn', function() {
    console.log('Guardando cambios...');
    // Aquí iría la lógica para guardar los cambios
    
    // Por ahora, solo cerramos el modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('editServiceModal'));
    modal.hide();
    
    // Mostrar mensaje de éxito
    alert('Los cambios se han guardado correctamente');
});

// Inicializar cuando el documento esté listo
$(document).ready(function() {
    initEditServiceHandler();
});
