import { Point, Vector } from "ts-2d-geometry";
import * as _ from "lodash";
import $ from 'jquery';

//TODO support shapes
// TODO: add kelli personalization

const angleDifference = (a1, a2) => {
	const diff = (( a2 - a1 + Math.PI ) % (2*Math.PI)) - Math.PI;
	return diff < -Math.PI ? diff + (2*Math.PI) : diff;
}

const bound = (min, max, value) => Math.min(max,Math.max(min,value));
const scaleWithin = (min, max, portion) => min + portion*(max - min);

const hsv2rgb = (h,s,v) => {                              
  let f= (n,k=(n+h/60)%6) => v - v*s*Math.max( Math.min(k,4-k,1), 0);     
  return [f(5),f(3),f(1)];       
}   

// const kelli = [[330,29],[338,33],[344,40],[347,45],[353,54],[355,58],[356,64],[350,67],[340,68],[334,69],[319,69],[310,69],[293,69],[276,69],[267,68],[247,65],[236,63],[212,60],[188,56],[175,55],[149,54],[136,54],[113,54],[102,54],[79,54],[57,52],[47,51],[28,49],[20,48],[1,48],[1,48],[1,49],[1,50],[1,51],null,[1,51],[1,51],[1,51],[1,51],[1,51],[364,176],[355,176],[334,177],[311,178],[299,178],[274,178],[260,176],[232,171],[206,167],[194,164],[170,158],[159,153],[141,142],[129,131],[125,125],[121,113],[121,108],[121,99],[122,95],[130,90],[140,87],[144,86],[152,86],[157,91],[159,94],[160,97],[161,105],[162,114],[162,119],[162,130],[154,140],[149,145],[137,153],[122,158],[113,160],[95,165],[80,170],[73,173],[60,180],[54,184],[43,193],[35,203],[32,208],[26,219],[24,224],[21,236],[22,249],[26,255],[33,267],[42,277],[47,281],[57,286],[63,288],[75,291],[90,293],[100,294],[119,295],[136,295],[144,295],[158,293],[163,292],[170,288],[172,284],[172,282],[167,275],[157,268],[151,267],[139,264],[123,263],[114,263],[95,263],[78,264],[70,267],[58,274],[49,283],[46,287],[38,295],[32,304],[30,309],[30,320],[32,332],[37,338],[51,351],[70,363],[81,368],[110,379],[144,389],[163,395],[201,404],[236,411],[251,412],[277,414],[300,414],[310,414],[326,414],[337,411],[341,409],[342,406],[342,404],[341,402],[330,395],[312,385],[303,381],[282,375],[255,372],[240,372],[211,371],[183,369],[170,369],[145,369],[123,369],[102,369],[91,370],[70,374],[52,379],[46,383],[37,390],[30,399],[27,403],[21,411],[20,416],[22,422],[27,425],[41,434],[64,443],[79,446],[115,453],[154,461],[173,465],[212,473],[249,480],[281,484],[310,488],[331,489],[338,489],[347,488],[350,482],[348,474],[344,470],[329,463],[308,457],[283,452],[270,450],[241,448],[212,448],[197,448],[167,448],[140,448],[127,448],[102,448],[81,450],[66,454],[60,456],[49,462],[41,469],[35,478],[33,482],[29,490],[27,498],[27,505],[27,509],[30,516],[38,523],[50,531],[57,535],[72,541],[89,546],[105,550],[119,553],[124,553],[125,553],[125,553],[122,553],[118,552],[105,549],[90,548],[73,548],[56,549],[49,552],[42,559],[40,566],[40,575],[40,582],[39,586],[39,592],null];
//const kelli = [[323,11],[326,11],[340,29],[343,37],[346,51],[346,65],[346,70],[337,76],[329,77],[312,77],[291,77],[281,75],[258,72],[245,70],[216,65],[185,60],[170,58],[137,54],[104,52],[88,51],[56,49],[24,47],[8,46],[1,45],null,[1,45],[1,45],[1,45],[345,170],[342,170],[338,170],[321,171],[302,172],[292,172],[271,172],[247,170],[235,168],[210,162],[187,154],[176,150],[158,137],[142,121],[136,113],[127,95],[120,75],[117,65],[115,50],[117,39],[122,37],[132,35],[144,36],[150,40],[162,52],[166,59],[170,74],[168,88],[159,99],[154,104],[143,111],[129,117],[122,120],[106,127],[90,135],[82,139],[66,148],[52,158],[46,163],[38,174],[37,185],[37,192],[39,207],[46,226],[50,236],[62,257],[78,276],[97,294],[106,302],[125,314],[145,320],[154,321],[171,319],[184,307],[187,297],[191,273],[191,249],[188,239],[177,220],[160,206],[141,199],[131,198],[109,197],[88,200],[70,208],[62,212],[49,222],[39,234],[35,240],[29,253],[26,265],[26,276],[26,280],[26,289],[26,297],[27,305],[29,309],[34,321],[43,336],[60,355],[72,367],[103,388],[139,406],[182,419],[203,424],[245,429],[279,430],[302,425],[314,416],[316,410],[316,395],[300,379],[274,366],[236,356],[191,346],[145,343],[102,343],[81,343],[47,347],[27,358],[14,373],[12,392],[34,413],[70,434],[117,456],[143,466],[193,485],[248,500],[295,508],[327,509],[344,507],[348,495],[339,475],[309,456],[270,443],[223,441],[200,441],[153,442],[108,444],[70,444],[39,444],[20,445],[8,459],[20,484],[48,508],[64,519],[100,537],[126,543],[131,544],[126,542],[115,539],[84,537],[51,543],[31,559],[22,576],[20,589],null];
const kelli = [[311,6],[309,6],[306,6],[302,7],[302,7],[302,7],[305,10],[314,18],[324,27],[336,37],[340,42],[345,52],[345,62],[341,69],[328,73],[320,74],[302,75],[286,75],[270,74],[261,72],[242,68],[223,65],[203,62],[193,62],[171,62],[147,61],[124,59],[113,59],[91,58],[74,58],[58,57],[52,56],[39,55],[28,55],[17,54],[11,54],[2,54],[1,54],null,[1,54],[340,153],[333,154],[315,157],[291,160],[262,160],[247,160],[219,158],[193,151],[183,146],[165,136],[151,126],[140,115],[136,109],[131,99],[129,90],[129,83],[130,78],[133,77],[138,75],[142,75],[145,75],[146,76],[147,81],[148,88],[142,98],[137,104],[126,112],[114,118],[100,122],[93,124],[78,127],[64,128],[52,129],[47,131],[39,135],[32,144],[29,156],[29,163],[29,177],[29,191],[30,204],[34,210],[44,221],[59,230],[75,238],[84,242],[103,247],[120,250],[135,251],[142,250],[150,244],[154,238],[154,233],[154,230],[153,222],[147,215],[135,210],[127,208],[109,204],[91,202],[74,202],[66,202],[53,209],[46,218],[41,228],[38,238],[36,243],[33,254],[32,263],[32,271],[32,275],[40,285],[55,299],[75,314],[87,321],[111,336],[135,350],[161,363],[175,369],[206,378],[236,382],[257,383],[265,383],[276,381],[283,375],[288,368],[289,366],[289,361],[282,353],[263,341],[239,328],[226,323],[198,313],[168,306],[139,302],[126,302],[100,302],[76,305],[56,311],[49,315],[43,322],[42,331],[43,343],[46,350],[52,364],[62,380],[77,396],[88,404],[113,419],[140,433],[170,445],[198,453],[210,455],[231,456],[244,456],[248,455],[248,454],[243,449],[225,439],[202,426],[176,415],[162,411],[135,404],[110,401],[86,400],[66,400],[57,400],[42,408],[33,417],[32,427],[32,441],[40,456],[52,474],[59,482],[74,495],[91,504],[108,511],[124,515],[130,517],[135,520],[135,520],[131,520],[113,520],[90,520],[72,523],[59,529],[54,536],[52,544],[52,555],[52,559],null,[227,532],[227,531],[227,526],[227,524],[229,519],[230,518],[235,516],null];

