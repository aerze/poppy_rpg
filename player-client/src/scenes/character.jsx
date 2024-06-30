import { useContext, useState } from "react";
import { DragPreviewImage, useDrag, useDrop } from "react-dnd";
import "./character.scss";
import { PlayerContext } from "../context/player";

export function CharacterEquipmentOverlay() {
  const { player } = useContext(PlayerContext);
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

export function CharacterInfoForm() {
  function handleFormSubmit(event) {
    event.preventDefault();
  }

  return (
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
  );
}

const skillList = {
  Fireball: {
    image: "🔥",
    name: "Fireball",
    desc: "Shoots a ball of flame",
  },
  FrogBall: {
    image: "🐸",
    name: "FrogBall",
    desc: "Shoots a ball of flame",
  },
  SparkleBall: {
    image: "✨",
    name: "SparkleBall",
    desc: "Shoots a ball of flame",
  },
  Rock: {
    image: "💎",
    name: "Rock",
    desc: "Shoots a ball of flame",
  },
  RTFM: {
    image: "📚",
    name: "RTFM",
    desc: "Read the fucking manual",
  },
  Pizza: {
    image: "🍕",
    name: "Pizza",
    desc: "Shoots a ball of flame",
  },
  Juice: {
    image: "🧃",
    name: "Juice",
    desc: "Shoots a ball of flame",
  },
};

export function SkillSlot() {
  const [{ canDrop, isOver }, drop] = useDrop(() => ({
    accept: "SKILL",
    drop(item, monitor) {
      console.log(item);
    },
    collect: (monitor) => ({
      canDrop: monitor.canDrop(),
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div className="skill-slot" ref={drop} style={{ backgroundColor: isOver ? "#33333390" : "initial" }}>
      Place a Skill here
    </div>
  );
}

export function CharacterSkillOverlay() {
  return (
    <div className="skill-overlay">
      <div className="skill-group">
        <SkillSlot />
      </div>
      <div className="skill-group">
        <SkillSlot />
      </div>
      <div className="skill-group">
        <SkillSlot />
      </div>
      <div className="skill-group">
        <SkillSlot />
      </div>
    </div>
  );
}

export function CharacterSkillItem({ skill }) {
  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: "SKILL",
    previewOptions: {},
    item: skill,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div className="skill-item" style={{ opacity: isDragging ? 0.5 : 1 }}>
      <DragPreviewImage connect={preview} src="/images/fire_skill.png" />
      <div className="item-image" ref={drag}>
        {skill.image}
      </div>
      <div className="item-text">
        <div className="item-name">{skill.name}</div>
        <div className="item-description">{skill.desc}</div>
      </div>
    </div>
  );
}

export function CharacterSkillList() {
  return (
    <div className="skill-content">
      <div className="skill-description">
        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Alias maiores, illum necessitatibus odio possimus
        error accusamus ullam excepturi fuga dolore asperiores corrupti aliquam sapiente voluptate quas minima. Qui,
        nemo quidem.
      </div>
      <div className="skill-list-container">
        <div className="skill-list">
          {Object.values(skillList).map((skill) => (
            <CharacterSkillItem skill={skill} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function CharacterScene() {
  const [tabState, setTabState] = useState(0);
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

      <div class="character-content">
        {tabState === 0 && <CharacterInfoForm />}
        {tabState === 1 && <CharacterSkillList />}
      </div>
    </div>
  );
}
