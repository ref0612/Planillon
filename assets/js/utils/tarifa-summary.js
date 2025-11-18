/**
 * TARIFA SUMMARY MODULE
 * Script para manejar la funcionalidad del módulo de resumen de tarifas
 * Ubicación: assets/utils/tarifa-summary.js
 */

class TarifaSummary {
    constructor() {
        this.originalData = {
            categorias: [
                { category: 'G2700', count: 266 },
                { category: 'G1350', count: 24 },
                { category: 'G2450', count: 0 },
                { category: 'G2600', count: 104 },
                { category: 'B2700', count: 333 },
                { category: 'B1900', count: 61 },
                { category: 'B1350', count: 61 },
                { category: 'CARAB', count: 19 },
                { category: 'PRELI', count: 0 }
            ],
            asientos: [
                { category: 'Clásico', count: 150 },
                { category: 'Ejecutivo', count: 120 },
                { category: 'Semi Cama', count: 180 },
                { category: 'Salón Cama', count: 200 },
                { category: 'Salón Cama IND', count: 220 },
                { category: 'Salón Cama Low', count: 190 },
                { category: 'Pet Seat', count: 50 },
                { category: 'Premium', count: 250 }
            ]
        };
        this.init();
    }

    init() {
        this.protectTariffTables(); // ✅ Proteger tablas antes de cualquier otra cosa
        this.bindEvents();
        this.initializeView();
        this.setupCorruptionMonitor();
    }

    /**
     * Protege las tablas de tarifas contra modificaciones externas
     */
    protectTariffTables() {
        // Marcar todas las filas de tarifas como protegidas
        const tariffRows = document.querySelectorAll('.tariff-table tbody tr');
        tariffRows.forEach((row, index) => {
            // Marcar como ya procesada para evitar modificaciones
            row._historyEnhanced = true;
            row._tarifaProtected = true;
            row.classList.add('tarifa-protected');
            
            // Agregar atributo identificador si no existe
            if (!row.dataset.tariffRow) {
                row.dataset.tariffRow = `tariff-${index + 1}`;
            }
            
            // Preservar el contenido original de la primera celda
            const firstCell = row.cells[0];
            if (firstCell && !firstCell.dataset.originalText) {
                firstCell.dataset.originalText = firstCell.textContent.trim();
            }
        });
        
        console.log('Tablas de tarifas protegidas contra modificaciones externas');
    }

    /**
     * Configura un monitor para detectar y corregir corrupción automáticamente
     */
    setupCorruptionMonitor() {
        // Verificación inicial
        setTimeout(() => {
            this.checkAndFixCorruption();
        }, 1000);
        
        // Verificación periódica cada 3 segundos
        setInterval(() => {
            this.checkAndFixCorruption();
        }, 3000);
    }

    /**
     * Verifica y corrige automáticamente la corrupción en las tablas
     */
    checkAndFixCorruption() {
        const corruptedRows = document.querySelectorAll('.tariff-table tbody tr td .action-buttons');
        if (corruptedRows.length > 0) {
            console.warn('Detectada corrupción en tablas de tarifas, restaurando...');
            this.restoreTariffTables();
            this.protectTariffTables();
        }
    }

    /**
     * Restaura el contenido original de las tablas de tarifas
     */
    restoreTariffTables() {
        // Restaurar tabla de categorías
        this.restoreTable('categoriasTabla', this.originalData.categorias, 965);
        
        // Restaurar tabla de asientos
        this.restoreTable('asientosTabla', this.originalData.asientos, 1360);
        
        console.log('Tablas de tarifas restauradas exitosamente');
    }

    /**
     * Restaura una tabla específica con sus datos originales
     */
    restoreTable(tableId, data, total) {
        const tableContainer = document.getElementById(tableId);
        if (!tableContainer) return;
        
        const tbody = tableContainer.querySelector('tbody');
        if (!tbody) return;
        
        // Limpiar contenido corrupto
        tbody.innerHTML = '';
        
        // Recrear filas con datos originales
        data.forEach((item, index) => {
            const tr = document.createElement('tr');
            tr.dataset.tariffRow = `tariff-${index + 1}`;
            tr._tarifaProtected = true;
            tr._historyEnhanced = true;
            tr.classList.add('tarifa-protected');
            
            const tdCategory = document.createElement('td');
            const tdCount = document.createElement('td');
            
            tdCategory.textContent = item.category;
            tdCategory.dataset.originalText = item.category;
            tdCount.textContent = item.count;
            
            tr.appendChild(tdCategory);
            tr.appendChild(tdCount);
            tbody.appendChild(tr);
        });
        
        // Agregar fila de total
        const totalTr = document.createElement('tr');
        totalTr.className = 'total';
        totalTr.dataset.tariffRow = 'tariff-total';
        totalTr._tarifaProtected = true;
        totalTr._historyEnhanced = true;
        totalTr.classList.add('tarifa-protected');
        
        const totalTdLabel = document.createElement('td');
        const totalTdValue = document.createElement('td');
        
        totalTdLabel.textContent = 'TOTAL';
        totalTdLabel.dataset.originalText = 'TOTAL';
        totalTdValue.textContent = total;
        
        totalTr.appendChild(totalTdLabel);
        totalTr.appendChild(totalTdValue);
        tbody.appendChild(totalTr);
    }

