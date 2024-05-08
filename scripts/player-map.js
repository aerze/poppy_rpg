const Player = require("./player");

class PlayerMap extends Map {
    static Filters = {
        Active:  p => p.active,
        Attack:  p => p.action === Player.ACTION.ATTACK,
        Defend:  p => p.action === Player.ACTION.DEFEND,
        Heal:    p => p.action === Player.ACTION.HEAL,
        Damaged: p => p.health < p.maxHealth,
    }

    /**
     * @returns {Player[]}
     */
    toArray() {
        return Array.from(this.values());
    }

    getActivePlayerCount() {
        let count = 0;
        for (const player of this) {
            if (player.active) count += 1;
        }
        return count;
    }

    giveXP(xp) {
        this.forEach((player) => {
            player.xp += xp;
            player.updatePlayerClient();
        });
    }

    // TODO
    // wrap set/delete/clear methods to recreate array then
}

module.exports = PlayerMap;