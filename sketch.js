let popupProgress = 0;

function draw() {
  // ...其他 draw 代碼
  if (selected) {
    if (popupProgress < 1) popupProgress += 0.05; // 動畫速度
    drawInfoCard(selected, popupProgress);
  } else {
    popupProgress = 0; // 關閉時重置
  }
}

function drawInfoCard(s, progress) {
  // progress: 0~1
  const cardW = 520;
  const padding = 40;

  // 計算圖片大小
  let maxW = 440, maxH = 340;
  let imgW = images[s.image] ? images[s.image].width : 1;
  let imgH = images[s.image] ? images[s.image].height : 1;
  let ratio = imgW / imgH;
  let drawW = maxW;
  let drawH = maxW / ratio;
  if (drawH > maxH) { drawH = maxH; drawW = maxH * ratio; }

  const lineHeight = 26;
  const lineCount = 3 + s.causeOfExtinction.length;
  const textHeight = lineCount * lineHeight;
  const cardH = drawH + textHeight + padding * 3;

  // 卡片目標位置
  let targetX = constrain(mouseX + 60, 40, width - cardW - 40);
  let targetY = constrain(mouseY - cardH / 2, 40, canvasHeight - cardH - 40);

  // 漸入效果：從圖片位置出發
  let startX = s.x - cardW/2;
  let startY = s.y - cardH/2;
  let cardX = lerp(startX, targetX, progress);
  let cardY = lerp(startY, targetY, progress);

  // 淡入透明度
  let alphaVal = progress * 255;

  // 繪製卡片
  fill(255,255,253, alphaVal);
  stroke(0,0,0,50*progress);
  strokeWeight(6);
  rect(cardX, cardY, cardW, cardH, 28);

  if (images[s.image]) {
    imageMode(CORNER);
    tint(255, alphaVal); // 圖片淡入
    image(images[s.image], cardX + padding, cardY + padding, drawW, drawH);
    noFill();
    stroke(0,0,0,50*progress);
    strokeWeight(4);
    rect(cardX + padding, cardY + padding, drawW, drawH);
  }

  // 文字
  noStroke(); fill(80, alphaVal); textAlign(LEFT, TOP); textFont('Georgia'); textLeading(lineHeight);

  let textY = cardY + padding + drawH + 10;
  textSize(28); textStyle(ITALIC);
  text(s.name, cardX + padding, textY);
  textSize(20);
  text("Last seen: " + s.lastSeen, cardX + padding, textY + 32);
  textSize(18);
  text("Scientific name: " + s.scientificName, cardX + padding, textY + 60);
  text("Cause of Extinction:\n• " + s.causeOfExtinction.join("\n• "), cardX + padding, textY + 90, cardW - padding*2);
}