    /**
     * Vincula todos los eventos del módulo
     */
    bindEvents() {
        // Eventos para pestañas de navegación
        this.bindTabButtons();
    }
   
    /**
     * Configura los eventos de las pestañas - VERSIÓN CORREGIDA
     */
    bindTabButtons() {
        // ✅ Buscar los radio buttons correctos por name y id
        const categoriasView = document.getElementById('categoriasView');
        const asientosView = document.getElementById('asientosView');
        
        if (categoriasView) {
            categoriasView.addEventListener('change', (e) => {
                if (e.target.checked) {
                    console.log('Cambiando a vista de categorías');
                    this.switchView('categorias');
                    this.updateActiveTab('categoriasView');
                }
            });
        }
        
        if (asientosView) {
            asientosView.addEventListener('change', (e) => {
                if (e.target.checked) {
                    console.log('Cambiando a vista de asientos');
                    this.switchView('asientos');
                    this.updateActiveTab('asientosView');
                }
            });
        }
        
        // ✅ También escuchar clics en las labels
        const categoriasLabel = document.querySelector('label[for="categoriasView"]');
        const asientosLabel = document.querySelector('label[for="asientosView"]');
        
        if (categoriasLabel) {
            categoriasLabel.addEventListener('click', () => {
                setTimeout(() => this.switchView('categorias'), 50);
            });
        }
        
        if (asientosLabel) {
            asientosLabel.addEventListener('click', () => {
                setTimeout(() => this.switchView('asientos'), 50);
            });
        }
        
        console.log('Event listeners de pestañas configurados correctamente');
    }

    /**
     * Actualiza la clase activa de las pestañas
     */
    updateActiveTab(activeId) {
        // Actualizar estilos de las labels
        const allLabels = document.querySelectorAll('label[for$="View"]');
        allLabels.forEach(label => {
            label.classList.remove('active');
        });
        
        const activeLabel = document.querySelector(`label[for="${activeId}"]`);
        if (activeLabel) {
            activeLabel.classList.add('active');
        }
    }

    /**
     * Cambia la vista según la pestaña seleccionada - VERSIÓN MEJORADA
     * @param {string} tabName - Nombre de la pestaña
     */
    switchView(tabName) {
        console.log('Ejecutando switchView para:', tabName);
        
        const categoriasTabla = document.getElementById('categoriasTabla');
        const asientosTabla = document.getElementById('asientosTabla');
        
        if (!categoriasTabla || !asientosTabla) {
            console.error('No se encontraron las tablas de tarifas');
            return;
        }
        
        if (tabName === 'categorias' || tabName === 'categorías') {
            console.log('Mostrando tabla de categorías');
            categoriasTabla.style.display = 'block';
            asientosTabla.style.display = 'none';
            
            // ✅ Verificar integridad después del cambio
            setTimeout(() => {
                this.checkAndFixCorruption();
            }, 100);
            
        } else if (tabName === 'asientos') {
            console.log('Mostrando tabla de asientos');
            categoriasTabla.style.display = 'none';
            asientosTabla.style.display = 'block';
            
            // ✅ Verificar integridad después del cambio
            setTimeout(() => {
                this.checkAndFixCorruption();
            }, 100);
        }
        
        // ✅ Forzar re-protección de las tablas
        this.protectTariffTables();
    }

    /**
     * Inicializa la vista por defecto
     */
    initializeView() {
        // Asegurar que la pestaña "Categorías" esté activa por defecto
        const defaultTab = document.querySelector('.tab-btn.active');
        if (!defaultTab) {
            const firstTab = document.querySelector('.tab-btn');
            if (firstTab) {
                firstTab.classList.add('active');
            }
        }
        
        // Asegurar que la vista de asientos esté visible por defecto
        setTimeout(() => {
            this.switchView('asientos');
        }, 100);
    }

