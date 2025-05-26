// Historial Handler - Maneja el historial de cambios

document.addEventListener('DOMContentLoaded', function() {
    // Datos de ejemplo para el historial (en una aplicación real, esto vendría de una API)
    const historialEjemplo = [
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

    // Manejador para el botón de historial
    document.addEventListener('click', function(e) {
        const historyBtn = e.target.closest('.btn-history');
        if (historyBtn) {
            e.preventDefault();
            const row = historyBtn.closest('tr');
            
            // Obtener datos del servicio de la fila
            const servicio = {
                numero: row.cells[2]?.textContent.trim() || 'N/A',
                hora: row.cells[5]?.textContent.trim() || 'N/A',
                chofer: row.cells[6]?.textContent.trim() || 'N/A',
                bus: row.cells[4]?.textContent.trim() || 'N/A',
                estado: row.cells[1]?.querySelector('.status-indicator')?.getAttribute('data-status') || 'Desconocido',
                variante: row.cells[3]?.textContent.trim() || 'N/A'
            };
            
            // Mostrar el modal con los datos
            mostrarHistorial(servicio);
        }
    });

    // Función para mostrar el historial
    function mostrarHistorial(servicio) {
        // Actualizar título del modal con el número de servicio
        document.getElementById('historialModalLabel').textContent = `Historial de Cambios - ${servicio.numero}`;
        
        // Limpiar tabla
        const tbody = document.getElementById('historialTablaBody');
        tbody.innerHTML = '';
        
        // Agregar filas de ejemplo (en una aplicación real, estos datos vendrían de una API)
        historialEjemplo.forEach(item => {
            const tr = document.createElement('tr');
            
            // Aplicar estilos condicionales basados en el tipo de modificación
            const modificacionClass = item.modificacion ? 'text-primary fw-bold' : '';
            
            tr.innerHTML = `
                <td class="text-nowrap">${item.nroServicio}</td>
                <td class="text-nowrap">${item.horaSalida}</td>
                <td class="text-nowrap">${item.nroBus}</td>
                <td class="text-nowrap">${item.conductor}</td>
                <td class="text-nowrap">${item.disenoBus}</td>
                <td class="text-nowrap">${item.estado}</td>
                <td class="text-nowrap">${item.ruta || ''}</td>
                <td class="text-nowrap">${item.fechaCambio}</td>
                <td class="text-nowrap">${item.usuario}</td>
                <td class="text-nowrap ${modificacionClass}">${item.modificacion}</td>
            `;
            
            tbody.appendChild(tr);
        });
        
        // Actualizar contador de registros
        document.getElementById('totalRegistros').textContent = historialEjemplo.length;
        
        // Configurar botón de exportar
        const exportBtn = document.getElementById('exportarHistorialBtn');
        exportBtn.onclick = () => exportarAExcel(servicio);
        
        // Mostrar el modal
        const modal = new bootstrap.Modal(document.getElementById('historialModal'));
        modal.show();
    }
    
    // Función para exportar a Excel
    function exportarAExcel(servicio) {
        try {
            // Crear contenido CSV
            let csvContent = 'data:text/csv;charset=utf-8,';
            
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
            
            // Agregar BOM para Excel
            csvContent = '\uFEFF';
            csvContent += headers.join(';') + '\r\n';
            
            // Filas de datos
            historialEjemplo.forEach(item => {
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
            
            // Crear enlace de descarga
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `historial_servicio_${servicio.numero || 'desconocido'}_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
        } catch (error) {
            console.error('Error al exportar el historial:', error);
            alert('Ocurrió un error al exportar el historial. Por favor, intente nuevamente.');
        }
    }
});
