let playerX, playerY;
let cars = [];
let greenCars = [];

let deathCount = 0;
let deathTimer = 0;
let signalRed = false;
let wasOnCrosswalk = false;
let trafficActive = false;

// 緑色のエリアに関する変数
let greenCarActive = false;
let reachedTop = false;
let crossedFromBottom = false;
let previousY = 500;

const roadTop = 180;
const roadBottom = 420;
const crossLeft = 280;
const crossRight = 420;

function setup() {
  createCanvas(700, 600);

  playerX = 350;
  playerY = 500;

  // 横断歩道を走る車を100台作る
  for (let i = 0; i < 100; i++) {
    let direction = i % 2 === 0 ? 1 : -1;

    cars.push({
      x: 0,
      y: 205 + (i % 4) * 55,
      speed: random(100, 135),
      direction: direction,
      col: color(
        random(80, 255),
        random(80, 255),
        random(80, 255)
      )
    });
  }

  // 緑色のエリアを走る車を100台作る
  for (let i = 0; i < 100; i++) {
    greenCars.push({
      x: 0,
      y: 10 + (i % 2) * 50,
      speed: random(100, 135),
      direction: 1,
      col: color(
        random(80, 255),
        random(80, 255),
        random(80, 255)
      )
    });
  }

  resetCars();
  resetGreenCars();
  textFont("sans-serif");
}

function draw() {
  background(125, 180, 125);

  // 人をカーソルで動かす
  playerX = constrain(mouseX, 15, width - 15);
  playerY = constrain(mouseY, 15, height - 15);

  // 横断歩道の中にいるか
  let onCrosswalk =
    playerX > crossLeft &&
    playerX < crossRight &&
    playerY >= roadTop &&
    playerY <= roadBottom;

  // 横断歩道に近づいたか
  let nearCrosswalk =
    playerX > crossLeft - 45 &&
    playerX < crossRight + 45 &&
    playerY > roadBottom &&
    playerY < roadBottom + 100;

  // 上側の歩道にいるか
  let onTopSidewalk =
    playerY >= 110 &&
    playerY < roadTop;

  // 緑色のエリアにいるか
  let onGreenArea = playerY < 110;

  // 横断歩道に進入した瞬間
  if (onCrosswalk && !wasOnCrosswalk) {
    resetCars();
    trafficActive = true;

    // 下側から進入したか確認
    crossedFromBottom = previousY > roadBottom;
  }

  // 横断歩道を渡り切った瞬間
  if (
    wasOnCrosswalk &&
    playerY < roadTop &&
    playerX > crossLeft &&
    playerX < crossRight &&
    crossedFromBottom
  ) {
    if (!reachedTop) {
      resetGreenCars();
    }

    reachedTop = true;
  }

  // 緑色のエリアに入ると車が発進
  greenCarActive = reachedTop && onGreenArea;

  // 横断歩道から出たら車は停止
  if (!onCrosswalk) {
    trafficActive = false;
  }

  // 緑色のエリアでも赤信号
  signalRed = onCrosswalk || greenCarActive;

  // 道路と横断歩道
  drawRoad();
  drawCrosswalk();

  // 横断歩道の車を動かす
  if (trafficActive) {
    for (let car of cars) {
      car.x += car.speed * car.direction;

      // 画面外に出たら再登場
      if (
        car.direction === 1 &&
        car.x > width + 100
      ) {
        car.x = -random(100, 500);
      }

      if (
        car.direction === -1 &&
        car.x < -100
      ) {
        car.x = width + random(100, 500);
      }

      drawCar(car);
    }
  }

  // 緑色のエリアの車を動かす
  if (greenCarActive) {
    for (let car of greenCars) {
      car.x += car.speed;

      // 画面外に出たら再登場
      if (car.x > width + 100) {
        car.x = -random(100, 500);
      }

      drawCar(car);
    }
  }

  // 信号機の表情
  drawSignal(
    nearCrosswalk ||
    onCrosswalk ||
    greenCarActive
  );

  // デス数をカウント
  if (greenCarActive) {

    // 緑色のエリア：毎秒100回
    deathTimer += deltaTime;

    while (deathTimer >= 10) {
      deathCount++;
      deathTimer -= 10;
    }

  } else if (onCrosswalk && trafficActive) {

    // 横断歩道：毎秒20回
    deathTimer += deltaTime;

    while (deathTimer >= 50) {
      deathCount++;
      deathTimer -= 50;
    }

  } else {
    deathTimer = 0;
  }

  // 人と画面表示
  drawPlayer(playerX, playerY);
  drawUI(nearCrosswalk);

  // 前の位置を記録
  previousY = playerY;
  wasOnCrosswalk = onCrosswalk;
}