    /**
     * Muestra el historial para una categoría específica
     * @param {string} serviceId - ID del servicio
     * @param {string} category - Nombre de la categoría
     */
    showHistory(serviceId, category) {
        // Implementar lógica personalizada aquí
        // Ejemplos:
        // - Abrir modal con historial
        // - Hacer petición AJAX para obtener datos
        // - Navegar a página de historial
        
        alert(`Mostrando historial para: ${category} (${serviceId})`);
    }

    /**
     * Muestra el resumen para una categoría específica
     * @param {string} serviceId - ID del servicio
     * @param {string} category - Nombre de la categoría
     * @param {string} count - Cantidad de elementos
     */
    showSummary(serviceId, category, count) {
        // Implementar lógica personalizada aquí
        // Ejemplos:
        // - Abrir modal con resumen detallado
        // - Mostrar gráficos o estadísticas
        // - Navegar a página de detalles
        
        alert(`Resumen de ${category}: ${count} elementos (${serviceId})`);
    }

    /**
     * Actualiza los datos de la tabla
     * @param {Array} data - Nuevos datos para la tabla
     */
    updateData(data) {
        const tbody = document.querySelector('#categoriasTabla tbody');
        if (!tbody) return;
    
        // 🧼 Limpieza forzada
        tbody.innerHTML = '';
    
        // 🔁 Rellenar con datos válidos
        data.forEach(item => {
            const tr = document.createElement('tr');
            tr._tarifaProtected = true;
            tr._historyEnhanced = true;
            tr.classList.add('tarifa-protected');
            
            const tdCategory = document.createElement('td');
            const tdCount = document.createElement('td');
    
            tdCategory.textContent = item.category || '—';
            tdCategory.dataset.originalText = item.category || '—';
            tdCount.textContent = item.count != null ? item.count : 0;
    
            tr.appendChild(tdCategory);
            tr.appendChild(tdCount);
            tbody.appendChild(tr);
        });
    
        console.log('Actualizando datos de tarifa:', data);
        
        // Reproteger después de actualizar
        this.protectTariffTables();
    }

    /**
     * Obtiene los datos actuales de la tabla
     * @returns {Array} Array con los datos actuales
     */
    getCurrentData() {
        const rows = document.querySelectorAll('#categoriasTabla tr:not(.total)');
        const data = [];
    
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 2) {
                const firstCell = cells[0];
                let categoryText = firstCell.dataset.originalText || firstCell.textContent.trim();
                
                // Si la celda fue corrompida, usar el texto original
                if (firstCell.querySelector('.action-buttons')) {
                    categoryText = firstCell.dataset.originalText || '';
                }
                
                data.push({
                    category: categoryText,
                    count: parseInt(cells[1].textContent.trim()) || 0
                });
            }
        });
    
        return data;
    }

    /**
     * Calcula y actualiza el total
     */
    updateTotal() {
        const data = this.getCurrentData();
        const total = data.reduce((sum, item) => sum + item.count, 0);
        
        const totalCell = document.querySelector('#categoriasTabla tr.total td:last-child');
        if (totalCell) {
            totalCell.textContent = total.toString();
        }
        
        return total;
    }

    /**
     * Método público para forzar restauración
     */
    forceRestore() {
        this.restoreTariffTables();
        this.protectTariffTables();
    }

    /**
     * Método para verificar estado de las tablas
     */
    checkTableIntegrity() {
        const categoriasRows = document.querySelectorAll('#categoriasTabla tbody tr');
        const asientosRows = document.querySelectorAll('#asientosTabla tbody tr');
        
        const categoriasCorrupted = Array.from(categoriasRows).some(row => 
            row.querySelector('.action-buttons')
        );
        
        const asientosCorrupted = Array.from(asientosRows).some(row => 
            row.querySelector('.action-buttons')
        );
        
        return {
            categorias: {
                total: categoriasRows.length,
                corrupted: categoriasCorrupted
            },
            asientos: {
                total: asientosRows.length,
                corrupted: asientosCorrupted
            }
        };
    }
}

// ========== PROTECCIÓN CONTRA OTROS SCRIPTS ==========

// Verificación y restauración automática si detecta corrupción
function monitorTariffTables() {
    if (window.tarifaSummary) {
        const corruptedRows = document.querySelectorAll('.tariff-table tbody tr td .action-buttons');
        if (corruptedRows.length > 0) {
            console.warn('Detectada corrupción en tablas de tarifas, restaurando...');
            window.tarifaSummary.restoreTariffTables();
            window.tarifaSummary.protectTariffTables();
        }
    }
}

