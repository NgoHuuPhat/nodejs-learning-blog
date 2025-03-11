module.exports = (objectPagination, query, countCourses) => {
    if(query.page){
        objectPagination.currentPage = parseInt(query.page) // String nên phải chuy ển sang number
    }

    //Công thức phân trang 
    objectPagination.skip = (objectPagination.currentPage - 1) * objectPagination.limitItems

    //Tính tổng số trang
    const totalPage = Math.ceil(countCourses/objectPagination.limitItems)
    objectPagination.totalPage = totalPage

    //Tính giá trị bắt đầu và giá trị kết thúc
    const startIndex = (( objectPagination.currentPage - 1) * objectPagination.limitItems) + 1
    const endIndex = Math.min(objectPagination.currentPage * objectPagination.limitItems, countCourses)
    objectPagination.startIndex = startIndex
    objectPagination.endIndex = endIndex
    objectPagination.countCourses = countCourses

    return objectPagination
}

