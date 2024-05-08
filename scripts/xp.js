

function getLevelRequirement(level) {
    if (level === 1) {
        return 4;
    }

    return Math.pow(level, 3);
}

function scaleStat(level, base) {
    return Math.floor(base * (1 + (0.2 * level)));
}

module.exports = {
    getLevelRequirement,
    scaleStat
}