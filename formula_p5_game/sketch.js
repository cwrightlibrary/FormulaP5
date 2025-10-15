let WIDTH = 800;
let HEIGHT = 800;

let x = Math.floor(WIDTH * 0.5);
let y = Math.floor(WIDTH * 0.95);

let dx = 0;
let dy = 0;

let defaultMaxSpeed = WIDTH * 0.005;
let braking = false;

let accel = 0.25;
let maxSpeed = defaultMaxSpeed;
let fric = 1;

let maxSpeedBraking = defaultMaxSpeed / 3;
let brakeSpeed = 0.05;

function setup() {
	createCanvas(WIDTH, HEIGHT);
}

function draw() {
	background("#82a152");
	cursor(CROSS);

	// === Track points ===
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

	// === Draw background path ===
	stroke("#ffffff");
	strokeWeight(60);
	beginShape();
	noFill();
	for (let i = 0; i < points.length; i++) {
		curveVertex(points[i].x, points[i].y);
	}
	endShape();

	beginShape();
	noFill();
	stroke("#999999");
	strokeWeight(50);
	for (let i = 0; i < points.length; i++) {
		curveVertex(points[i].x, points[i].y);
	}
	endShape();

	// === Movement logic ===
	if (braking) {
		maxSpeed = max(maxSpeed - brakeSpeed, maxSpeedBraking);
	} else {
		maxSpeed = min(maxSpeed + brakeSpeed, defaultMaxSpeed);
	}

	dx *= fric;
	dy *= fric;

	let trackX = mouseX - x;
	let trackY = mouseY - y;
	let distToMouse = sqrt(trackX * trackX + trackY * trackY);

	let dirX = 0;
	let dirY = 0;
	if (distToMouse > maxSpeed) {
		dirX = trackX / distToMouse;
		dirY = trackY / distToMouse;
	}

	dx += dirX * accel;
	dy += dirY * accel;

	let carSpeed = sqrt(dx * dx + dy * dy);
	if (carSpeed > maxSpeed) {
		dx = (dx / carSpeed) * maxSpeed;
		dy = (dy / carSpeed) * maxSpeed;
	}

	x += dx;
	y += dy;

	// === TRACK BOUNDARY CHECK ===
	let { closest, minDist } = getClosestPointOnCurve(points, 0.02);
	let trackHalfWidth = 25; // half of the road width

	if (minDist > trackHalfWidth) {
		let dirX = x - closest.x;
		let dirY = y - closest.y;
		let distFromEdge = sqrt(dirX * dirX + dirY * dirY);
		if (distFromEdge > 0) {
			dirX /= distFromEdge;
			dirY /= distFromEdge;
			x = closest.x + dirX * trackHalfWidth;
			y = closest.y + dirY * trackHalfWidth;
			dx *= 0.5;
			dy *= 0.5;
		}
	}

	// === Draw car marker and lines ===
	let frontLen = 15;
	let distx = mouseX - x;
	let disty = mouseY - y;

	if (distToMouse > 0) {
		let ux = distx / distToMouse;
		let uy = disty / distToMouse;

		let endX = x + ux * frontLen;
		let endY = y + uy * frontLen;

		let shortLen = 15;
		let perpX = -uy;
		let perpY = ux;

		let halfX = (perpX * shortLen) / 2;
		let halfY = (perpY * shortLen) / 2;

		stroke("#000000");
		strokeWeight(10);
		line(endX - halfX, endY - halfY, endX + halfX, endY + halfY);
		line(x - halfX, y - halfY, x + halfX, y + halfY);

		stroke("#000000");
		strokeWeight(14);
		line(x, y, endX, endY);

		stroke("#e8992a");
		strokeWeight(10);
		line(x, y, endX, endY);
	}

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
	text("speed: " + sqrt(dx * dx + dy * dy).toFixed(2), 5, 45);
}

function mousePressed() {
	braking = true;
}

function mouseReleased() {
	braking = false;
}

// --- Helper function to find closest point on curve ---
function getClosestPointOnCurve(points, tStep = 0.01) {
	let closest = createVector(0, 0);
	let minDist = Infinity;
	let tCount = points.length - 3;
	for (let i = 0; i < tCount; i++) {
		for (let t = 0; t <= 1; t += tStep) {
			let cx = curvePoint(points[i].x, points[i + 1].x, points[i + 2].x, points[i + 3].x, t);
			let cy = curvePoint(points[i].y, points[i + 1].y, points[i + 2].y, points[i + 3].y, t);
			let d = dist(x, y, cx, cy);
			if (d < minDist) {
				minDist = d;
				closest.set(cx, cy);
			}
		}
	}
	return { closest, minDist };
}
