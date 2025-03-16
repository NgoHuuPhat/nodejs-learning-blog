document.addEventListener('DOMContentLoaded', function () {
    
// (Client) 
    // Search 
    const searchForm = document.querySelector('.search-container');
    if (searchForm) {
        searchForm.addEventListener('submit', function (e) {
            const keyword = document.getElementById('searchInput').value.trim();
            if (!keyword) {
                e.preventDefault();
            }
        });
    }

// (Admin) 
    // Active menu

    // Create roles form 
    const btnAddRole = document.getElementById('btn-add-role');
    if (btnAddRole) {
        btnAddRole.addEventListener('click', function() {
            document.getElementById('create-roles-form').submit();
        });
    }

    // Timeout toast
    const toastEl = document.getElementById('toast-error');

    if (toastEl) {
        const toast = new bootstrap.Toast(toastEl, { delay: 2500, autohide: true });
        toast.show();
    }

})

