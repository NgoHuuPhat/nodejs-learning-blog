module.exports = (objectPagination, query, count) => {
    if(query.page){
        objectPagination.currentPage = parseInt(query.page) // String nên phải chuyển sang number
    }

    //Công thức phân trang 
    objectPagination.skip = (objectPagination.currentPage - 1) * objectPagination.limitItems

    //Tính tổng số trang
    const totalPage = Math.ceil(count/objectPagination.limitItems)
    objectPagination.totalPage = totalPage

    //Tính giá trị bắt đầu và giá trị kết thúc
    const startIndex = (( objectPagination.currentPage - 1) * objectPagination.limitItems) + 1
    const endIndex = Math.min(objectPagination.currentPage * objectPagination.limitItems, count)
    objectPagination.startIndex = startIndex
    objectPagination.endIndex = endIndex
    objectPagination.count = count

    return objectPagination
}

