import { BattleData, BattleEndType, CombatantId, ResultData, UpdateData } from "../../rpg-server/data/battle-instance";
import { CombatantData } from "../../rpg-server/data/combatant";
import { getRandomInt } from "../../shared/helpers";
import { BaseManager } from "./base-manager";
import { Character } from "./character";

enum Flag {
  player,
  enemy,
}

const PlayerBattlePosition = [700, 100];
const EnemyBattlePosition = [800, 100];
const randomPlayerPosition = () => [getRandomInt(100, 500), getRandomInt(50, 110)];
const randomEnemyPosition = () => [getRandomInt(1000, 1400), getRandomInt(50, 110)];

export class BattleManager extends BaseManager {
  battle?: BattleData;

  players = new Map<CombatantId, Character>();
  enemies = new Map<CombatantId, Character>();
  flags = new Map<CombatantId, Flag>();

  update = ({ battle, results, battleEndType }: UpdateData) => {
    this.battle = battle;
    this.updatePlayers(battle.players);
    this.updateEnemies(battle.enemies);

    if (results) {
      this.updateResults(results);
    }

    if (battleEndType) {
      this.updateBattleEnd(battleEndType);
    }
  };

  updatePlayers(players: { [id: CombatantId]: CombatantData }) {
    const missingPlayers = new Set(this.players.keys());

    for (const [id, player] of Object.entries(players)) {
      const playerCharacter = this.players.get(id);

      if (playerCharacter) {
        // exiting player
        playerCharacter.update(player);
        missingPlayers.delete(id);
      } else {
        // new player
        const character = this.createPlayerCharacter(player);
        this.players.set(id, character);
        this.flags.set(id, Flag.player);
      }
    }

    for (const playerId of missingPlayers) {
      this.removePlayer(playerId);
    }
  }

  createPlayerCharacter(player: CombatantData) {
    const character = new Character(player);
    character.position = randomPlayerPosition();
    return character;
  }

  removePlayer(playerId: CombatantId) {
    // play animation then kill character
    const character = this.players.get(playerId);
    character?.delete();
    this.players.delete(playerId);
    this.flags.delete(playerId);
  }

  updateEnemies(enemies: { [id: CombatantId]: CombatantData }) {
    const missingEnemies = new Set(this.enemies.keys());

    for (const [id, enemy] of Object.entries(enemies)) {
      const enemyCharacter = this.enemies.get(id);

      if (enemyCharacter) {
        // exiting enemy
        enemyCharacter.update(enemy);
        missingEnemies.delete(id);
      } else {
        // new enemy
        const character = this.createEnemyCharacter(enemy);
        this.enemies.set(id, character);
        this.flags.set(id, Flag.enemy);
      }
    }

    for (const enemyId of missingEnemies) {
      this.removeEnemy(enemyId);
    }
  }

  createEnemyCharacter(enemy: CombatantData) {
    const character = new Character(enemy);
    character.position = randomEnemyPosition();
    this.log(enemy.id, character.position);
    return character;
  }

  removeEnemy(enemyId: CombatantId) {
    // play animation then kill character
    const character = this.enemies.get(enemyId);
    character?.delete();
    this.enemies.delete(enemyId);
    this.flags.delete(enemyId);
  }

  async updateResults(results: ResultData[]) {
    const duration = this.battle!.countdownDuration;
    const sleepTime = Math.ceil(duration / results.length);
    const halfTime = Math.ceil(sleepTime / 2);

    for (const [sourceId, targetId, damage, crit, dodge] of results) {
      const sourceIsPlayer = this.flags.get(sourceId) === Flag.player;
      const player = this.players.get(sourceIsPlayer ? sourceId : targetId);
      const enemy = this.enemies.get(sourceIsPlayer ? targetId : sourceId);

      player!.position = PlayerBattlePosition;
      enemy!.position = EnemyBattlePosition;

      await this.sleep(halfTime);

      player!.position = randomPlayerPosition();
      enemy!.position = randomEnemyPosition();

      await this.sleep(halfTime);
    }
  }

  updateBattleEnd(battleEndType: BattleEndType) {
    this.log(battleEndType);
  }

  async sleep(ms: number) {
    return new Promise((res) => {
      setTimeout(res, ms);
    });
  }
}