const defaultConfig = {
	MAX_V:1,
	MAX_DV:.1,
	DECAY_RATE:.9,
	ADD_GRID_SPACE: false,
	SPIN_MULTIPLIER:500,
	MAX_RADIUS:75,
	RENDER_MAGNITUDE: true,
	COLOR_STYLE: "black",
	RENDER_STYLE: "panels",
	PANEL_SIZE:7,
	LINE_LENGTH:60,
	HUE_REPEAT:1,
};

const CONFIG_OPTIONS = [
	{
		id:"clear",
		variant: "light",
		icon:"description",
		onClick:() => window.game.reset(),
	},
	{
		id:"kelli",
		variant: "danger",
		icon:"favorite",
		onClick:() => window.game.kelli(),
	},
	{
		id:"brush",
		element:() => $(`<input class="config config_brush" type="range" min="0" max="1" value="0" step=".1" class="slider" />`),
		params:(v) => {
			v = parseFloat(v);
			return {
				SPIN_MULTIPLIER:scaleWithin(500,200,v),
				MAX_RADIUS:scaleWithin(30,500,v),
				DECAY_RATE:scaleWithin(.9,1.05,v),
			}
		},
	},
	{
		id:"vectors",
		default: false,
		icon:"texture",
		params: {
			RENDER_STYLE: "vectors",
		}
	},
	{
		id:"colorize",
		default: "hue",
		values: ["black","hue","hue4"],
		variant: ["outline-primary","primary","danger"],
		icon:"looks",
		params: {
			"black":{},
			"hue":{
				RENDER_MAGNITUDE: false,
				COLOR_STYLE: "hue",
			},
			"hue4":{
				RENDER_MAGNITUDE: false,
				COLOR_STYLE: "hue",
				HUE_REPEAT:4,
			}
		}
	},
	{
		id:"save",
		variant: "success",
		icon:"save_alt",
		onClick:() => downloadCanvas(window.game.canvas),
	},
];

