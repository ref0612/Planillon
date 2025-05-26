// Status Handler - Manages status indicators and modal interactions

document.addEventListener('DOMContentLoaded', function() {
    // Initialize status indicators
    initStatusIndicators();
    
    // Set up event delegation for status indicators
    document.addEventListener('click', function(event) {
        const statusIndicator = event.target.closest('.status-indicator');
        if (statusIndicator) {
            handleStatusClick(statusIndicator, event);
        }
    });
});

function initStatusIndicators() {
    document.querySelectorAll('.status-indicator').forEach(indicator => {
        setupStatusIndicator(indicator);
    });
}

function setupStatusIndicator(indicator) {
    // Skip if already initialized
    if (indicator._initialized) return;
    
    // Add cursor pointer for better UX
    indicator.style.cursor = 'pointer';
    
    // Set default status if not set
    if (!indicator.getAttribute('data-status')) {
        const statusClass = Array.from(indicator.classList).find(cls => 
            cls.startsWith('status-') && cls !== 'status-indicator'
        );
        
        if (statusClass) {
            const status = statusClass.replace('status-', '');
            indicator.setAttribute('data-status', status);
        } else {
            indicator.setAttribute('data-status', 'active');
            indicator.classList.add('status-active');
        }
    }
    
    // Initialize tooltip
    if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
        indicator.setAttribute('data-bs-toggle', 'tooltip');
        indicator.setAttribute('data-bs-placement', 'top');
        indicator.setAttribute('title', getStatusText(indicator.getAttribute('data-status')));
        
        // Only initialize tooltip if not already done
        if (!indicator._tooltip) {
            new bootstrap.Tooltip(indicator);
            indicator._tooltip = true;
        }
    }
    
    indicator._initialized = true;
}

function handleStatusClick(indicator, event) {
    event.preventDefault();
    event.stopPropagation();
    
    const row = indicator.closest('tr');
    if (!row) return;
    
    const cells = row.cells;
    if (cells.length < 7) return;
    
    const service = cells[2]?.textContent || '';
    const variant = cells[3]?.textContent || '';
    const time = cells[5]?.textContent || '';
    
    openStatusModal(indicator, service, variant, time);
}

function openStatusModal(element, service, variant, time) {
    if (!element || !service) return;
    
    // Store the current element for later reference
    window.currentStatusElement = element;
    
    // Update modal content
    document.getElementById('servicioNombre').textContent = service;
    document.getElementById('servicioVariante').textContent = variant;
    document.getElementById('servicioHora').textContent = time;
    
    // Show current status
    const currentStatus = element.getAttribute('data-status') || 'active';
    selectStatus(currentStatus);
    
    // Show the modal
    const modalElement = document.getElementById('statusModal');
    if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    }
}

function selectStatus(status) {
    // Remove 'selected' class from all options
    document.querySelectorAll('.status-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Add 'selected' class to clicked option
    const selectedOption = document.querySelector(`.status-option[data-status="${status}"]`);
    if (selectedOption) {
        selectedOption.classList.add('selected');
        const radio = selectedOption.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
    }
}

function saveStatus() {
    if (!window.currentStatusElement) {
        console.error('No status element selected');
        return;
    }
    
    const selectedRadio = document.querySelector('input[name="status"]:checked');
    if (!selectedRadio) {
        console.error('No status selected');
        return;
    }
    
    const selectedStatus = selectedRadio.value;
    
    try {
        // Update the status indicator
        updateStatusIndicator(window.currentStatusElement, selectedStatus);
        
        // Close the modal
        const modalElement = document.getElementById('statusModal');
        if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) modal.hide();
        }
        
        console.log('Status updated:', {
            status: selectedStatus
        });
    } catch (error) {
        console.error('Error updating status:', error);
    }
}

function updateStatusIndicator(element, status) {
    if (!element) return;
    
    try {
        // Update status classes
        element.className = 'status-indicator';
        element.classList.add(`status-${status}`);
        
        // Update data-status attribute
        element.setAttribute('data-status', status);
        
        // Update tooltip
        const statusText = getStatusText(status);
        element.setAttribute('title', statusText);
        element.setAttribute('data-bs-original-title', statusText);
        
        // Update tooltip instance if it exists
        if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
            const tooltip = bootstrap.Tooltip.getInstance(element);
            if (tooltip) {
                tooltip.dispose();
                new bootstrap.Tooltip(element);
            }
        }
    } catch (error) {
        console.error('Error updating status indicator:', error);
    }
}

function getStatusText(status) {
    const statusMap = {
        'active': 'Abierto',
        'alert': 'Cerrado',
        'pending': 'Suspendido',
        'inactive': 'Panne'
    };
    return statusMap[status] || 'Desconocido';
}

// Make functions available globally
window.openStatusModal = openStatusModal;
window.selectStatus = selectStatus;
window.saveStatus = saveStatus;
window.updateStatusIndicator = updateStatusIndicator;
