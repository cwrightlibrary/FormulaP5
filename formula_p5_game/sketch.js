const CONFIG = {
	width: 800,
	height: 800,
	track: {
		outerWidth: 60,
		innerWidth: 50,
		halfWidth: 25,
		outerColor: "#ffffff",
		innerColor: "#999999"
	},
	car: {
		accel: 0.25,
		maxSpeed: 4, // 800 * 0.005
		friction: 1,
		brakeSpeed: 0.05,
		brakingMaxSpeed: 1.33, // maxSpeed / 3
		frontLen: 15,
		sideLen: 15,
		color: "#e8992a",
		outlineColor: "#000000"
	},
	bg: "#82a152"
};

class Track {
	constructor(points, density = 0.02) {
		this.controlPoints = points;
		this.density = density;
		this.precomputedPoints = [];
		this.precompute();
	}

	precompute() {
		this.precomputedPoints = [];
		const segmentCount = this.controlPoints.length - 3;

		for (let i = 0; i < segmentCount; i++) {
			for (let t = 0; t <= 1; t += this.density) {
				const x = curvePoint(
					this.controlPoints[i].x,
					this.controlPoints[i + 1].x,
					this.controlPoints[i + 2].x,
					this.controlPoints[i + 3].x,
					t
				);
				const y = curvePoint(
					this.controlPoints[i].y,
					this.controlPoints[i + 1].y,
					this.controlPoints[i + 2].y,
					this.controlPoints[i + 3].y,
					t
				);
				this.precomputedPoints.push(createVector(x, y));
			}
		}
	}

	getClosestPoint(x, y) {
		let closest = this.precomputedPoints[0];
		let minDist = dist(x, y, closest.x, closest.y);

		for (const point of this.precomputedPoints) {
			const d = dist(x, y, point.x, point.y);
			if (d < minDist) {
				minDist = d;
				closest = point;
			}
		}

		return { point: closest, distance: minDist };
	}

	draw() {
		// Outer track
		stroke(CONFIG.track.outerColor);
		strokeWeight(CONFIG.track.outerWidth);
		this.drawCurve();

		// Inner track
		stroke(CONFIG.track.innerColor);
		strokeWeight(CONFIG.track.innerWidth);
		this.drawCurve();
	}

	drawCurve() {
		beginShape();
		noFill();
		for (const point of this.controlPoints) {
			curveVertex(point.x, point.y);
		}
		endShape();
	}
}

class Car {
	constructor(x, y) {
		this.pos = createVector(x, y);
		this.vel = createVector(0, 0);
		this.braking = false;
		this.maxSpeed = CONFIG.car.maxSpeed;
	}

	update(targetX, targetY) {
		this.updateMaxSpeed();
		this.applyFriction();
		this.moveTowards(targetX, targetY);
		this.limitSpeed();
		this.pos.add(this.vel);
	}

	updateMaxSpeed() {
		if (this.braking) {
			this.maxSpeed = max(
				this.maxSpeed - CONFIG.car.brakeSpeed,
				CONFIG.car.brakingMaxSpeed
			);
		} else {
			this.maxSpeed = min(
				this.maxSpeed + CONFIG.car.brakeSpeed,
				CONFIG.car.maxSpeed
			);
		}
	}

	applyFriction() {
		this.vel.mult(CONFIG.car.friction);
	}

	moveTowards(targetX, targetY) {
		const toTarget = createVector(targetX - this.pos.x, targetY - this.pos.y);
		const distance = toTarget.mag();

		if (distance > this.maxSpeed) {
			toTarget.normalize();
			toTarget.mult(CONFIG.car.accel);
			this.vel.add(toTarget);
		}
	}

	limitSpeed() {
		const speed = this.vel.mag();
		if (speed > this.maxSpeed) {
			this.vel.setMag(this.maxSpeed);
		}
	}

