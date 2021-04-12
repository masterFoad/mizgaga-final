function sum(numbers) {
    return numbers.reduce((a, b) => a + b, 0);
}

function average(numbers) {
    return sum(numbers) / (numbers.length || 1);
}

function window(_number, index, array) {
    const start = Math.max(0, index - 3);
    const end   = Math.min(array.length, index + 3);
    return _number.slice(start, end);
}

function moving_average(numbers) {
    return numbers
        .map(window)
        .map(average)
        .value();
}

export {
    moving_average
}
