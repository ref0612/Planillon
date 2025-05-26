// Enhance table rows with history functionality
document.addEventListener('DOMContentLoaded', function() {
    function enhanceTableRows() {
        const rows = document.querySelectorAll('tbody tr');
        
        rows.forEach((row, index) => {
            // Skip if already enhanced
            if (row._enhanced) return;
            
            // Add service ID if not present
            if (!row.dataset.serviceId) {
                row.dataset.serviceId = `service-${index + 1}`;
            }
            
            // Find or create action buttons container
            let actionButtons = row.querySelector('.action-buttons');
            if (!actionButtons) {
                // Create action buttons if they don't exist
                const firstCell = row.cells[0] || row.insertCell(0);
                actionButtons = document.createElement('div');
                actionButtons.className = 'action-buttons';
                firstCell.innerHTML = '';
                firstCell.appendChild(actionButtons);
            }
            
            // Add history button if it doesn't exist
            if (!row.querySelector('.history-btn')) {
                const historyBtn = document.createElement('button');
                historyBtn.className = 'action-btn me-1 history-btn';
                historyBtn.title = 'Historial';
                historyBtn.innerHTML = '<i class="fas fa-history"></i>';
                
                // Insert before the last button or at the end
                const lastBtn = actionButtons.querySelector('button:last-child');
                if (lastBtn) {
                    actionButtons.insertBefore(historyBtn, lastBtn);
                } else {
                    actionButtons.appendChild(historyBtn);
                }
            }
            
            // Mark as enhanced
            row._enhanced = true;
        });
        
        // Add event listener for history buttons
        document.querySelectorAll('.history-btn').forEach(btn => {
            if (!btn._hasClickHandler) {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const row = this.closest('tr');
                    const serviceId = row.dataset.serviceId;
                    
                    // Get service data from the row
                    const serviceData = {
                        serviceNumber: row.cells[2]?.textContent || '',
                        departureTime: row.cells[5]?.textContent || '',
                        driver: row.cells[6]?.textContent || '',
                        bus: row.cells[4]?.textContent || ''
                    };
                    
                    // Open history modal
                    if (window.openHistoryModal) {
                        window.openHistoryModal(serviceId, serviceData);
                    } else {
                        console.error('History modal function not found');
                    }
                });
                
                btn._hasClickHandler = true;
            }
        });
    }
    
    // Initial enhancement
    enhanceTableRows();
    
    // Set up a mutation observer to handle dynamic content
    const observer = new MutationObserver(function(mutations) {
        let shouldEnhance = false;
        
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                shouldEnhance = true;
            }
        });
        
        if (shouldEnhance) {
            // Use a small delay to ensure the DOM is ready
            setTimeout(enhanceTableRows, 100);
        }
    });
    
    // Start observing the document with the configured parameters
    observer.observe(document.body, { 
        childList: true, 
        subtree: true 
    });
});
