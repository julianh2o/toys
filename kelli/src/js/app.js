require('../css/main.css');

import Game from './game';

class App {
	constructor(game) {
		this._game = game;
		window.app = this;
		window.game = game;
	}

	setup() {
		// Any setup that is required that only runs once before game loads goes here

		this.gameLoop();
	}

	gameLoop() {
		requestAnimationFrame(this.gameLoop.bind(this));

		this._game.render();
	}
}

window.onload = () => {
	let app = new App(new Game());

	app.setup();
}