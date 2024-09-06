import { Instance, InstanceManager } from "../../claire/instance-manager";
import { Player } from "../global/player";
import { System } from "../system";

export class CrossroadSystem extends System {
  name = "cross";

  _mount(playerId: Player["id"]) {
    return {
      locations: this._getAllLocations(),
      currentLocation: this._getCurrentLocation(playerId),
    };
  }

  _getCurrentLocation(playerId: Player["id"]) {
    // TODO: maybe do some pre check to disconnect players with bad state
    return this.claire.instances.playerLocations.get(playerId);
  }

  _getAllLocations() {
    return [
      {
        id: InstanceManager.Town,
        name: "Town",
      },
      {
        id: InstanceManager.Forest,
        name: "Forest of Beginnings",
      },
    ];
  }

  _travel(playerId: Player["id"], instanceId: Instance["id"]) {
    this.claire.instances.move(playerId, instanceId);
  }
}
