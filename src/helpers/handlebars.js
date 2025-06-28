const Handlebars = require('handlebars')
const dayjs = require('dayjs') // Thư viện xử lý thời gian
const relativeTime = require('dayjs/plugin/relativeTime')
const vi = require('dayjs/locale/vi') // Ngôn ngữ tiếng Việt

dayjs.extend(relativeTime)
dayjs.locale('vi')

module.exports = {
    sum: (a, b) => a + b,
    sub: (a, b) => a - b,
    multiply: (a, b) => a * b,

    for: (start, end, block) => {
        let accum = ''
        for (let i = start; i <= end; i++) {
            accum += block.fn(i)
        }
        return accum
    },

    eq: (a, b) => a === b,

    toString: (value) => {
        if (value && value.toString) {
            return value.toString()
        }
        return value
    },

    sortTable: (field, sort, query) => {
        // Thêm query vào tham số
        const sortType = field === sort.column ? sort.type : 'default'
        const icons = {
            default: 'fa-solid fa-sort',
            asc: 'fa-solid fa-arrow-down-short-wide',
            desc: 'fa-solid fa-arrow-down-wide-short',
        }

        const types = {
            default: 'desc',
            asc: 'desc',
            desc: 'asc',
        }

        const icon = icons[sortType]
        const type = types[sortType]

        let queryString = `?_sort&column=${field}&type=${type}`
        if (query.page) {
            queryString += `&page=${query.page}`
        }

        // Bảo mật XSS
        const address = Handlebars.escapeExpression(queryString)
        const output = `<a href="${address}"><i class="${icon}"></i></a>`

        return new Handlebars.SafeString(output)
    },

    includes: function (array, value, options) {
        // Kiểm tra nếu `array` không phải là một mảng
        if (!Array.isArray(array)) return false

        const exists = array.includes(value)

        if (typeof options === 'object' && options.fn) {
            return exists ? options.fn(this) : options.inverse(this)
        }

        return exists
    },

    timeAgo: (date) => {
        return dayjs(date).fromNow() // So sánh thời gian với thời gian hiện tại
    },

    json: function(context) {
        return JSON.stringify(context)
    },

    inArray: function(value, array) {
        if (!Array.isArray(array)) return false
        return array.includes(value)
    }
    
}
