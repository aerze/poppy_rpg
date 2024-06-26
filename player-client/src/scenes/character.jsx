import { useState } from "react";
import "./character.scss";

export function CharacterEquipmentOverlay() {
  return (
    <div className="equipment-overlay">
      <div className="equipment left-equipment">
        <div className="equipment-group head">
          <div className="equipment-slot"></div>
          <div className="equipment-label">
            <label className="label-text">HEAD</label>
          </div>
        </div>
        <div className="equipment-group left-hand">
          <div className="equipment-slot"></div>
          <div className="equipment-label">
            <label className="label-text">L HAND</label>
          </div>
        </div>
        <div className="equipment-group torso">
          <div className="equipment-slot"></div>
          <div className="equipment-label">
            <label className="label-text">TORSO</label>
          </div>
        </div>
        <div className="equipment-group legs">
          <div className="equipment-slot"></div>
          <div className="equipment-label">
            <label className="label-text">LEGS</label>
          </div>
        </div>
      </div>
      <div className="equipment right-equipment">
        <div className="equipment-group face">
          <div className="equipment-slot"></div>
          <div className="equipment-label">
            <label className="label-text">FACE</label>
          </div>
        </div>
        <div className="equipment-group right-hand">
          <div className="equipment-slot"></div>
          <div className="equipment-label">
            <label className="label-text">R HAND</label>
          </div>
        </div>
        <div className="equipment-group extra-1">
          <div className="equipment-slot"></div>
          <div className="equipment-label">
            <label className="label-text">EX 1</label>
          </div>
        </div>
        <div className="equipment-group extra-2">
          <div className="equipment-slot"></div>
          <div className="equipment-label">
            <label className="label-text">EX 2</label>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CharacterSkillOverlay() {
  return (
    <div className="skill-overlay">
      <div className="skill-group">
        <div className="skill-slot"></div>
      </div>
      <div className="skill-group">
        <div className="skill-slot"></div>
      </div>
      <div className="skill-group">
        <div className="skill-slot"></div>
      </div>
      <div className="skill-group">
        <div className="skill-slot"></div>
      </div>
    </div>
  );
}

export function CharacterInfoOverlay({ xp }) {
  return (
    <div className="info-overlay">
      <div className="stat-group">
        <div className="stat-label">XP:</div>
        <div className="stat-value">{xp}</div>
      </div>
    </div>
  );
}

export function CharacterScene() {
  const [tabState, setTabState] = useState(0);
  function handleFormSubmit(event) {
    event.preventDefault();
  }

  return (
    <div class="character-scene column full-height">
      <div class="character-view row">
        <img class="character-image column full-width" src="/images/abby_test.png" />
        {tabState === 0 && <CharacterInfoOverlay xp={"1000/2000"} />}
        {tabState === 1 && <CharacterSkillOverlay />}
        {tabState === 2 && <CharacterEquipmentOverlay />}
      </div>

      <div className="character-tab-group">
        <button className="tab-button" onClick={(e) => setTabState(0)}>
          Info
        </button>
        <button className="tab-button" onClick={(e) => setTabState(1)}>
          Skills
        </button>
        <button className="tab-button" onClick={(e) => setTabState(2)}>
          Equipment
        </button>
      </div>
      <div class="character-controls">
        <form class="character-form column align-center" onSubmit={handleFormSubmit}>
          <div class="character-button-group column align-center">
            <label>Preset</label>
            <div class="preset-container row align-center">
              <button class="arrow left-arrow">◀️</button>
              <input type="text" name="preset" id="preset" />
              <button class="arrow right-arrow">▶️</button>
            </div>
          </div>
          <div class="character-button-group">
            <label>Name</label>
            <input type="text" name="name" id="name" />
          </div>
          <div class="character-button-group">
            <label>Color</label>
            <input type="color" name="color" id="color" />
          </div>
          <div class="character-button-group">
            <button type="submit">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}
