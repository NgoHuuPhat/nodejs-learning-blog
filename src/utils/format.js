function formatDate(date) {
    if (!date) {
        throw new Error('Cần truyền vào ngày');
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
        });
    } catch (e) {
        throw new Error('Lỗi định dạng ngày: ' + e.message);
    }
}

function formatCurrency(price) {
    if (price === undefined || price === null) {
        throw new Error('Cần truyền vào giá');
    }
    try {
        return Number(price).toLocaleString('vi-VN') + ' VNĐ';
    } catch (e) {
        throw new Error('Lỗi định dạng tiền tệ: ' + e.message);
    }
}

function formatDuration(seconds) {
    if (seconds === undefined || seconds === null) {
        throw new Error('Cần truyền vào thời lượng');
    }

    const pad = (num) => {
        if (num === 0) return '0';
        return num < 10 ? '0' + num : String(num);
    };

    try {
        const totalSeconds = Math.floor(Number(seconds));
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const secs =  totalSeconds % 60;
        
        return {
            hours: pad(hours),
            minutes: pad(minutes),
            seconds: pad(secs),
        };
    } catch (e) {
        throw new Error('Lỗi định dạng thời lượng: ' + e.message);
    }
}

module.exports = {
    formatDate,
    formatCurrency,
    formatDuration,
};
