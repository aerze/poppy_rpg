/**
 *
 * @credit Nimphious
 */
export function makePlayerNameSVG(name: string) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const outline = document.createElementNS("http://www.w3.org/2000/svg", "text");
  const fill = document.createElementNS("http://www.w3.org/2000/svg", "text");

  outline.setAttribute("class", "player-name-stroke");
  fill.setAttribute("class", "player-name-fill");

  outline.innerHTML = name;
  fill.innerHTML = name;

  svg.appendChild(outline);
  svg.appendChild(fill);

  svg.setAttribute("width", "auto");
  svg.setAttribute("height", "20");

  // console.log(svg);

  return svg;
}

// document.querySelector("#create").addEventListener("click", () => {
//   const svg = makePlayerNameSVG(document.querySelector("#playername").value);
//   document.body.appendChild(svg);
// });
