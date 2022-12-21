import { Point, Vector } from "ts-2d-geometry";
import * as _ from "lodash";
import opentype from 'opentype.js'
import fontface from "../../resources/Retro Bones.ttf";
import heart from "../../resources/heart.svg";
import ant from "../../resources/ant.svg";
import axios from "axios";

//TODO maximum ant density on letters (extra ants circle border?)
//TODO mouse drops more ants

const mksvg = (path) => `<?xml version="1.0" encoding="utf-8"?><svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 500 500" xml:space="preserve">
<g>${path}</g></svg>`;

const message = ["I",heart,"Jeri"];

const MAX_TURN_RATE = .035;
const TURN_SPEED = .003;
const MIN_SPEED = .03;
const MAX_SPEED = .7;
const MAX_SCALE = 10;
const MARCHING_SPEED = .15;
const SLOW_THRESHOLD = 25;
const DEBUG = false;
const MAX_ANTS = 200;
const MIN_ANT_SPACING = 15;
const ROTATION_DELAY = 5*1000;
const ANT_SIZE = new Vector(6,9);

const sprite = new Image();
sprite.src = ant;


const submitMessage = () => {
	const text = $custom.val();
	window.game.setMessage(_.map(text.split(" "),s => s === "<3" ? heart : s));
	$custom.val("");
}
const $custom = $("#custom");
$("#go").on("click",submitMessage);
$("#custom").on("keypress",(e) => {e.keyCode === 13 && submitMessage()});

const drawImageRotated = (ctx,img,x,y,width,height,angleInRadians) => {
	ctx.translate(x, y);
	ctx.rotate(angleInRadians);
	ctx.drawImage(img, -width / 2, -height / 2, width, height);
	ctx.rotate(-angleInRadians);
	ctx.translate(-x, -y);
}

const angleDifference = (a1, a2) => {
	const diff = (( a2 - a1 + Math.PI ) % (2*Math.PI)) - Math.PI;
	return diff < -Math.PI ? diff + (2*Math.PI) : diff;
}

class Extents {
	constructor(topLeft,bottomRight) {
    this.topLeft = topLeft;
		this.bottomRight = bottomRight;
	}

	static fromCoords(x,y,x1,y1) {
		return new Extents(new Point(x,y),new Point(x1,y1));
	}

	static fromPoints(p1,p2) {
		return new Extents(p1,p2);
	}

	static fromPoint(point) {
		return new Extents(point,point);
	}

	static fromExtents(e1, e2) {
		return new Extents(
			new Point(Math.min(e1.topLeft.x,e2.topLeft.x),Math.min(e1.topLeft.y,e2.topLeft.y)),
			new Point(Math.max(e1.bottomRight.x,e2.bottomRight.x),Math.max(e1.bottomRight.y,e2.bottomRight.y)),
		)
	}

	topLeftPoint() { return this.topLeft; }
	topRightPoint() { return new Point(this.bottomRight.x,this.topLeft.y); }
	bottomRightPoint() { return this.bottomRight; }
	bottomLeftPoint() { return new Point(this.topLeft.x,this.bottomRight.y); }

	atOrigin() {
		return Extents.fromPoints(new Point(0,0),this.size().asPoint());
	}

	inset(x,y) {
		return Extents.fromPoints(this.topLeft.plus(new Vector(x,y)),this.bottomRight.minus(new Vector(x,y)).asPoint());
	}

	offset(offset) {
		return Extents.fromPoints(this.topLeft.plus(offset),this.bottomRight.plus(offset));
	}

	scale(factor) {
		return Extents.fromPoints(this.topLeft,this.bottomRight.plus(this.size().scale(factor-1)));
	}

	plusExtent(otherExtent) {
		return Extents.fromExtents(this,otherExtent);
	}

	plusPoint(point) {
		return Extents.fromExtents(this,Extents.fromPoint(point));
	}

	centerWithin(extents) {
		const mySize = this.size()
		const extentsSize = extents.size();

		const dx = extentsSize.x - mySize.x;
		const dy = extentsSize.y - mySize.y;

		const padding = new Vector(dx/2,dy/2);
		const offset = extents.topLeft.minus(this.topLeft).plus(padding);
		return offset;
	}


	getTransformTo(extents) {
		const from = this.size();
		const to = extents.size();

		const dx = to.x / from.x;
		const dy = to.y / from.y;

		const factor = Math.min(dx,dy);
		const offset = extents.topLeft.minus(this.topLeft).scale(factor);
		return {offset,factor};
	}

