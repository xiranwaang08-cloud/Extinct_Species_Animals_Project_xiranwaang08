let species = [];
let images = {};
let timelineY = 260;
let canvasHeight;
let selected = null;
let popupProgress = 0;

function preload() {
  // 從 JSON 文件加載數據
  loadJSON('extinction.json', data => {
    species = data.map(s => ({...s}));
    
    // 按年份排序（從遠古到現代）
    species.sort((a, b) => a.year - b.year);
    
    // 加載所有圖片
    species.forEach(s => {
      images[s.image] = loadImage("images/" + s.image);
    });
  });
}

function setup() {
  canvasHeight = max(windowHeight, species.length * 260 + 400);
  createCanvas(windowWidth, canvasHeight);
  positionEverything();

  // 生成投票按鈕
  const voteContainer = document.getElementById("voteButtonsContainer");
  species.forEach(s => {
    const btn = document.createElement("button");
    btn.textContent = s.name;
    btn.className = "voteOption";
    btn.onclick = () => alert(`Thanks for voting for ${s.name}!`);
    voteContainer.appendChild(btn);
  });
}

function positionEverything() {
  const startX = width / 2;
  let y = timelineY + 120;
  const spacingY = 260;
  
  species.forEach((s, i) => {
    s.x = startX;
    s.y = y;
    s.offsetX = (i % 2 === 0 ? -80 : 80);
    s.nameY = s.y;
    s.yearY = s.y + 24;
    y += spacingY;
  });
}

function draw() {
  // 背景漸變
  for (let y = 0; y < height; y++) {
    let c = lerpColor(color(245, 245, 240), color(230, 230, 225), y / height);
    stroke(c);
    line(0, y, width, y);
  }

  // 標題
  fill(30);
  noStroke();
  textAlign(CENTER, TOP);
  textSize(72);
  textStyle(BOLD);
  text("Last Witnesses", width / 2, 60);

  // 副標題
  textSize(28);
  textStyle(ITALIC);
  textLeading(48);
  fill(80);
  text("Extinct species through history", width / 2, 180);

  // 繪製時間軸和物種
  drawTimeline();
  drawAllSpecies();

  // 彈出卡片動畫
  if (selected) {
    popupProgress = min(1, popupProgress + 0.06);
    drawInfoCard(selected, popupProgress);
  } else {
    popupProgress = 0;
  }
}

function windowResized() {
  canvasHeight = max(windowHeight, species.length * 260 + 400);
  resizeCanvas(windowWidth, canvasHeight);
  positionEverything();
}

function mousePressed() {
  selected = null;
  for (let s of species) {
    if (dist(mouseX, mouseY, s.x, s.y) < 90) {
      selected = s;
      break;
    }
  }
}

function drawTimeline() {
  stroke(200);
  strokeWeight(5);
  line(width / 2, timelineY, width / 2, canvasHeight - 50);

  noStroke();
  fill(120);
  textSize(24);
  textAlign(CENTER);
  text("11,000 BCE", width / 2, timelineY - 30);
  text("2024 CE", width / 2, canvasHeight - 40);
}

function drawAllSpecies() {
  species.forEach((s, i) => {
    // 圓形背景
    fill(250, 250, 245);
    stroke(180);
    strokeWeight(4);
    ellipse(s.x, s.y, 140, 140);

    // 圖片
    if (images[s.image] && images[s.image].width) {
      push();
      translate(s.x, s.y);
      imageMode(CENTER);
      let ratio = images[s.image].width / images[s.image].height;
      let w = 124, h = w / ratio;
      image(images[s.image], 0, 0, w, h);
      pop();
    }

    // 名稱和年份
    noStroke();
    fill(60);
    textFont('Georgia');
    textSize(20);
    textStyle(ITALIC);
    textAlign(i % 2 === 0 ? RIGHT : LEFT, CENTER);
    
    text(s.name, s.x + s.offsetX, s.nameY);
    
    textSize(16);
    textStyle(NORMAL);
    let yearText = s.year > 0 ? `${s.year} CE` : `${Math.abs(s.year)} BCE`;
    text(yearText, s.x + s.offsetX, s.yearY);
  });
}

function drawInfoCard(s, progress) {
  const cardW = 520;
  const padding = 40;

  // 計算圖片大小
  let maxW = 440, maxH = 340;
  let imgObj = images[s.image];
  let imgW = imgObj ? imgObj.width : 1;
  let imgH = imgObj ? imgObj.height : 1;

  let ratio = imgW / imgH;
  let drawW = maxW;
  let drawH = maxW / ratio;
  if (drawH > maxH) {
    drawH = maxH;
    drawW = maxH * ratio;
  }

  // 計算文字高度
  const lineHeight = 24;
  const infoLines = s.info.split(/\n|\. /).length + 2;
  const textHeight = infoLines * lineHeight;
  const cardH = drawH + textHeight + padding * 3;

  // 目標位置（跟著滑鼠）
  let targetX = constrain(mouseX + 60, 40, width - cardW - 40);
  let targetY = constrain(mouseY - cardH / 2, 40, height - cardH - 40);

  // 起始位置（從物種位置彈出）
  let startX = s.x - cardW / 2;
  let startY = s.y - cardH / 2;

  // 插值動畫
  let cardX = lerp(startX, targetX, progress);
  let cardY = lerp(startY, targetY, progress);

  // 透明度
  let alphaVal = progress * 255;

  // 卡片背景
  fill(255, 255, 253, alphaVal);
  stroke(0, 0, 0, 60 * progress);
  strokeWeight(6);
  rect(cardX, cardY, cardW, cardH, 28);

  // 圖片
  if (imgObj) {
    tint(255, alphaVal);
    imageMode(CORNER);
    image(imgObj, cardX + padding, cardY + padding, drawW, drawH);

    noFill();
    stroke(0, 0, 0, 60 * progress);
    strokeWeight(4);
    rect(cardX + padding, cardY + padding, drawW, drawH);
    noTint();
  }

  // 文字
  noStroke();
  fill(70, alphaVal);
  textAlign(LEFT, TOP);
  textFont('Georgia');
  textLeading(lineHeight);

  let tX = cardX + padding;
  let textY = cardY + padding + drawH + 15;

  // 名稱
  textSize(28);
  textStyle(ITALIC);
  text(s.name, tX, textY);

  // 滅絕年份
  textSize(20);
  textStyle(NORMAL);
  let yearText = s.year > 0 ? `${s.year} CE` : `${Math.abs(s.year)} BCE`;
  text("Last seen: " + yearText, tX, textY + 32);

  // 詳細信息
  textSize(18);
  text(s.info, tX, textY + 60, cardW - padding * 2);
}