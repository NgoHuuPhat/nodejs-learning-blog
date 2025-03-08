document.querySelector('.search-container').addEventListener('submit', function(e) {
    const keyword = document.getElementById('searchInput').value.trim() //Loại bỏ khoảng trắng ở đầu và cuối
    if (!keyword) {
        e.preventDefault()
    }
})