	size() {
		return this.bottomRight.minus(this.topLeft);
	}

	render(ctx) {
		ctx.beginPath();
		ctx.rect(this.topLeft.x,this.topLeft.y,this.size().x,this.size().y);
		ctx.stroke();
	}
}

class Ant {
	static createRandomAnt(width,height) {
		return new Ant(
			Math.random()*width,
			Math.random()*height,
			Math.random()*2*Math.PI,
		);
	}

	constructor(x, y, direction) {
		this.pos = new Point(x,y);
		this.dest = undefined;
		this.direction = direction;
		this.dtheta = .05;
	}

	render(ctx) {
		drawImageRotated(ctx,sprite,this.pos.x,this.pos.y,ANT_SIZE.x,ANT_SIZE.y,this.direction+Math.PI/2);

		if (DEBUG) {
		ctx.strokeStyle = "#000";
			const headLength = 3;
			const tailLength = 5;
			const dir = new Vector(Math.cos(this.direction),Math.sin(this.direction));
			const head = this.pos.plus(dir.scale(headLength));
			const tail = this.pos.plus(dir.scale(-tailLength));

			ctx.fillStyle = "#000";
			ctx.fillRect(head.x,head.y,3,3);

			ctx.strokeStyle = "#000";
			ctx.beginPath();
			ctx.moveTo(tail.x, tail.y);
			ctx.lineTo(head.x, head.y);
			ctx.stroke();

			ctx.fillStyle = "#000";
			ctx.fillRect(this.pos.x,this.pos.y,2,2);

			ctx.strokeStyle = "#00f";
			ctx.beginPath();
			ctx.moveTo(this.pos.x, this.pos.y);
			ctx.lineTo(this.pos.x + 10 * Math.cos(this.direction), this.pos.y + 10 * Math.sin(this.direction));
			ctx.stroke();

			ctx.beginPath();
			ctx.strokeStyle = "#f00";
			const offset = 10;
			ctx.moveTo(this.pos.x, this.pos.y);
			ctx.lineTo(this.pos.x + headLength * Math.cos(this.direction + offset*this.dtheta), this.pos.y + headLength * Math.sin(this.direction + offset*this.dtheta));
			ctx.stroke();

			if (this.dest) {
				ctx.fillStyle = "#f00";
				ctx.fillRect(this.dest.x,this.dest.y,2,2);

				const destinationBearing = Math.atan2(this.dest.y - this.pos.y, this.dest.x - this.pos.x);
				ctx.beginPath();
				ctx.strokeStyle = "#0f0";
				const offset = 10;
				ctx.moveTo(this.pos.x, this.pos.y);
				ctx.lineTo(this.pos.x + headLength * Math.cos(destinationBearing), this.pos.y + headLength * Math.sin(destinationBearing));
				ctx.stroke();
			}
		}
	}

	tick() {
		let speed = MAX_SPEED;
		const d = this.dest && Math.sqrt(this.pos.distanceSquare(this.dest));
		if (this.dest) {
			const destinationBearing = Math.atan2(this.dest.y - this.pos.y, this.dest.x - this.pos.x);
			let delta = angleDifference(this.direction,destinationBearing);
			this.dtheta = this.dtheta + (delta < 0 ? -TURN_SPEED : TURN_SPEED)
			// if (Math.abs(delta) < this.dtheta) this.dtheta = delta;

			if (d < SLOW_THRESHOLD) {
				speed = MIN_SPEED + (MAX_SPEED - MIN_SPEED)*(1 - (SLOW_THRESHOLD - d) / SLOW_THRESHOLD);
			}
			// if (DEBUG) console.log(nf(destinationBearing),nf(delta)); //,nf(100 * (speed / MAX_SPEED)));
		}
		this.pos.x = this.pos.x + speed * Math.cos(this.direction);
		this.pos.y = this.pos.y + speed * Math.sin(this.direction);
		this.dtheta = Math.min(this.dtheta,MAX_TURN_RATE);
		this.dtheta = Math.max(this.dtheta,-MAX_TURN_RATE);
		this.direction = this.direction + this.dtheta;
		this.direction = this.direction % (2 * Math.PI)
	}

	distanceToDestination() {
		if (!this.dest) return 0;
		return Math.sqrt(this.pos.distanceSquare(this.dest));
	}

	setDestination(x, y) {
		this.dest = new Point(x,y);
	}
}

function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}

