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

    // Permissions
    const tablePermissions = document.querySelector('.table-permissions')
    if(tablePermissions){
        const buttonSubmit = document.querySelector('.button-submit')

        buttonSubmit.addEventListener('click', function(){
            let permissions = []

            const rows = tablePermissions.querySelectorAll('[data-name]')

            rows.forEach(row => {
                const name = row.getAttribute('data-name')
                const inputs = row.querySelectorAll('input')

                if(name == 'id'){
                    inputs.forEach(input => {
                        const id = input.value
                        permissions.push({
                            id: id,
                            permissions: []
                        })
                    })
                } else {
                    inputs.forEach((input,index) => {
                        const checked = input.checked
                        if(checked){
                            permissions[index].permissions.push(name)
                        }
                    })
                }
            })

            console.log(permissions)
            if(permissions.length > 0){
                const formChangePermissions = document.querySelector('#form-change-permissions')
                const inputPermissions = formChangePermissions.querySelector('input[name="permissions"]')
                inputPermissions.value = JSON.stringify(permissions) //Vì Array nên phải chuyển thành chuỗi JSON trước khi gửi BE
                formChangePermissions.submit()
            }
        })
    }

    // Permissions data default
     const dataRecords = document.querySelector('[data-records]')
     if(dataRecords){
        const records = JSON.parse(decodeURIComponent(dataRecords.getAttribute('data-records')));
        const tablePermissions = document.querySelector('.table-permissions')

        records.forEach((record,index)=>{
            const permissions = record.permissions
            
            permissions.forEach((permission)=>{
                const row = tablePermissions.querySelector(`[data-name = "${permission}"]`)
                const input = row.querySelectorAll('input')[index]
                
                input.checked = true
            })
        })
     }

     //Checkbox All
     const checkboxAll = document.querySelectorAll('.checkbox-all')
     checkboxAll.forEach((checkboxAll)=>{
        checkboxAll.addEventListener('change', function(){
            const columIndex = this.getAttribute('data-column')

            //Tìm tất cả các checkbox trong cột tương ứng
            const checkboxes = document.querySelectorAll(
                `tr[data-name] td:nth-child(${+columIndex + 2}) input[type="checkbox"]` //+columnIndex: Chuyển columnIndex từ string thành number
            )
            checkboxes.forEach((checkbox)=>{
                checkbox.checked = checkboxAll.checked //checkboxAll.checked => Boolean True/False
            })
        })  
     })
 

})

