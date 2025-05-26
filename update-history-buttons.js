// Update all history buttons to include the btn-history class
document.addEventListener('DOMContentLoaded', function() {
    function updateHistoryButtons() {
        // Find all buttons with the history icon
        const historyIcons = document.querySelectorAll('.fa-history');
        
        historyIcons.forEach(icon => {
            const button = icon.closest('button');
            if (button && !button.classList.contains('btn-history')) {
                button.classList.add('btn-history');
            }
        });
    }
    
    // Initial update
    updateHistoryButtons();
    
    // Set up a mutation observer to handle dynamically added content
    const observer = new MutationObserver(function(mutations) {
        let shouldUpdate = false;
        
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                shouldUpdate = true;
            }
        });
        
        if (shouldUpdate) {
            // Use a small delay to ensure the DOM is ready
            setTimeout(updateHistoryButtons, 100);
        }
    });
    
    // Start observing the document with the configured parameters
    observer.observe(document.body, { 
        childList: true, 
        subtree: true 
    });
});
