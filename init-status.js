// Initialize status indicators when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Function to initialize a single status indicator
    function initStatusIndicator(indicator) {
        if (!indicator) return;

        // Get the row data
        const row = indicator.closest('tr');
        if (!row) return;
        
        const cells = row.cells;
        if (cells.length < 7) return; // Ensure we have enough cells
        
        const service = cells[2]?.textContent || '';
        const variant = cells[3]?.textContent || '';
        const time = cells[5]?.textContent || '';
        
        // Determine the current status from existing classes or data-status attribute
        let status = indicator.getAttribute('data-status') || 'active';
        if (!indicator.getAttribute('data-status')) {
            // Fallback to class-based status if data-status is not set
            if (indicator.classList.contains('status-alert')) status = 'alert';
            else if (indicator.classList.contains('status-pending')) status = 'pending';
            else if (indicator.classList.contains('status-inactive')) status = 'inactive';
            
            // Ensure data-status is set
            indicator.setAttribute('data-status', status);
        }

        // Update the indicator with proper attributes
        indicator.setAttribute('data-bs-toggle', 'tooltip');
        indicator.setAttribute('data-bs-placement', 'top');
        indicator.setAttribute('title', getStatusText(status));
        indicator.style.cursor = 'pointer';
        
        // Ensure the indicator has the correct class
        indicator.className = 'status-indicator';
        indicator.classList.add(`status-${status}`);
        
        // Add click event if not already added
        if (!indicator._hasClickHandler) {
            indicator.addEventListener('click', function(e) {
                e.stopPropagation();
                window.openStatusModal(this, service, variant, time);
            });
            indicator._hasClickHandler = true;
        }
        
        return indicator;
    }

    // Function to initialize all status indicators in the table
    function initAllStatusIndicators() {
        const indicators = document.querySelectorAll('tbody tr td:nth-child(2) .status-indicator');
        indicators.forEach(initStatusIndicator);
        
        // Initialize tooltips for all elements with data-bs-toggle="tooltip"
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.forEach(tooltipTriggerEl => {
            // Only initialize tooltip if not already initialized
            if (!tooltipTriggerEl._tooltip) {
                new bootstrap.Tooltip(tooltipTriggerEl);
            }
        });
    }
    
    // Initialize all status indicators on page load
    initAllStatusIndicators();
    
    // Set up a MutationObserver to handle dynamically added status indicators
    const observer = new MutationObserver(function(mutations) {
        let shouldUpdate = false;
        
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                shouldUpdate = true;
            }
        });
        
        if (shouldUpdate) {
            // Use a small delay to ensure the DOM is ready
            setTimeout(initAllStatusIndicators, 100);
        }
    });
    
    // Start observing the document with the configured parameters
    observer.observe(document.body, { 
        childList: true, 
        subtree: true 
    });
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

// Make the function available globally
window.getStatusText = getStatusText;
