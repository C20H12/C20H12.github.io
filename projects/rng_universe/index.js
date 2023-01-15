const canvas = document.querySelector("canvas#main");
const dialog = document.querySelector("canvas#dialog");
const ctx = canvas.getContext('2d');
const dialogCtx = dialog.getContext('2d');

const display = document.querySelector('#props');

ctx.fillStyle = "black";
ctx.fillRect(0, 0, canvas.width, canvas.height);

const seedInput = document.querySelector('#gseed');


class StarSytem {
  arrStarColors = [
    "#ffffa0", "#afc9ff", "#afc9ff", "#c7d8ff",
    "#ffe5cf", "#ffd9b2", "#ffc78e", "#ffa651"
  ]

  starExists = false;
  starDiameter = 0;
  starColor = "#ffffff";

  arrPlanets = [];

  starName = 'uncharted';
  
  constructor(x, y, generateFull = false) {
    let globalSeed = parseInt(seedInput.value, 10) || 0;
    globalSeed = globalSeed === 0 ? 0 : this.randInt(0, 2147483647, globalSeed);

    let seed = ((x & 0xffff) << 16 | (y & 0xffff)) + globalSeed;
    this.starName = Math.abs(seed).toString(16);

    this.starExists = this.randInt(0, 20, seed) == 1;
    if (!this.starExists) return;

    this.starDiameter = this.randFloat(20, 80, seed);

    let color = this.randInt(0, 7, seed)
    this.starColor = this.arrStarColors[color];

    
    if (!generateFull) return;
    
    let numOfPlanets = this.randInt(0, 8, seed);
    let distanceFromStar = this.randFloat(0.1, 1.5, seed);
    for (let i = 0; i < numOfPlanets; i++) {
      let nextDistanceFromStar = distanceFromStar + this.randFloat(0.5, 5, seed + i);
      const planet = {
        distance: this.randFloat(distanceFromStar, nextDistanceFromStar, seed + i),
        diameter: this.randFloat(8, 20, seed + i),
        properties: {
          temperature: this.randFloat(-273, 900, seed + i),
          atmosphere: this.randInt(0, 100, seed + i) > 60,
        },
        moons: []
      }

      
      planet.properties.flora = planet.properties.atmosphere ? this.randInt(0, 100, seed + i) : 0;
      planet.properties.fauna = planet.properties.atmosphere ? this.randInt(0, 100, seed + i + 1) : 0;
      planet.properties.water = planet.properties.atmosphere ? this.randInt(0, 100, seed + i + 2) : 0;
      planet.properties.population = Math.max(this.randInt(-1847483647, 2147483647, seed + i), 0);
      planet.properties.rings = this.randInt(0, 30, seed + i) == 1; // one in 30 chance

      let nMoons = Math.max(this.randInt(-5, 5, seed + i), 0);
      for (let n = 0; n < nMoons; n++){
        const moon = {
          diameter: this.randFloat(3, 10, seed + i + n)
        }
        planet.moons.push(moon);
      }

      this.arrPlanets.push(planet);
      distanceFromStar += nextDistanceFromStar
    }
  }

  randomGenerator(seed) {
    seed = Math.imul(seed + 0xe120fc15, 0x4a39b70d);
    seed = Math.imul((seed >> 16) ^ seed, 0x12fad5c9);
    return (seed >> 16) ^ seed;
  }

  randInt(min, max, seed) {
    return (this.randomGenerator(seed) % (max - min + 1)) + min;
  }

  randFloat(min, max, seed) {
    return (this.randomGenerator(seed) / 0x7FFFFFFF) * (max - min + 1) + min;
  }

  static draw(x, y, radius = 0, color, borderRadius = 0, context = ctx) {
    if (radius > 0) {
      context.beginPath();
      context.arc(
        x, y,
        radius,
        0, 2 * Math.PI, false
      )
      context.fillStyle = color;
      context.fill();
    }
    
    if (borderRadius > 0) {
      context.beginPath();
      context.arc(
        x, y,
        borderRadius,
        0, 2 * Math.PI, false
      )
      context.lineWidth = 2;
      context.strokeStyle = color;
      context.stroke();
    }
  }
}

const galaxyOffset = {x: 0, y: 0};
window.addEventListener('keydown', (e) => {  
  if (e.key == "w") {
    galaxyOffset.y -= 1;
  } else if (e.key == "s") {
    galaxyOffset.y += 1;
  } else if (e.key == "a") {
    galaxyOffset.x -= 1;
  } else if (e.key == "d") {
    galaxyOffset.x += 1;
  }
})

