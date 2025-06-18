function formatDate(date) {
    if (!date) {
        throw new Error('Date is required')
    }
    try {
        return new Date(date).toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false, 
        })
    }
    catch (e) {
        throw new Error('Error formatting date: ' + e.message)
    }
}

function formatCurrency(price) {
    if (price === undefined || price === null) {
        throw new Error('Price is required')
    }
    try {
        return Number(price).toLocaleString('vi-VN') + ' VNĐ'
    }
    catch (e) {
        throw new Error('Error formatting Currency: ' + e.message)
    }
}

module.exports = {
    formatDate,
    formatCurrency,
}