import { Player, PlayerFormData } from "../global/player";
import { System } from "../system";

export class CharacterSystem extends System {
  name = "char";

  async _updatePlayer(playerId: Player["id"], options: { formData: PlayerFormData & { id: string } }) {
    if (!options.formData) {
      this.log("missing form data");
      return;
    }

    if (!options.formData.id) {
      this.log("missing form data id");
      return;
    }

    if (options.formData.id !== playerId) {
      this.log("player id does not match form data id");
      return;
    }

    this.log(`updating ${playerId}`);

    const result = await this.claire.db.players.update(playerId, options.formData);
    if (result) {
      const updatedPlayer = await this.claire.db.players.get(playerId);
      if (updatedPlayer) {
        this.claire.players.list.set(playerId, updatedPlayer);
        this.updatePlayerGlobal(playerId, { player: updatedPlayer });
      }
      return true;
    }
  }
}
