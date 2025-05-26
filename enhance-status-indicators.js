// Enhance status indicators after the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Function to enhance a single status indicator
    function enhanceStatusIndicator(indicator) {
        // Skip if already enhanced
        if (indicator._enhanced) return;
        
        // Set default status if not set
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
        
        // Add click handler
        indicator.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // Get service details from the row
            const row = indicator.closest('tr');
            if (!row) return;
            
            const cells = row.cells;
            if (cells.length < 7) return;
            
            const service = cells[2]?.textContent || '';
            const variant = cells[3]?.textContent || '';
            const time = cells[5]?.textContent || '';
            
            // Open the status modal
            window.openStatusModal(indicator, service, variant, time);
        });
        
        // Mark as enhanced
        indicator._enhanced = true;
    }
    
    // Enhance all existing status indicators
    document.querySelectorAll('.status-indicator').forEach(enhanceStatusIndicator);
    
    // Set up a mutation observer to enhance new status indicators
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Element node
                        const indicators = node.matches('.status-indicator') ? 
                            [node] : 
                            node.querySelectorAll('.status-indicator');
                        
                        indicators.forEach(enhanceStatusIndicator);
                    }
                });
            }
        });
    });
    
    // Start observing the document with the configured parameters
    observer.observe(document.body, { 
        childList: true, 
        subtree: true 
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
});
