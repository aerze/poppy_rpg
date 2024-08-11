import { useContext, useState } from "react";
import { DragPreviewImage, useDrag, useDrop } from "react-dnd";
import "./character.scss";
import { SocketContext } from "../context/socket";

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

export function CharacterInfoForm({ presetId, setPresetId }) {
  const [disabled, setDisabled] = useState(false);
  const { socket, player, updatePlayer } = useContext(SocketContext);

  console.log(">> char info", player);
  function handleFormSubmit(event) {
    event.preventDefault();

    const data = Object.fromEntries(new FormData(event.target).entries());
    const formData = { ...data, presetId };
    console.log(formData);
    if (!data.name.trim() || !socket) {
      return;
    }
    setDisabled(true);

    if (player?.id) {
      updatePlayer({ ...formData, id: player.id }, () => {
        setDisabled(false);
      });
    } else {
      socket.emit("RPG:HANDLE_SIGN_UP", formData);
      socket.once("RPG:COMPLETED_SIGN_UP", () => {
        setDisabled(false);
      });
    }
  }

  function handleLeftClick() {
    setPresetId(Math.max(presetId - 1, 0));
  }

  function handleRightClick() {
    setPresetId(Math.min(presetId + 1, 1));
  }

  return (
    <form className="character-form" onSubmit={handleFormSubmit}>
      <div className="character-button-group">
        <label>Name</label>
        <input type="text" name="name" id="name" defaultValue={player?.name} autoComplete="off" />
      </div>
      <div className="character-button-group">
        <label>Color</label>
        <input type="color" name="color" id="color" defaultValue={player?.color} />
      </div>
      <div className="character-button-group">
        <label>Preset Character (char: {presetId})</label>
        <div className="preset-container">
          <button type="button" className="arrow left-arrow" onClick={handleLeftClick}>
            ◀️
          </button>
          <button type="button" className="arrow right-arrow" onClick={handleRightClick}>
            ▶️
          </button>
        </div>
      </div>
      <div className="character-button-group">
        <label>Backstory (tragedy optional)</label>
        <div className="preset-container">
          <textarea defaultValue={player.backstory} name="backstory" id="backstory" rows={3} />
        </div>
      </div>
      <div className="character-button-group">
        <button disabled={disabled} className="submit-button" type="submit">
          Save
        </button>
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

const CHARACTER_SPRITE_MAP = {
  0: "/app/images/tay_test.png",
  1: "/app/images/abby_test.png",
};

export function CharacterScene() {
  const { isNewPlayer, player } = useContext(SocketContext);
  const [tabState, setTabState] = useState(0);
  const [presetId, setPresetId] = useState(player?.presetId ?? 0);
  const disabled = isNewPlayer;

  return (
    <div className="character-scene column full-height">
      <div className="character-view row">
        <img className="character-image column full-width" src={CHARACTER_SPRITE_MAP[presetId]} />
        {tabState === 0 && <CharacterInfoOverlay />}
        {tabState === 1 && <CharacterSkillOverlay />}
        {tabState === 2 && <CharacterEquipmentOverlay />}
      </div>

      <div className="character-tab-group">
        <button className="tab-button" onClick={(e) => setTabState(0)}>
          Info
        </button>
        <button disabled={true} className="tab-button" onClick={(e) => setTabState(1)}>
          Abilities
        </button>
        <button disabled={true} className="tab-button" onClick={(e) => setTabState(2)}>
          Equipment
        </button>
      </div>

      <div className="character-content">
        {tabState === 0 && <CharacterInfoForm presetId={presetId} setPresetId={setPresetId} />}
        {tabState === 1 && <CharacterSkillList />}
      </div>
    </div>
  );
}
