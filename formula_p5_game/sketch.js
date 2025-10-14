let WIDTH = 800;
let HEIGHT = 800;

let x = Math.floor(WIDTH * 0.5);
let y = Math.floor(WIDTH * 0.95);

let dx = 0;
let dy = 0;

let defaultMaxSpeed = WIDTH * 0.003;
let braking = false;

let accel = 0.3;
let maxSpeed = defaultMaxSpeed;
let fric = 0.95;

let maxSpeedBraking = defaultMaxSpeed / 2;
let brakeSpeed = 0.15;

let mousex = 0;

function setup() {
	createCanvas(WIDTH, HEIGHT);
}

function draw() {
	background("#82a152");

	// === Draw background path ===
	stroke("#ffffff");
	strokeWeight(30);

	let points = [
		createVector(Math.floor(WIDTH * 0.5), Math.floor(WIDTH * 0.95)),
		createVector(Math.floor(WIDTH * 0.95), Math.floor(WIDTH * 0.35)),
		createVector(Math.floor(WIDTH * 0.85), Math.floor(WIDTH * 0.25)),
		createVector(Math.floor(WIDTH * 0.5), Math.floor(WIDTH * 0.45)),
		createVector(Math.floor(WIDTH * 0.35), Math.floor(WIDTH * 0.525)),
		createVector(Math.floor(WIDTH * 0.15), Math.floor(WIDTH * 0.45)),
		createVector(Math.floor(WIDTH * 0.45), 110),
		createVector(Math.floor(WIDTH * 0.5), Math.floor(WIDTH * 0.05)),
		createVector(Math.floor(WIDTH * 0.05), Math.floor(WIDTH * 0.45)),
		createVector(Math.floor(WIDTH * 0.5), Math.floor(WIDTH * 0.95)),
		createVector(Math.floor(WIDTH * 0.95), Math.floor(WIDTH * 0.35)),
		createVector(Math.floor(WIDTH * 0.85), Math.floor(WIDTH * 0.25))
	];

	beginShape();
	noFill();
	for (let i = 0; i < points.length; i++) {
		curveVertex(points[i].x, points[i].y);
	}
	endShape();

	beginShape();
	noFill();
	stroke("#999999");
	strokeWeight(20);
	for (let i = 0; i < points.length; i++) {
		curveVertex(points[i].x, points[i].y);
	}
	endShape();

	// === Movement logic ===

	if (braking) {
		if (maxSpeed > maxSpeedBraking) {
			maxSpeed -= brakeSpeed;
		} else {
			maxSpeed = maxSpeedBraking;
		}
	} else {
		if (maxSpeed < defaultMaxSpeed) {
			maxSpeed += brakeSpeed;
		} else {
			maxSpeed = defaultMaxSpeed;
		}
	}

	dx *= fric;
	dy *= fric;

	let trackX = mouseX - x;
	let trackY = mouseY - y;

	let distToMouse = Math.sqrt(trackX * trackX + trackY * trackY);

	let dirX = 0;
	let dirY = 0;
	if (distToMouse > maxSpeed) {
		dirX = trackX / distToMouse;
		dirY = trackY / distToMouse;
	}

	dx += dirX * accel;
	dy += dirY * accel;

	let carSpeed = Math.sqrt(dx * dx + dy * dy);
	if (carSpeed > maxSpeed) {
		dx = (dx / carSpeed) * maxSpeed;
		dy = (dy / carSpeed) * maxSpeed;
	}

	x += dx;
	y += dy;

	let traceColor = color("red");
	traceColor.setAlpha(128);

	stroke(traceColor);
	strokeWeight(5);
	line(x, y, mouseX, mouseY);

	// Draw the moving point
	stroke("#000000");
	strokeWeight(14);
	point(x, y);
	
	stroke("#e8992a");
	strokeWeight(10);
	point(x, y);

	// Debug info
	noStroke();
	fill(255);
	text("INFO", 5, 15);
	text("maxSpeed: " + maxSpeed.toFixed(2), 5, 30);
	text("speed: " + mag(dx, dy).toFixed(2), 5, 45);
}

function mousePressed() {
	braking = true;
}

function mouseReleased() {
	braking = false;
}