import "./character.scss";

export function CharacterScene() {
  function handleFormSubmit(event) {
    event.preventDefault();
  }

  return (
    <div class="character-scene column full-height">
      <div class="character-view row">
        <img class="character column full-width" src="/images/abby_test.png" />
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