	constrainToTrack(track) {
		const { point: closest, distance } = track.getClosestPoint(this.pos.x, this.pos.y);

		if (distance > CONFIG.track.halfWidth) {
			const fromEdge = p5.Vector.sub(this.pos, closest);
			fromEdge.setMag(CONFIG.track.halfWidth);

			this.pos = p5.Vector.add(closest, fromEdge);

			// Collision triggers braking
			this.setBraking(true);

			// Optional: further reduce velocity on impact
			this.vel.mult(0.5);
		} else {
			// Not touching wall, release braking if mouse isn't pressed
			// Only if you want braking to come from wall or manual input
			if (!mouseIsPressed) this.setBraking(false);
		}
	}


	draw(targetX, targetY) {
		const toTarget = createVector(targetX - this.pos.x, targetY - this.pos.y);
		const distance = toTarget.mag();

		if (distance > 0) {
			toTarget.normalize();
			this.drawBody(toTarget);
		}

		this.drawCenter();
	}

	drawBody(direction) {
		const front = p5.Vector.mult(direction, CONFIG.car.frontLen).add(this.pos);
		const perp = createVector(-direction.y, direction.x);
		const half = p5.Vector.mult(perp, CONFIG.car.sideLen / 2);

		// Draw front and back bars
		stroke(CONFIG.car.outlineColor);
		strokeWeight(10);
		line(front.x - half.x, front.y - half.y, front.x + half.x, front.y + half.y);
		line(this.pos.x - half.x, this.pos.y - half.y, this.pos.x + half.x, this.pos.y + half.y);

		// Draw center line
		strokeWeight(14);
		line(this.pos.x, this.pos.y, front.x, front.y);

		stroke(CONFIG.car.color);
		strokeWeight(10);
		line(this.pos.x, this.pos.y, front.x, front.y);
	}

	drawCenter() {
		stroke(CONFIG.car.outlineColor);
		strokeWeight(14);
		point(this.pos.x, this.pos.y);

		stroke(CONFIG.car.color);
		strokeWeight(10);
		point(this.pos.x, this.pos.y);
	}

	setBraking(isBraking) {
		this.braking = isBraking;
	}

	getSpeed() {
		return this.vel.mag();
	}
}

class DebugUI {
	static draw(car) {
		noStroke();
		fill(255);
		text("INFO", 5, 15);
		text(`maxSpeed: ${car.maxSpeed.toFixed(2)}`, 5, 30);
		text(`speed: ${car.getSpeed().toFixed(2)}`, 5, 45);
	}
}

// Game state
let track;
let car;

function setup() {
	createCanvas(CONFIG.width, CONFIG.height);

	const points = [
		createVector(CONFIG.width * 0.5, CONFIG.width * 0.95),
		createVector(CONFIG.width * 0.95, CONFIG.width * 0.35),
		createVector(CONFIG.width * 0.85, CONFIG.width * 0.25),
		createVector(CONFIG.width * 0.5, CONFIG.width * 0.45),
		createVector(CONFIG.width * 0.35, CONFIG.width * 0.525),
		createVector(CONFIG.width * 0.15, CONFIG.width * 0.45),
		createVector(CONFIG.width * 0.45, 110),
		createVector(CONFIG.width * 0.5, CONFIG.width * 0.05),
		createVector(CONFIG.width * 0.05, CONFIG.width * 0.45),
		createVector(CONFIG.width * 0.5, CONFIG.width * 0.95),
		createVector(CONFIG.width * 0.95, CONFIG.width * 0.35),
		createVector(CONFIG.width * 0.85, CONFIG.width * 0.25)
	];

	track = new Track(points);
	car = new Car(CONFIG.width * 0.5, CONFIG.width * 0.95);
}

function draw() {
	background(CONFIG.bg);
	cursor(CROSS);

	track.draw();

	car.update(mouseX, mouseY);
	car.constrainToTrack(track);
	car.draw(mouseX, mouseY);

	DebugUI.draw(car);
}

function mousePressed() {
	car.setBraking(true);
}

function mouseReleased() {
	car.setBraking(false);
}