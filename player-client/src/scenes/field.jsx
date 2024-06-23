import './field.scss';

export function FieldScene() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const r = window.devicePixelRatio;


  return (
    <div className="field-scene">
      <div className="battle-screen">
        <pre>{w}x{h} r:{r}</pre>
      </div>
      <div className="battle-controls">
        <div className="turn-indicator">
          <progress className="turn-progress" max={100} value={30} />
        </div>
        <div className="battle-button-group">
          <button className="battle-button">Attack</button>
          <button className="battle-button">Defend</button>
          <button className="battle-button">Heal</button>
          <button className="battle-button">Revive</button>
        </div>
      </div>
    </div>
  )
}