const allConfigs = _.flatten(CONFIG_OPTIONS);
const configurationOptions = _.mapValues(_.keyBy(allConfigs,"id"),"params");
const defaultState = _.mapValues(_.keyBy(allConfigs,"id"),"default");

const generateButtons = () => {
	const generateButton = (config) => {
		const toggle = _.isBoolean(config.default);
		config.variant = config.variant || "primary";
		if (config.element) {
			const $el = config.element();
			return $el;
		} else if (config.onClick) {
			const $el = $(`<button type="button" class="btn btn-${config.variant} btn-xs"><span class="material-icons md-18">${config.icon}</span></button>`);
			$el.on("click",config.onClick);
			return $el;
		} else if (toggle) {
			return $(`<button type="button" class="config config_toggle_${config.id} btn btn-${config.variant} btn-xs"><span class="material-icons md-18">${config.icon}</span></button>`);
		} else if (config.values) {
			const index = config.values.indexOf(config.default);
			return $(`<button type="button" class="config config_toggle_${config.id} btn btn-${config.variant[index]} btn-xs"><span class="material-icons md-18">${config.icon}</span></button>`);
		} else {
			throw new Error("Unsupported config");
		}
	}

	const $els = [];
	for (const config of allConfigs) {
		$els.push(generateButton(config));
	}
	return $els;
}

$(".topnav").empty().append(...generateButtons());

const updateButtonState = (state) => {
	$(".config").toArray().map((el) => {
		const classes = $(el).attr("class").split(" ");
		const config = _.find(classes,s => s.startsWith("config_"));
		const btn = _.find(classes,s => s.startsWith("btn-") && !s.includes("xs"));
		if (!btn) return;
		if (!config) return;
		const [designator,tok1,tok2] = config.split("_");
		const isToggle = tok1 === "toggle";
		const key = isToggle ? tok2 : tok1;
		const value = isToggle || tok2;
		const enabled = btn.split("-").length === 2;
		const type = enabled ? btn.split("-")[1] : btn.split("-")[2];
		$(el).removeClass(btn);
		const configData = _.find(allConfigs,{"id":key});
		if (isToggle && configData.values) {
			const index = configData.values.indexOf(state[key]);
			$(el).addClass(`btn-${configData.variant[index]}`);
		} else {
			$(el).addClass(state[key] === value ? `btn-${type}` : `btn-outline-${type}`);
		}
		el.blur();
	});
}

