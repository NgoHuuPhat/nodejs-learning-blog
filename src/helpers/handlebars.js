const Handlebars = require('handlebars');

module.exports = {
    sum: (a, b) => a + b,
    sub: (a, b) => a - b,

    for: (start, end, block) => {
        let accum = '';
        for (let i = start; i <= end; i++) {
            accum += block.fn(i);
        }
        return accum;
    },

    eq: (a, b) => a === b,


    sortTable: (field, sort) => {
        const sortType = field === sort.column ? sort.type : 'default';
        const icons = {
            default: 'fa-solid fa-sort',
            asc: 'fa-solid fa-arrow-down-short-wide',
            desc: 'fa-solid fa-arrow-down-wide-short'
        };

        const types = {
            default: 'desc',
            asc: 'desc',
            desc: 'asc'
        };

        const icon = icons[sortType];
        const type = types[sortType];

        // Bảo mật XSS 
        const address = Handlebars.escapeExpression(`?_sort&column=${field}&type=${type}`);
        const output = `<a href="${address}"><i class="${icon}"></i></a>`;

        return new Handlebars.SafeString(output);
    }
};
