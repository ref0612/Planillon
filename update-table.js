// Function to initialize all status indicators in the table
document.addEventListener('DOMContentLoaded', function() {
    // Get all status indicator cells (second column in each row)
    const statusCells = document.querySelectorAll('tbody tr td:nth-child(2)');
    
    // Update each status cell
    statusCells.forEach((cell, index) => {
        // Get the row data
        const row = cell.closest('tr');
        const service = row.cells[2].textContent;
        const variant = row.cells[3].textContent;
        const time = row.cells[5].textContent;
        
        // Determine the initial status based on existing classes
        let status = 'active';
        const indicator = cell.querySelector('.status-indicator');
        
        if (indicator) {
            // If there's already a status indicator, get its status
            status = indicator.getAttribute('data-status') || 'active';
        } else if (cell.classList.contains('status-alert')) {
            status = 'alert';
        } else if (cell.classList.contains('status-pending')) {
            status = 'pending';
        } else if (cell.classList.contains('status-inactive')) {
            status = 'inactive';
        }
        
        // Create or update the status indicator
        let statusIndicator = cell.querySelector('.status-indicator');
        if (!statusIndicator) {
            statusIndicator = document.createElement('span');
            cell.innerHTML = '';
            cell.appendChild(statusIndicator);
        }
        
        // Set up the status indicator
        statusIndicator.className = 'status-indicator';
        statusIndicator.classList.add(`status-${status}`);
        statusIndicator.setAttribute('data-status', status);
        statusIndicator.setAttribute('data-bs-toggle', 'tooltip');
        statusIndicator.setAttribute('data-bs-placement', 'top');
        statusIndicator.setAttribute('title', getStatusText(status));
        
        // Add click handler
        statusIndicator.onclick = function(e) {
            e.stopPropagation();
            openStatusModal(this, service, variant, time);
        };
    });
    
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
});

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