class Shape {
	constructor() {
		this.points = [];
		this.factor = 1;
		this.closed = false;
	}

	static fromTuples(tuples) {
		const s = new Shape();

		for (const tup of tuples) {
			const [x,y] = tup;
			s.points.push(new Point(x,y));
		}

		s.closed = false;

		return s;
	}

	static fromSvgPath(svgPath) {
		const s = new Shape();

		const avgLength = 2;
		for (var l=0; l<=svgPath.getTotalLength(); l+= avgLength) {
			// const percent = 100 * (l / svgPath.getTotalLength());
			const {x,y} = svgPath.getPointAtLength(l);
			s.points.push(new Point(x,y));
		}
		s.closed = true;

		return s;
	}

	static fromExtents(extents) {
		const s = new Shape();
		s.points.push(extents.topLeftPoint());
		s.points.push(extents.topRightPoint());
		s.points.push(extents.bottomRightPoint());
		s.points.push(extents.bottomLeftPoint());
		s.closed = true;

		return s;
	}

	clone() {
		const shape = new Shape();
		Object.assign(shape,this);
		return shape;
	}

	extents() {
		let accumulated = null;
		for (const point of this.points) {
			if (!accumulated) accumulated = Extents.fromPoint(point);

			accumulated = accumulated.plusPoint(point);
		}
		return accumulated;
	}

	getPositionAtPercent(percent) {
		const totalLength = this.calculateTotalLength();
		let lengthToPosition = totalLength * (percent / 100);
		let lastPoint = null;
		for (const point of [...this.points,this.points[0]]) {
			if (lastPoint) {
				const segmentLength = Math.sqrt(lastPoint.distanceSquare(point));
				if (lengthToPosition < segmentLength) {
					const vec = point.minus(lastPoint).normed();
					// console.log(lastPoint.x,vec.x,multiplier);
					// console.log("returning",{x: lastPoint.x + vec.x * multiplier, y: lastPoint.y + vec.y * multiplier});
					return {x: lastPoint.x + vec.x * lengthToPosition, y: lastPoint.y + vec.y * lengthToPosition};
				}
				lengthToPosition -= segmentLength;
			}
			lastPoint = point;
		}
		throw new Error("ERROR TOO LONG");
	}

	calculateTotalLength() {
		let length = 0;
		let lastPoint = null;
		for (const point of this.points) {
			if (lastPoint) {
				length += Math.sqrt(lastPoint.distanceSquare(point));
			}
			lastPoint = point;
		}
		length += Math.sqrt(lastPoint.distanceSquare(this.points[0]));
		return length;
		// return this.factor * this.svgPath.getTotalLength();
	}

	scale(factor) {
		this.factor *= factor;
		for (const point of this.points) {
			point.x = point.x * factor;
			point.y = point.y * factor;
		}
	}

	offset(vector) {
		for (const point of this.points) {
			point.x = point.x + vector.x;
			point.y = point.y + vector.y;
		}
	}

	render(ctx) {
		ctx.beginPath();
		ctx.strokeStyle = "#999";
		const [startX, startY] = [this.points[0].x,this.points[0].y];
		ctx.moveTo(startX,startY);
		ctx.stroke();
		for (const point of this.points) {
			ctx.lineTo(point.x,point.y);
		}
		ctx.lineTo(startX,startY);
		ctx.stroke();
		ctx.fillStyle = "#999";
		for (const point of this.points) {
			ctx.fillRect(point.x,point.y,2,2);
		}
	}
}

class Shapes {
	constructor() {
		this.shapes = [];
	}

	static fromTuples(tuples) {
		const shapes = new Shapes();
		let s = null;

		for (const tup of tuples) {
			if (tup === null) {
				if (s.points.length) shapes.shapes.push(s);
				s = null;
				continue;
			}

			if (s === null) {
				s = new Shape();
				s.closed = false;
			}
			const [x,y] = tup;
			s.points.push(new Point(x,y));
		}

		return shapes;
	}

	static async fromSvg(url) {
		const shapes = new Shapes();
		const parser = new DOMParser();
		const {data} = await axios.get(url);
		const doc = parser.parseFromString(data, "image/svg+xml");
		const svgPaths = doc.getElementsByTagName("path");
		for (const svgPath of svgPaths) {
			const shape = Shape.fromSvgPath(svgPath)
			shapes.shapes.push(shape);
		}
		return shapes;
	}

