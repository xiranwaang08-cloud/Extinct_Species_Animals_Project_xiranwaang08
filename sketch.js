let species = [];
let images = {};
let timelineStart = -200000;  // 200,000 years ago
let timelineEnd = 2024;
let margin = 120;
let timelineY;
let lanesAssigned = false;

function preload() {
  // Load JSON synchronously via preload (must run from local server)
  let data = loadJSON("Extinction.json");
  
  // Ensure species is always an array
  species = Array.isArray(data) ? data : Object.values(data);

  // Preload all images
  species.forEach(s => {
    if (s.image) images[s.image] = loadImage("images/" + s.image);
  });
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  timelineY = height / 2;

  if (!species || species.length === 0) {
    console.error("No species loaded! Make sure Extinction.json exists and path is correct.");
    return;
  }

  // Map x positions along timeline
  species.forEach(s => {
    s.x = map(s.year ?? 0, timelineStart, timelineEnd, margin, width - margin);
  });

  // Assign lanes to avoid overlap
  assignLanes(species);
  lanesAssigned = true;

  console.log(`Loaded ${species.length} species, max lanes used: ${maxLane(species)}`);
}

function draw() {
  background(245);

  drawTimeline();

  if (lanesAssigned) drawSpeciesDots();
}

function drawTimeline() {
  stroke(0);
  strokeWeight(3);
  line(margin, timelineY, width - margin, timelineY);

  fill(0);
  noStroke();
  textAlign(CENTER, TOP);
  textSize(16);
  text("200,000 years before present", margin, timelineY - 40);
  text("2024 CE", width - margin, timelineY - 40);

  // Tick marks every 50,000 years
  stroke(100);
  strokeWeight(1);
  for (let y = -200000; y <= 0; y += 50000) {
    let x = map(y, timelineStart, timelineEnd, margin, width - margin);
    line(x, timelineY - 8, x, timelineY + 8);
  }
}

function assignLanes(list) {
  list.sort((a, b) => a.x - b.x);
  const occupiedUntil = [];

  list.forEach(s => {
    let placed = false;
    for (let i = 0; i < occupiedUntil.length; i++) {
      if (s.x - occupiedUntil[i] > 100) {
        s.lane = i;
        occupiedUntil[i] = s.x + 60;
        placed = true;
        break;
      }
    }
    if (!placed) {
      s.lane = occupiedUntil.length;
      occupiedUntil.push(s.x + 60);
    }
  });
}

function maxLane(list) {
  return list.length > 0 ? Math.max(...list.map(s => s.lane)) + 1 : 0;
}

function drawSpeciesDots() {
  const laneHeight = 70;

  species.forEach(s => {
    if (s.lane === undefined) return;

    const compactLane = Math.floor(s.lane / 2);
    const direction = s.lane % 2 === 0 ? 1 : -1;
    const y = timelineY + direction * compactLane * laneHeight;

    // Dot
    fill(255);
    stroke(0);
    strokeWeight(2);
    ellipse(s.x, y, 18, 18);

    // Species name
    fill(0);
    noStroke();
    textAlign(CENTER, BOTTOM);
    textSize(14);
    text(s.name, s.x, y - 22);

    // Year
    fill(80);
    textSize(12);
    const yearVal = s.year ?? 0;
    text(yearVal < 0 ? Math.abs(yearVal) + " BCE" : yearVal + " CE", s.x, y + 35);

    // Image
    if (s.image && images[s.image]) {
      imageMode(CENTER);
      image(images[s.image], s.x, y + 60, 50, 50);
    }
  });
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  timelineY = height / 2;

  if (!species || !lanesAssigned) return;

  species.forEach(s => {
    s.x = map(s.year ?? 0, timelineStart, timelineEnd, margin, width - margin);
  });
}