// 横断歩道の車の初期位置
function resetCars() {
  for (let i = 0; i < cars.length; i++) {
    let car = cars[i];
    let order = floor(i / 2);

    car.x = car.direction === 1
      ? -100 - order * 110
      : width + order * 110;
  }
}

// 緑色のエリアの車の初期位置
function resetGreenCars() {
  for (let i = 0; i < greenCars.length; i++) {
    greenCars[i].x = -100 - floor(i / 2) * 110;
  }
}

// 道路
function drawRoad() {
  noStroke();

  // 上側と下側の歩道
  fill(190);
  rect(0, 110, width, 70);
  rect(0, roadBottom, width, 180);

  // 車道
  fill(65);
  rect(0, roadTop, width, roadBottom - roadTop);

  // 道路の中央線
  stroke(255, 220, 0);
  strokeWeight(3);

  for (let x = 0; x < width; x += 70) {
    line(x, 300, x + 35, 300);
  }

  // 境界線
  stroke(255, 50, 50);
  strokeWeight(3);
  line(crossLeft, roadBottom, crossRight, roadBottom);
}

// 横断歩道
function drawCrosswalk() {
  noStroke();
  fill(255);

  for (let y = roadTop + 10; y < roadBottom; y += 40) {
    rect(crossLeft, y, crossRight - crossLeft, 25);
  }
}

// 顔つき信号機
function drawSignal(isEvil) {
  stroke(30);
  strokeWeight(6);
  line(490, 110, 490, 180);

  fill(35);
  rect(450, 65, 80, 110, 12);

  noStroke();

  // 赤信号
  fill(signalRed ? color(255, 30, 30) : color(80, 0, 0));
  ellipse(490, 92, 45, 40);

  // 青信号
  fill(signalRed ? color(0, 50, 20) : color(0, 255, 100));
  ellipse(490, 145, 45, 40);

  // 目が人を追いかける
  let eyeX = map(playerX, 0, width, -4, 4);
  let eyeY = map(playerY, 0, height, -3, 3);

  eyeX = constrain(eyeX, -4, 4);
  eyeY = constrain(eyeY, -3, 3);

  if (isEvil) {

    // 意地悪な目
    stroke(0);
    strokeWeight(2);
    line(475, 82, 484, 87);
    line(505, 82, 496, 87);

    noStroke();
    fill(0);
    ellipse(482 + eyeX, 92 + eyeY, 4, 4);
    ellipse(498 + eyeX, 92 + eyeY, 4, 4);

    // ニヤッと笑う口
    noFill();
    stroke(0);
    strokeWeight(2.5);
    arc(490, 99, 25, 16, 0, PI);

  } else {

    // 普通の顔
    noStroke();
    fill(0);

    ellipse(482 + eyeX, 141 + eyeY, 5, 5);
    ellipse(498 + eyeX, 141 + eyeY, 5, 5);

    stroke(0);
    strokeWeight(2);
    noFill();
    arc(490, 149, 18, 9, 0, PI);
  }
}

// 車
function drawCar(car) {
  push();
  translate(car.x, car.y);

  if (car.direction === -1) {
    scale(-1, 1);
  }

  noStroke();
  fill(car.col);
  rect(0, 0, 75, 32, 7);

  // 窓
  fill(170, 220, 255);
  rect(15, 4, 35, 18, 4);

  // タイヤ
  fill(20);
  ellipse(15, 32, 16, 16);
  ellipse(60, 32, 16, 16);

  // ヘッドライト
  fill(255, 255, 100);
  rect(70, 7, 5, 9);

  pop();
}

// 人
function drawPlayer(x, y) {
  push();
  translate(x, y);

  stroke(0);
  strokeWeight(4);

  fill(255, 210, 160);
  ellipse(0, -25, 20, 20);

  line(0, -15, 0, 10);
  line(0, -5, -13, 5);
  line(0, -5, 13, 5);
  line(0, 10, -10, 25);
  line(0, 10, 10, 25);

  pop();
}

// 画面表示
function drawUI(nearCrosswalk) {
  textAlign(CENTER);
  stroke(0);
  strokeWeight(3);
  fill(255);
  textSize(26);
  text("意地悪な信号機", width / 2, 40);

  noStroke();
  textSize(18);

  if (greenCarActive) {
    fill(255, 0, 0);
    text("渡り切ったと思った？", width / 2, 90);

  } else if (signalRed) {
    fill(255, 40, 40);
    text("ませない！", width / 2, 90);

  } else if (nearCrosswalk) {
    fill(150, 40, 40);
    text("ぐふふ..そのまま進..", width / 2, 90);

  } else {
    fill(0, 110, 0);
    text("今なら渡れるよ！", width / 2, 90);
  }

  // デス数
  fill(0);
  rect(15, 545, 190, 45, 8);

  fill(255, 70, 70);
  textAlign(LEFT);
  textSize(22);
  text("デス数: " + deathCount, 25, 575);
}