// Protección contra MutationObserver de otros módulos
document.addEventListener('DOMContentLoaded', function() {
    // Esperar un poco para que otros scripts se inicialicen
    setTimeout(() => {
        if (document.querySelector('.tariff-module') && !window.tarifaSummary) {
            window.tarifaSummary = new TarifaSummary();
            console.log('Módulo de Tarifa Summary inicializado correctamente');
        } else if (window.tarifaSummary) {
            // Re-proteger las tablas
            window.tarifaSummary.protectTariffTables();
            
            // Verificar si necesita restauración
            const corruptedRows = document.querySelectorAll('.tariff-table tbody tr td .action-buttons');
            if (corruptedRows.length > 0) {
                console.log('Restaurando tablas de tarifas corruptas...');
                window.tarifaSummary.restoreTariffTables();
            }
        }
    }, 500);
    
    // Configurar monitoreo continuo
    setInterval(monitorTariffTables, 2000);
});

// Interceptar intentos de modificación por otros scripts
const originalQuerySelectorAll = document.querySelectorAll;
document.querySelectorAll = function(selector) {
    const result = originalQuerySelectorAll.call(this, selector);
    
    // Si alguien está intentando seleccionar todas las filas tbody tr
    if (selector === 'tbody tr' && window.tarifaSummary) {
        // Filtrar las filas de tarifas para protegerlas
        const filteredResult = Array.from(result).filter(row => {
            return !row.closest('.tariff-module') && 
                   !row.closest('.tariff-summary') && 
                   !row._tarifaProtected;
        });
        return filteredResult;
    }
    
    return result;
};

// ========== FUNCIONES DE DEBUGGING ==========
// Función para debuggear el estado de las pestañas
window.debugTarifaTabs = function() {
    console.log('=== DEBUG TARIFA TABS ===');
    
    // Verificar elementos
    const categoriasView = document.getElementById('categoriasView');
    const asientosView = document.getElementById('asientosView');
    const categoriasTabla = document.getElementById('categoriasTabla');
    const asientosTabla = document.getElementById('asientosTabla');
    
    console.log('Elementos encontrados:');
    console.log('- categoriasView:', categoriasView ? '✅' : '❌');
    console.log('- asientosView:', asientosView ? '✅' : '❌');
    console.log('- categoriasTabla:', categoriasTabla ? '✅' : '❌');
    console.log('- asientosTabla:', asientosTabla ? '✅' : '❌');
    
    // Verificar estado actual
    if (categoriasView && asientosView) {
        console.log('Estado de radio buttons:');
        console.log('- Categorías checked:', categoriasView.checked);
        console.log('- Asientos checked:', asientosView.checked);
    }
    
    // Verificar visibilidad de tablas
    if (categoriasTabla && asientosTabla) {
        console.log('Visibilidad de tablas:');
        console.log('- Categorías display:', categoriasTabla.style.display || 'default');
        console.log('- Asientos display:', asientosTabla.style.display || 'default');
    }
    
    // Verificar instancia de TarifaSummary
    console.log('TarifaSummary instance:', window.tarifaSummary ? '✅' : '❌');
};

// Función para forzar cambio de pestaña
window.forceSwitchTab = function(tabName) {
    console.log(`Forzando cambio a: ${tabName}`);
    if (window.tarifaSummary) {
        window.tarifaSummary.switchView(tabName);
    } else {
        console.error('TarifaSummary no está inicializado');
    }
};

// Función para verificar corrupción
window.checkTariffCorruption = function() {
    const corruptedRows = document.querySelectorAll('.tariff-table tbody tr td .action-buttons');
    console.log(`Filas corruptas encontradas: ${corruptedRows.length}`);
    
    if (corruptedRows.length > 0) {
        console.log('Elementos corruptos:', corruptedRows);
        if (window.tarifaSummary) {
            window.tarifaSummary.restoreTariffTables();
            console.log('Tablas restauradas');
        }
    } else {
        console.log('✅ No se encontró corrupción en las tablas');
    }
};

// Función global para verificar estado
window.checkTariffTables = function() {
    if (window.tarifaSummary) {
        return window.tarifaSummary.checkTableIntegrity();
    }
    return null;
};

// Función global para forzar restauración
window.restoreTariffTables = function() {
    if (window.tarifaSummary) {
        window.tarifaSummary.forceRestore();
        return true;
    }
    return false;
};

// Auto-ejecutar debug al cargar
setTimeout(() => {
    if (document.querySelector('.tariff-module')) {
        console.log('🔍 Ejecutando debug automático de pestañas de tarifas...');
        window.debugTarifaTabs();
    }
}, 2000);

// Exportar para uso en otros módulos si es necesario
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TarifaSummary;
}