	static async fromText(text) {
		const font = await opentype.load(fontface);
		const path = font.getPath(text, 0, 80, 72);
		const paths = createSimplePaths(path);
		const svgs = _.map(paths,p => p.toSVG());
		const parser = new DOMParser();
		const doc = parser.parseFromString(mksvg(svgs.join()), "image/svg+xml");
		const svgPaths = doc.getElementsByTagName("path");
		
		const shapes = new Shapes();
		for (const svgPath of svgPaths) {
			const shape = Shape.fromSvgPath(svgPath);
			shapes.shapes.push(shape);
		}

		return shapes;
	}

	totalPoints() {
		return _.sum(_.map(this.shapes,s => s.points.length));
	}

	totalLength() {
		return _.sum(_.map(this.shapes,s => s.getTotalLength()));
	}

	extents() {
		return _.reduce(this.shapes,(prev, curr) => prev ? prev.plusExtent(curr.extents()) : curr.extents(), null);
	}

	fitTo(extents,maxScale) {
		const shapes = this.clone();
		const currentExtents = shapes.extents();
		let {offset,factor} = currentExtents.getTransformTo(extents);
		if (maxScale) factor = Math.min(factor,maxScale);
		const centeringOffset = currentExtents.atOrigin().scale(factor).centerWithin(extents);
		for (const shape of shapes.shapes) {
			shape.offset(currentExtents.topLeft.asVector().reverse());
			shape.scale(factor);
			shape.offset(centeringOffset);
		}
		return shapes;
	}

	clone() {
		const shapes = new Shapes();
		shapes.shapes = _.map(this.shapes,s => s.clone());
		return shapes;
	}

	pointWithIndex(idx) {
		for (const shape of this.shapes) {
			const total = shape.points.length;
			if (idx <= total-1) return shape.points[idx];
			idx -= total;
		}
	}

	shapeWithIndex(idx) {
		for (const shape of this.shapes) {
			const total = shape.points.length;
			if (idx <= total-1) return shape;
			idx -= total;
		}
	}

	getPointWeightedPositionAtPercent(percent) {
		const portion = percent / 100;
		const point = Math.round(this.totalPoints() * portion);
		const remain = portion - (point / this.totalPoints())
		const portionToNext =  remain / (((point+1) / this.totalPoints()) - (point/this.totalPoints()));

		const first = this.pointWithIndex(point);
		if (this.shapeWithIndex(point) != this.shapeWithIndex(point+1)) return first;
		const second = this.pointWithIndex(point+1);
		if (point <= 0) return _.first(_.first(this.shapes).points);
		if (point+1 >= this.totalPoints()-1) return _.last(_.last(this.shapes).points);
		return first.plus(second.minus(first).scale(portionToNext));
	}

	getShapeAtPercent(percent) {
		const portion = percent / 100;
		const point = Math.round(this.totalPoints() * portion);

		let idx = point;
		for (const shape of this.shapes) {
			const total = shape.points.length;
			if (idx <= total) return shape;
			idx -= total;
		}

		return null;
	}

	render(ctx) {
		for (const s of this.shapes) {
			s.render(ctx);
		}
	}
}

const createSimplePaths = (path) => {
	let activePath = null
	let paths = [];
	for (const cmd of path.commands) {
		if (cmd.type === "M" && activePath && activePath.commands.length > 0) {
			paths.push(activePath);
			activePath = null;
		}
		if (!activePath) activePath = new opentype.Path();

		activePath.commands.push(cmd);
	}
	if (activePath) paths.push(activePath);
	return paths;
}


export default class Game {
	constructor() {
		this.ants = [];
		this.shapes = null;
		this.ticks = 0;
		this.keysHeld = {};
		this.t = null;

		this.canvas = document.getElementById('canvas');
		this.sizeToParent();
		this.canvas.addEventListener("mousemove",e => this.mouseMove(e));
		window.addEventListener("keydown",e => this.keyDown(e));
		window.addEventListener("keyup",e => this.keyUp(e));
		window.addEventListener("resize",e => setTimeout(() => {
			this.sizeToParent();
			this.load(this.message[this.messageIndex]);
		},500));
		this.ctx = this.canvas.getContext("2d");
		for (let i=0; i<MAX_ANTS; i++) {
			const ant = Ant.createRandomAnt(this.width, this.height)
			this.ants.push(ant);
		}

		this.setMessage(message);
		window.game = this;
		window.canvas = this.canvas;
	}

