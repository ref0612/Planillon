// Status Change Functionality

// Global variables
window.currentStatusElement = null;
window.currentServiceData = null;

// Function to open the status modal
function openStatusModal(element, service, variant, time) {
    window.currentStatusElement = element;
    window.currentServiceData = {
        service: service,
        variant: variant,
        time: time
    };
    
    // Update modal content
    document.getElementById('serviceName').textContent = service;
    document.getElementById('serviceVariant').textContent = variant;
    document.getElementById('serviceTime').textContent = time;
    
    // Show current status
    const currentStatus = element.getAttribute('data-status') || 'active';
    selectStatus(currentStatus);
    
    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById('statusModal'));
    modal.show();
}

// Function to select a status
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

// Function to save the selected status
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
        // Update the status indicator in the table
        updateStatusIndicator(window.currentStatusElement, selectedStatus);
        
        // Close the modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('statusModal'));
        if (modal) {
            modal.hide();
        }
        
        // Log the status change
        console.log('Status updated:', {
            service: window.currentServiceData?.service,
            status: selectedStatus
        });
    } catch (error) {
        console.error('Error updating status:', error);
    }
}

// Function to update status indicator
function updateStatusIndicator(element, status) {
    if (!element) return;
    
    try {
        // Update status classes
        element.className = 'status-indicator';
        element.classList.add(`status-${status}`);
        
        // Update data-status attribute
        element.setAttribute('data-status', status);
        
        // Update tooltip
        const statusText = window.getStatusText ? window.getStatusText(status) : status;
        element.setAttribute('title', statusText);
        element.setAttribute('data-bs-original-title', statusText);
        
        // Reinitialize tooltip
        if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
            const tooltip = bootstrap.Tooltip.getInstance(element);
            if (tooltip) {
                tooltip.dispose();
            }
            new bootstrap.Tooltip(element);
        }
    } catch (error) {
        console.error('Error updating status indicator:', error);
    }
}

// Helper function to get status text
function getStatusText(status) {
    const statusMap = {
        'active': 'Abierto',
        'alert': 'Cerrado',
        'pending': 'Suspendido',
        'inactive': 'Panne'
    };
    return statusMap[status] || 'Desconocido';
}

// Make functions globally available
window.openStatusModal = openStatusModal;
window.selectStatus = selectStatus;
window.saveStatus = saveStatus;
window.updateStatusIndicator = updateStatusIndicator;
window.getStatusText = getStatusText;

// Initialize status indicators when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add click handlers to all status indicators
    document.querySelectorAll('.status-indicator').forEach(indicator => {
        // Initialize status from data-status attribute
        const status = indicator.getAttribute('data-status') || 'active';
        updateStatusIndicator(indicator, status);
        
        // Add click handler
        indicator.addEventListener('click', function(e) {
            e.stopPropagation();
            const row = this.closest('tr');
            const service = row.cells[2].textContent;
            const variant = row.cells[3].textContent;
            const time = row.cells[5].textContent;
            openStatusModal(this, service, variant, time);
        });
    });
    
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
});
