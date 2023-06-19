class InputHandler {
    game: Game;
    constructor(game: Game) {
        this.game = game;
        window.addEventListener('keyup', (event: KeyboardEvent) => {
            this.game.lastKey = 'R' + event.key;
            console.log(this.game.lastKey);
        });
        window.addEventListener('keydown', (event: KeyboardEvent) => {
            this.game.lastKey = 'P' + event.key;
            console.log(this.game.lastKey);
        });

    }
}

export default InputHandler;