import { Rae } from "./rae";

console.log("test");

const rae = new Rae();
rae.socket.init();

const label = document.createElement("label");
document.body.appendChild(label);

const content = document.querySelector(".window-content")!;

let lastTimestamp: DOMHighResTimeStamp = performance.now();
function render(timestamp: DOMHighResTimeStamp) {
  label.innerText = (timestamp - lastTimestamp).toFixed(2);
  lastTimestamp = timestamp;

  const rect = content?.getBoundingClientRect();
  const size = `${rect?.width}px x ${rect?.height}px`;
  content.textContent = size;

  // requestAnimationFrame(render);
}

// render(lastTimestamp);
// requestAnimationFrame(render);