const mouse = {x: 0, y: 0};
canvas.addEventListener('mousemove', (e) => {
  mouse.x = Math.floor(e.offsetX / 16);
  mouse.y = Math.floor(e.offsetY / 16);
})

const dialogMouse = {x: 0, y: 0};
dialog.addEventListener('mousemove', (e) => {
  dialogMouse.x = e.offsetX;
  dialogMouse.y = e.offsetY;
})



let starSelected = false
let vStarSelected = {x: 0, y: 0};

setInterval(() => {

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let sectorX = canvas.width / 16;
  let sectorY = canvas.height / 16;

  const galaxyMouse = {
    x: mouse.x + galaxyOffset.x,
    y: mouse.y + galaxyOffset.y
  }  

  const screenSector = {x: 0, y: 0};

  for (screenSector.x = 0; screenSector.x < sectorX; screenSector.x++) {
    for (screenSector.y = 0; screenSector.y < sectorY; screenSector.y++) {
      const starSystem = new StarSytem(
        screenSector.x + galaxyOffset.x, screenSector.y + galaxyOffset.y
      );
      if (!starSystem.starExists) continue;

      StarSytem.draw(
        screenSector.x * 16 + 8, screenSector.y * 16 + 8,
        starSystem.starDiameter / 8, starSystem.starColor
      )

      if (mouse.x == screenSector.x && mouse.y == screenSector.y) {
        StarSytem.draw(
          screenSector.x * 16 + 8, screenSector.y * 16 + 8,
          0, "#ffff00", starSystem.starDiameter * 0.3
        )
      }
    }
  }

  canvas.onclick = () => {
    const star = new StarSytem(galaxyMouse.x, galaxyMouse.y);
    if (star.starExists) {
      starSelected = true;
      vStarSelected = galaxyMouse;
    } else {
      starSelected = false;
    }
  }

  if (starSelected) {
    const star = new StarSytem(vStarSelected.x, vStarSelected.y, true);

    dialogCtx.fillStyle = "#00007d";
    dialogCtx.fillRect(0, 0, dialog.width, dialog.height);

    dialogCtx.fillStyle = "#ffff00";
    dialogCtx.font = "40px Arial"
    dialogCtx.fillText("system: " + star.starName, 200, 30)

    const body = {x: 0, y: dialog.height / 2};
    body.x += star.starDiameter * 1.375;
    StarSytem.draw(body.x, body.y, star.starDiameter * 1.375, star.starColor, 0, dialogCtx);
    body.x += star.starDiameter * 1.375 + 8;

    let planetIndex = 1;
    for (const planet of star.arrPlanets) {
      if (body.x + planet.diameter >= 470) break;

      body.x += planet.diameter
      StarSytem.draw(body.x, body.y, planet.diameter, "#00ff00", 0, dialogCtx);

      if (dialogMouse.x >= body.x - planet.diameter &&
          dialogMouse.x <= body.x + planet.diameter &&
          dialogMouse.y >= body.y - planet.diameter &&
          dialogMouse.y <= body.y + planet.diameter) {
        StarSytem.draw(body.x, body.y, 0, "#ffff00", planet.diameter * 1.3, dialogCtx);
        
        let htmlString = `
          <p>distance: <span>${planet.distance.toFixed(2)} AU</span></p>
          <p>diameter: <span>${planet.diameter.toFixed(2) * 1000} KM</span></p>
          <p>moons: <span>${planet.moons.length}</span></p>
          <p>rings: <span>${planet.properties.rings ? "yes" : "no"}</span></p>
          <p>average temperature: <span>${planet.properties.temperature.toFixed(1)} C</span></p>
          <p>flora: <span>${planet.properties.flora} %</span></p>
          <p>fauna: <span>${planet.properties.fauna} %</span></p>
          <p>water: <span>${planet.properties.water} %</span></p>
          <p>population: <span>${planet.properties.population}</span></p>
          <p>has atmosphere: <span>${planet.properties.atmosphere ? "yes" : "no"}</span></p>
        `;

        display.innerHTML = htmlString;
        display.className = "show";
      }

      const moon = {
        x: body.x,
        y: body.y
      }
      moon.y += planet.diameter + 10
      for (const aMoon of planet.moons) {
        moon.y += aMoon.diameter
        StarSytem.draw(moon.x, moon.y, aMoon.diameter, "#c6c6c6", 0, dialogCtx);
        moon.y += aMoon.diameter + 10
      }

      body.x += planet.diameter + 8;
      planetIndex++;
    }
  } else {
    dialogCtx.fillStyle = "#ffffff";
    dialogCtx.fillRect(0, 0, dialog.width, dialog.height);
    display.innerHTML = '';
    display.className = "hide";
  }

}, 167);