const getElementState = (el) => {
	const classes = $(el).attr("class").split(" ");
	const config = _.find(classes,s => s.startsWith("config_"));
	if (!config) return {};
	const [designator,key,value] = config.split("_");

	if ($(el).is("input")) {
		return {
			key,
			value:$(el).val(),
			enabled: true,
		}
	} else {
		const btn = _.find(classes,s => s.startsWith("btn-") && !s.includes("xs"));
		if (!btn) return {};
		const enabled = btn.split("-").length === 2;
		const type = enabled ? btn.split("-")[1] : btn.split("-")[2];
		return {key,value,type,btn,enabled};
	}
}

const stateFromButtons = () => {
	const state = {};
	$(".config").toArray().map((el) => {
		const {key,value,enabled,btn} = getElementState(el);
		if (!key) return;

		if (key === "toggle") {
			const configData = _.find(allConfigs,{"id":value});
			if (configData.values) {
				const variant = btn.substring(btn.indexOf("-")+1);
				let index = configData.variant.indexOf(variant);
				state[value] = configData.values[index];
			} else {
				state[value] = enabled;
			}
		} else if (enabled) {
			state[key] = value;
		}
	});
	return state;
}

const valMemberFunc = (vorf,v) => _.isFunction(vorf) ? vorf(v) : vorf[v];
const calculateConfig = (state) => {
	state = state || stateFromButtons();

	let config = defaultConfig;


	//apply state from buttons
	for (const key of Object.keys(state)) {
		const value = state[key];
		if (_.isBoolean(value) && value) {
			config = {...config,...configurationOptions[key]};
		} else {
			config = {...config,...valMemberFunc(configurationOptions[key],value)};
		}
	}

	return {config,state};
}

updateButtonState(defaultState);
let config = calculateConfig().config;
let configListener = null;
$(".config").on("click",(e) => { 
	const el = $(e.target).closest(".config");
	if (el.is("input")) return;
	const {key,value,type,enabled} = getElementState(el);
	const c = calculateConfig();
	if (key === "toggle") {
		const configData = _.find(allConfigs,{"id":value});
		if (configData.values) {
			let index = configData.values.indexOf(c.state[value]);
			index = (index + 1) % configData.values.length;
			c.state[value] = configData.values[index];
		} else {
			c.state[value] = !enabled;
		}
	} else {
		c.state[key] = value;
	}
	setTimeout(() => {
		updateButtonState(c.state);
	},100);

	config = calculateConfig(c.state).config;

	if (configListener) configListener();
});

