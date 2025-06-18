function sortTable(req) {
    if (req.query.hasOwnProperty('_sort')) {
        const isValidType = ['asc', 'desc'].includes(req.query.type)

        const sortOption = {
            [req.query.column]: isValidType ? req.query.type : 'desc',
        }

        // Sử dụng collation để sắp xếp không phân biệt chữ hoa chữ thường
        return this.sort(sortOption).collation({ locale: 'en', strength: 2 })
    }
    return this
}

module.exports = { sortTable }
