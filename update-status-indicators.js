// Update all status indicators in the table
document.addEventListener('DOMContentLoaded', function() {
    function updateAllStatusIndicators() {
        const indicators = document.querySelectorAll('tbody tr td:nth-child(2) .status-indicator');
        
        indicators.forEach((indicator, index) => {
            // Skip if already processed
            if (indicator._processed) return;
            
            // Get the row data
            const row = indicator.closest('tr');
            if (!row) return;
            
            const cells = row.cells;
            if (cells.length < 7) return;
            
            // Set default attributes
            if (!indicator.getAttribute('data-status')) {
                if (indicator.classList.contains('status-alert')) {
                    indicator.setAttribute('data-status', 'alert');
                } else if (indicator.classList.contains('status-pending')) {
                    indicator.setAttribute('data-status', 'pending');
                } else if (indicator.classList.contains('status-inactive')) {
                    indicator.setAttribute('data-status', 'inactive');
                } else {
                    indicator.setAttribute('data-status', 'active');
                    indicator.classList.add('status-active');
                }
            }
            
            // Add tooltip attributes
            indicator.setAttribute('data-bs-toggle', 'tooltip');
            indicator.setAttribute('data-bs-placement', 'top');
            indicator.setAttribute('title', window.getStatusText(indicator.getAttribute('data-status')));
            indicator.style.cursor = 'pointer';
            
            // Get service details
            const service = cells[2]?.textContent || '';
            const variant = cells[3]?.textContent || '';
            const time = cells[5]?.textContent || '';
            
            // Add click handler
            indicator.addEventListener('click', function(e) {
                e.stopPropagation();
                window.openStatusModal(indicator, service, variant, time);
            });
            
            // Mark as processed
            indicator._processed = true;
        });
        
        // Initialize tooltips
        if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
            const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
            tooltipTriggerList.forEach(function(tooltipTriggerEl) {
                if (!tooltipTriggerEl._tooltip) {
                    new bootstrap.Tooltip(tooltipTriggerEl);
                    tooltipTriggerEl._tooltip = true;
                }
            });
        }
    }
    
    // Initial update
    updateAllStatusIndicators();
    
    // Set up a mutation observer to handle dynamic content
    const observer = new MutationObserver(function(mutations) {
        let shouldUpdate = false;
        
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                shouldUpdate = true;
            }
        });
        
        if (shouldUpdate) {
            // Use a small delay to ensure the DOM is ready
            setTimeout(updateAllStatusIndicators, 100);
        }
    });
    
    // Start observing the document with the configured parameters
    observer.observe(document.body, { 
        childList: true, 
        subtree: true 
    });
});