$(".config").on("change",() => {
	config = calculateConfig().config;
	if (configListener) configListener();
});
const getConfig = () => config;

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

		const offset = new Vector(dx/2 - this.topLeft.x,dy/2 - this.topLeft.y);
		return offset;
	}


	getTransformTo(extents) {
		const from = this.size();
		const to = extents.size();

		const dx = to.x - from.x;
		const dy = to.y - from.y;

		const rx = dx / from.x;
		const ry = dy / from.y;

		const factor = Math.min(rx,ry);
		const offset = extents.topLeft.minus(this.topLeft).scale(factor);
		return {offset,factor};
	}

	size() {
		return this.bottomRight.minus(this.topLeft);
	}

	render(ctx) {
		ctx.strokeStyle = "#0f0";
		ctx.beginPath();
		ctx.rect(this.topLeft.x,this.topLeft.y,this.size().x,this.size().y);
		ctx.stroke();
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

	totalPoints() {
		return _.sum(_.map(this.shapes,s => s.points.length));
	}

	totalLength() {
		return _.sum(_.map(this.shapes,s => s.getTotalLength()));
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
		const points = this.closed ? [...this.points,this.points[0]] : this.points;
		for (const point of points) {
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

	getPointWeightedPositionAtPercent(percent) {
		const portion = percent / 100;
		const point = Math.round(this.points.length * portion);
		const remain = portion - (point / this.points.length)
		const portionToNext =  remain / (((point+1) / this.points.length) - (point/this.points.length));
		const first = this.points[point];
		const second = this.points[point+1];
		if (point <= 0) return _.first(this.points);
		if (point+1 >= this.points.length-1) return _.last(this.points);
		return first.plus(second.minus(first).scale(portionToNext));
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
		if (this.closed) length += Math.sqrt(lastPoint.distanceSquare(this.points[0]));
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
		if (!this.points.length) return;
		ctx.beginPath();
		ctx.strokeStyle = "#999";
		const [startX, startY] = [this.points[0].x,this.points[0].y];
		ctx.moveTo(startX,startY);
		ctx.stroke();
		for (const point of this.points) {
			ctx.lineTo(point.x,point.y);
		}
		if (this.closed) ctx.lineTo(startX,startY);
		ctx.stroke();
		ctx.fillStyle = "#999";
		for (const point of this.points) {
			ctx.fillRect(point.x,point.y,2,2);
		}
	}
}

class Panel {

	static createPanelArray(width, height, pwidth, pheight) {
		const panels = [];
		const panelsAcross = Math.round(width / pwidth);
		const panelsDown = Math.round(height / pheight);
		for (var x=0; x<panelsAcross; x++) {
			for (var y=0; y<panelsDown; y++) {
				panels.push(new Panel(
					x * pwidth,
					y * pheight,
					pwidth,
					pheight,
				));
			}
		}
		return panels;
	}

	constructor(x, y, width, height) {
		this.pos = new Point(x,y);
		this.size = new Vector(width,height);
		this.v = new Vector(0,0);
		this.dv = new Vector(0,0);
	}

	getColor() {
		if (getConfig().COLOR_STYLE === "black") {
			return "#000";
		} else if (getConfig().COLOR_STYLE === "palette") {
			let deg = Math.round(360 * Math.atan2(this.v.y,this.v.x) / (2 * Math.PI));
			deg = (deg + 360 + 45) % 360;
			// const colors = ["#0066ff","#ff00ff","#652FF7","#ff9900"];
			// const colors = ["#652FF7","#2929D6","#3969ED","#2985D6"];
			// const colors = ["#2BC5D9","#BC1CD9","#682BF0","#1C43D9"];
			const colors = ["#FC980A","#F00602","#D909C7","#410CFA"];
			const color = Math.round((colors.length-1) * (deg / 360));
			return color;
		} else if (getConfig().COLOR_STYLE === "hue") {
			const rad = Math.atan2(this.v.y,this.v.x) + Math.PI;
			let h = Math.round(rad * 180 / Math.PI);
			h = (h * getConfig().HUE_REPEAT) % 360;
			h = Math.round(h / 20) * 20; //quantize?
			const mag = Math.round(100*this.v.norm2()) / 2;
			return `hsl(${h} 100% ${mag}%)`;
		}
	}

	render(ctx) {
		ctx.strokeStyle = "#000";
		ctx.fillStyle = "#000";
		const middle = this.pos.plus(this.size.scale(.5));

		const color = this.getColor();
		ctx.strokeStyle = color;
		ctx.fillStyle = color;
		if (getConfig().RENDER_STYLE === "vectors") {
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.moveTo(middle.x,middle.y);
			ctx.lineTo(middle.x + this.v.x * getConfig().LINE_LENGTH,middle.y + this.v.y * getConfig().LINE_LENGTH);
			ctx.stroke();

			// ctx.lineWidth = 1;
			// ctx.beginPath();
			// ctx.moveTo(middle.x,middle.y);
			// ctx.lineTo(middle.x + 10*this.dv.x * getConfig().LINE_LENGTH,middle.y + 10*this.dv.y * getConfig().LINE_LENGTH);
			// ctx.stroke();
		} else if (getConfig().RENDER_STYLE === "panels") {
			const mag = getConfig().RENDER_MAGNITUDE ? this.v.norm2() : 1;
			const squareSize = this.size.scale(mag);
			if (getConfig().ADD_GRID_SPACE) {
				squareSize.x = Math.min(this.size.x-2,squareSize.x);
				squareSize.y = Math.min(this.size.y-2,squareSize.y);
			}
			ctx.fillRect(middle.x - squareSize.x/2 * mag,middle.y - squareSize.y/2,squareSize.x,squareSize.y);
		}
		// ctx.fillRect(this.pos.x,this.pos.y,this.size.x,this.size.y*(this.v.x / getConfig().MAX_V));
	}

	tick() {
		this.v = this.v.plus(this.dv);
		// this.v.x = bound(-getConfig().MAX_V,getConfig().MAX_V,this.v.x);
		// this.v.y = bound(-getConfig().MAX_V,getConfig().MAX_V,this.v.y);
		if (this.v.norm2() > getConfig().MAX_V) {
			this.v = this.v.normed().scale(getConfig().MAX_V);
			const dvAngle = Math.atan2(this.dv.y,this.dv.x);
			const vAngle = Math.atan2(this.v.y,this.v.x);
			if (Math.abs(angleDifference(vAngle,dvAngle)) < (2 * Math.PI)/500) {
				this.dv = new Vector(0,0);
			}
		}
		if (this.dv.norm2() > getConfig().MAX_DV) this.dv = this.dv.normed().scale(getConfig().MAX_DV);
		// this.dv.x = bound(-getConfig().MAX_DV,getConfig().MAX_DV,this.dv.x);
		// this.dv.y = bound(-getConfig().MAX_DV,getConfig().MAX_DV,this.dv.y);
		// if (this.v.x === -getConfig().MAX_V
		// 	|| this.v.x === getConfig().MAX_V) this.dv.x = 0;
		// if (this.v.y === -getConfig().MAX_V
		// 	|| this.v.y === getConfig().MAX_V) this.dv.y = 0;
		this.dv = this.dv.scale(getConfig().DECAY_RATE);
	}
}

function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
	if (evt.touches) {
		return {
			x: evt.touches[0].clientX - rect.left,
			y: evt.touches[0].clientY - rect.top,
		}
	}
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}

function getMouseMovementVector(last,m) {
	if (last.touches) {
		return new Vector(m.touches[0].clientX - last.touches[0].clientX,m.touches[0].clientY - last.touches[0].clientY);
	} else {
		return new Vector(m.clientX - last.clientX,m.clientY - last.clientY);
	}
}

function calculateMouseSpeed(history) {
	if (history.length <= 1) return new Vector(0,0);
	let last = null;
	let sum = new Vector(0,0);
	for (const m of history) {
		if (last) {
			const dt = m.timeStamp - last.timeStamp;
			const d = getMouseMovementVector(last,m);
			if (dt === 0) continue;
			const speed = d.scale(1 / dt);
			sum = sum.plus(speed);
		}
		last = m;
	}
	return sum.scale(1/(history.length-1));
}

var downloadCanvas = function(canvas) {
  var link = document.createElement('a');
  link.download = 'image.png';
  link.href = canvas.toDataURL()
  link.click();
}

export default class Game {
	constructor() {
		this.height = window.innerHeight;
		this.width = window.innerWidth;
		this.panels = [];
		this.ticks = 0;
		this.keysHeld = {};
		this.mouseHistory = [];
		this.mousedown = false;
		this.currentSize = null;
		this.drawingHistory = [];

		this.canvas = document.getElementById('canvas');
		this.canvas.width = this.width;
		this.canvas.height = this.height;
		this.canvas.addEventListener("mousemove",e => this.mouseMove(e));
		this.canvas.addEventListener("mousedown",e => this.mouseDown(e));
		this.canvas.addEventListener("mouseup",e => this.mouseUp(e));
		this.canvas.addEventListener("touchmove",e => this.mouseMove(e));
		this.canvas.addEventListener("touchstart",e => this.mouseDown(e));
		this.canvas.addEventListener("touchend",e => this.mouseUp(e));
		this.canvas.addEventListener("touchstart",  function(event) {event.preventDefault()})
		this.canvas.addEventListener("touchmove",   function(event) {event.preventDefault()})
		this.canvas.addEventListener("touchend",    function(event) {event.preventDefault()})
		this.canvas.addEventListener("touchcancel", function(event) {event.preventDefault()})
		window.addEventListener("keydown",e => this.keyDown(e));
		window.addEventListener("keyup",e => this.keyUp(e));
		this.ctx = this.canvas.getContext("2d");
		configListener = this.configUpdated.bind(this);
		this.configUpdated();
		this.shapes = Shapes.fromTuples(kelli);

		window.setInterval(() => {
			if (!this.mousedown || this.mouseHistory.length === 0) return
			this.drawingHistory.push(_.last(this.mouseHistory));
		},20);
	}

	configUpdated() {
		if (this.currentSize === getConfig().PANEL_SIZE) return;
		const maxWidth = getConfig().PANEL_SIZE * 120;
		const maxHeight = getConfig().PANEL_SIZE * 160;
		this.panels = Panel.createPanelArray(Math.min(maxWidth,this.width),Math.min(maxHeight,this.height),getConfig().PANEL_SIZE,getConfig().PANEL_SIZE);
		this.currentSize = getConfig().PANEL_SIZE;
		setTimeout(() => this.canvas.focus(),200);
	}

	reset() {
		for (const panel of this.panels) {
			panel.v = new Vector(0,0);
			panel.dv = new Vector(0,0);
		}
	}

	kelli() {
		console.log(JSON.stringify(_.map(this.drawingHistory,e => {
			if (!e) return e;
			const {x,y} = getMousePos(this.canvas,e);
			return [x,y];
		})));
		this.drawingHistory = [];
		let i = 0;
		const timeToDraw = 5000;
		const delay = 20;
		const subdivisions = timeToDraw / delay;
		const speed = 5;
		let last = null;
		let lastShape = null;
		const t = setInterval(() => {
			i++;
			const shape = this.shapes.getShapeAtPercent(100 * (i / subdivisions));
			if (shape != lastShape) {
				console.log("adding shape break");
				last = null;
			}
			const {x,y} = this.shapes.getPointWeightedPositionAtPercent(100 * (i  / subdivisions));
			if (last) {
				let v = last.minus(new Point(x,y));
				if (last.x === x && last.y === y) return;
				v = v.normed().scale(speed);
				// console.log("affect",{x,y,v});
				this.affect(x,y,v);
			}
			last = new Point(x,y);
			lastShape = shape;
			if (i >= subdivisions-1) clearInterval(t);
		},delay);
	}

	mouseMove(e) {
		if (!this.mousedown) return
		this.mouseHistory.push(e);
		while(this.mouseHistory.length > 10) this.mouseHistory.shift();
		const speed = calculateMouseSpeed(this.mouseHistory);
		const {x,y} = getMousePos(this.canvas,e);
		this.affect(x,y,speed);
	}

	affect(x,y,speed) {
		const mouse = new Point(x,y);
		for (const panel of this.panels) {
			const d2 = panel.pos.distanceSquare(mouse);
			if (d2 === 0) continue;
			if (getConfig().MAX_RADIUS !== -1 && d2 > Math.pow(getConfig().MAX_RADIUS,2)) continue;
			
			// panel.v = panel.pos.minus(mouse).normed();
			panel.dv = panel.dv.plus(speed.scale(getConfig().SPIN_MULTIPLIER / (d2*5)));
		}
	}

	mouseDown(e) {
		this.mousedown = true;
	}

	mouseUp(e) {
		if (this.drawingHistory) this.drawingHistory.push(null);
		this.mousedown = false;
	}

	keyDown(e) {
		this.keysHeld[e.keyCode] = true;
	}
	keyUp(e) {
		this.keysHeld[e.keyCode] = false;
	}

	render() {
		// if (this.keysHeld[32]) return;
		this.ticks++;
		this.ctx.clearRect(0,0,this.width,this.height);

		for (const panel of this.panels) {
			panel.render(this.ctx);
		}

		if (this.shape) this.shape.render(this.ctx);

		for (const panel of this.panels) {
			panel.tick();
		}
	}
}