	sizeToParent() {
		const $el = $(this.canvas);
		const parent = this.canvas.parentNode;
		$el.detach();
    const styles = getComputedStyle(parent);
    const w = parseInt(styles.getPropertyValue("width"), 10);
    const h = parseInt(styles.getPropertyValue("height"), 10);

		this.canvas.width = w;
		this.canvas.height = h;
		this.width = w;
		this.height = h;
		$(parent).append($el);
		console.log("sizeToParent",{w,h});
	}

	setMessage(message) {
		this.message = message;
		this.messageIndex = 0;
		this.load(_.first(this.message));
	}

	nextShape() {
		this.messageIndex++;
		this.stableTime = null;
		if (this.messageIndex >= this.message.length) this.messageIndex = 0;
		this.load(this.message[this.messageIndex]);
	}

	async load(svgOrText) {
		console.log({svgOrText});
		const windowExtents = Extents.fromCoords(0,0,this.width,this.height).inset(20,20)
		if (svgOrText.endsWith(".svg")) {
			this.shapes = await Shapes.fromSvg(svgOrText);
			this.shapes.fitTo(windowExtents);
		} else {
			this.shapes = await Shapes.fromText(svgOrText);
			this.shapes.fitTo(windowExtents,MAX_SCALE);
		}
	}

	mouseMove(e) {
		// const {x,y} = getMousePos(this.canvas,e);
		// for (const ant of this.ants) {
		// 	ant.setDestination(x,y);
		// }
	}

	keyDown(e) {
		this.keysHeld[e.keyCode] = true;
		if (e.keyCode === 32) this.nextShape();
	}
	keyUp(e) {
		this.keysHeld[e.keyCode] = false;
	}

	followShape() {
		if (!this.shapes || this.shapes.shapes.length === 0) return;
		const shapeLengths = _.map(this.shapes.shapes,s => s.calculateTotalLength());
		const totalLength = _.sum(shapeLengths);
		const antCount = Math.min(Math.round(totalLength / MIN_ANT_SPACING),this.ants.length);
		const endingLengths = _.reduce(shapeLengths,(acc,v) => [...acc,(_.last(acc) || 0) + v],[]);
		for (var i=0; i<antCount; i++) {
			const antGlobalOffset = i * (totalLength / antCount);
			let shapeIndex = _.findLastIndex(endingLengths,l => l <= antGlobalOffset) + 1;
			const shape = this.shapes.shapes[shapeIndex];
			const shapeOffset = shapeIndex === 0 ? 0 : endingLengths[shapeIndex-1]
			const antShapeOffset = antGlobalOffset - shapeOffset;
			const shapeLength = shapeLengths[shapeIndex];
			const shapePercent = 100 * (antShapeOffset / shapeLengths[shapeIndex]);
			const ticksForRotation = shapeLength / MARCHING_SPEED;
			const offsetPercent = 100 * (this.ticks % ticksForRotation) / ticksForRotation;
			const {x,y} = shape.getPositionAtPercent((shapePercent + offsetPercent) % 100);
			this.ants[i].setDestination(x,y);
		}

		const box = Shape.fromExtents(this.shapes.extents().inset(-30,-30));
		const boxLength = box.calculateTotalLength();
		const remainingAnts = this.ants.length - antCount;
		for (var i=0; i<remainingAnts; i++) {
			const ticksForRotation = boxLength / MARCHING_SPEED;
			const offsetPercent = 100 * (this.ticks % ticksForRotation) / ticksForRotation;
			const boxPercent = 100*i/remainingAnts;
			const {x,y} = box.getPositionAtPercent((boxPercent + offsetPercent) % 100);
			this.ants[antCount+i].setDestination(x,y);
		}
	}

	render() {
		if (this.keysHeld[32]) return;
		this.ticks++;
		// if (this.ticks !== 10) return;
		this.ctx.clearRect(0,0,this.width,this.height);

		if (DEBUG && this.shapes) {
			this.shapes.render(this.ctx);
			this.shapes.extents().render(this.ctx);
		}

		for (const ant of this.ants) {
			ant.render(this.ctx);
		}
		for (const ant of this.ants) {
			ant.tick();
		}

		//Move destinations
		this.followShape();

		const destDist = _.sum(_.map(this.ants,a => a.distanceToDestination()));
		const avgDist = destDist / this.ants.length;
		if (avgDist > 10) this.stableTime = new Date().getTime();
		if (this.stableTime && new Date().getTime() - this.stableTime > ROTATION_DELAY) this.nextShape();
	}
}