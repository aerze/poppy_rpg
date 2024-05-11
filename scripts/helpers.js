function sleep(time = 1000) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), time);
    });
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 
 * @param {Array} arr 
 * @returns
 */
function getRandomFromArray(arr) {
    if (!arr.length) return;
    return arr[getRandomInt(0, arr.length -1)];
}

module.exports = {
    sleep,
    getRandomInt,
    getRandomFromArray
}