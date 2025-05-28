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
     * Configura los eventos de las pestañas
     */
    bindTabButtons() {
        // Eliminar cualquier manejador de eventos existente primero
        document.querySelectorAll('.tab-btn').forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
        });

        // Agregar los nuevos manejadores de eventos
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleTabClick(btn);
            });
        });
    }

    /**
     * Maneja el click en pestañas
     * @param {HTMLElement} button - La pestaña clickeada
     */
    handleTabClick(button) {
        const tabName = button.dataset.tab || button.textContent.toLowerCase();
        
        // Remover clase activa de todas las pestañas
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Activar la pestaña clickeada
        button.classList.add('active');
        
        console.log('Cambiando a pestaña:', tabName);
        
        // Cambiar vista según la pestaña
        this.switchView(tabName);
    }

    /**
     * Cambia la vista según la pestaña seleccionada
     * @param {string} tabName - Nombre de la pestaña
     */
    switchView(tabName) {
        const categoriasTabla = document.getElementById('categoriasTabla');
        const asientosTabla = document.getElementById('asientosTabla');
        
        if (tabName === 'categorias' || tabName === 'categorías') {
            if (categoriasTabla) categoriasTabla.style.display = 'block';
            if (asientosTabla) asientosTabla.style.display = 'none';
        } else if (tabName === 'asientos') {
            if (categoriasTabla) categoriasTabla.style.display = 'none';
            if (asientosTabla) asientosTabla.style.display = 'block';
        }
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

// Exportar para uso en otros módulos si es necesario
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TarifaSummary;
}