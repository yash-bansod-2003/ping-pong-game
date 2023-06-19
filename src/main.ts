window.addEventListener('load', () => {


    const canvas: HTMLCanvasElement | null = document.querySelector('#pong');
    const ctx: CanvasRenderingContext2D | null | undefined = canvas?.getContext('2d');

    const CANVAS_WIDTH: number = 600;
    const CANVAS_HEIGHT: number = 400;

    if (canvas === null || ctx === null || ctx === undefined) {
        return;
    }

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

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


    class Player {
        game: Game;
        x: number;
        y: number;
        width: number;
        height: number;
        top: number;
        bottom: number;
        left: number;
        right: number;
        speed: number;
        score: number;

        constructor(game: Game) {
            this.game = game;
            this.width = 10;
            this.height = 100;
            this.speed = 5;
            this.x = 0;
            this.y = (this.game.height / 2) - (this.height / 2);
            this.top = this.y;
            this.bottom = this.y + this.height;
            this.left = this.x;
            this.right = this.x + this.width;
            this.score = 0;
        }

        draw(ctx: CanvasRenderingContext2D) {
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.fillStyle = '#FFFFFF';
        }

        update() {
            this.top = this.y;
            this.bottom = this.y + this.height;
            this.left = this.x;
            this.right = this.x + this.width;

            this.setBoundries();

            if (this.game.lastKey === 'PArrowUp') {
                this.y -= this.speed;
            }
            else if (this.game.lastKey === 'PArrowDown') {
                this.y += this.speed;
            }
        }

        private setBoundries() {
            if (this.bottom >= this.game.height) {
                this.y = this.game.height - this.height;
            } else if (this.top <= 0) {
                this.y = 0;
            }
        }

        public checkCollision(): boolean {
            if (this.top < this.game.object.bottom && this.left < this.game.object.right && this.bottom > this.game.object.top && this.right > this.game.object.left) {
                return true;
            }
            return false;
        }
    }

    class Enemy {
        game: Game;
        x: number;
        y: number;
        width: number;
        height: number;
        top: number;
        bottom: number;
        left: number;
        right: number;
        score: number;

        constructor(game: Game) {
            this.game = game;
            this.width = 10;
            this.height = 100;
            this.x = this.game.width - this.width;
            this.y = (this.game.height / 2) - (this.height / 2);
            this.top = this.y;
            this.bottom = this.y + this.height;
            this.left = this.x;
            this.right = this.x + this.width;
            this.score = 0;
        }


        private setBoundries() {
            if (this.bottom >= this.game.height) {
                this.y = this.game.height - this.height;
            } else if (this.top <= 0) {
                this.y = 0;
            }
        }

        draw(ctx: CanvasRenderingContext2D) {
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }

        update() {
            let enemyLevel = 0.1;
            this.y += (this.game.object.y - (this.y + this.height / 2)) * enemyLevel;

            this.top = this.y;
            this.bottom = this.y + this.height;
            this.left = this.x;
            this.right = this.x + this.width;

            this.setBoundries();

        }

        public checkCollision(): boolean {
            if (this.top < this.game.object.bottom && this.left < this.game.object.right && this.bottom > this.game.object.top && this.right > this.game.object.left) {
                return true;
            }
            return false;
        }
    }

    class Object {
        game: Game;
        radius: number;
        x: number;
        y: number;
        speed: number;
        velocity_x: number;
        velocity_y: number;
        direction: number;
        top: number;
        bottom: number;
        left: number;
        right: number;
        constructor(game: Game) {
            this.game = game;
            this.radius = 10;
            this.x = this.game.width / 2;
            this.y = this.game.height / 2;
            this.speed = 3;
            this.velocity_x = 3;
            this.velocity_y = 3;
            this.direction = 1;
            this.top = this.y - this.radius;
            this.bottom = this.y + this.radius;
            this.left = this.x - this.radius;
            this.right = this.x + this.radius;
        }

        reset() {
            this.x = this.game.width / 2;
            this.y = this.game.height / 2;
            this.speed = 3;
            this.velocity_x = - this.velocity_x;
        }

        draw(ctx: CanvasRenderingContext2D) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.shadowColor = '#FFF';
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.shadowBlur = 20;
            ctx.fill();
        }

        update() {
            this.x += this.velocity_x;
            this.y += this.velocity_y;

            this.top = this.y - this.radius;
            this.bottom = this.y + this.radius;
            this.left = this.x - this.radius;
            this.right = this.x + this.radius;


            if (this.y + this.radius > this.game.height || this.y - this.radius < 0) {
                this.velocity_y = - this.velocity_y;
            }

            if (this.left <= 0) {
                this.game.enemy.score++;
                this.reset();
            } else if (this.right >= this.game.width) {
                this.game.player.score++;
                this.reset();
            }

            this.direction = this.x < (this.game.width / 2) ? 1 : -1;

            if (this.game.enemy.checkCollision()) {
                let collidePoint = this.y - (this.game.enemy.y + (this.game.enemy.height / 2));
                collidePoint = collidePoint / (this.game.enemy.height / 2);

                let angleRad = collidePoint * (Math.PI / 4);

                this.velocity_x = this.direction * this.speed * Math.cos(angleRad);
                this.velocity_y = this.speed * Math.sin(angleRad);

                this.speed += 0.1;
            }

            if (this.game.player.checkCollision()) {
                let collidePoint = this.y - (this.game.player.y + (this.game.player.height / 2));
                collidePoint = collidePoint / (this.game.player.height / 2);

                let angleRad = collidePoint * (Math.PI / 4);

                this.velocity_x = this.direction * this.speed * Math.cos(angleRad);
                this.velocity_y = this.speed * Math.sin(angleRad);

                this.speed += 0.1;
            }

        }
    }

    class Game {
        width: number;
        height: number;
        lastKey: string | null;
        input: InputHandler;
        player: Player;
        enemy: Enemy;
        object: Object;

        constructor(width: number, height: number) {
            this.width = width;
            this.height = height;
            this.lastKey = null;
            this.input = new InputHandler(this);
            this.player = new Player(this);
            this.enemy = new Enemy(this);
            this.object = new Object(this);
        }

        draw(ctx: CanvasRenderingContext2D) {
            this.player.draw(ctx);
            this.enemy.draw(ctx);
            this.object.draw(ctx);
        }

        update() {
            this.player.update();
            this.enemy.update();
            this.object.update();
        }
    }


    const game = new Game(CANVAS_WIDTH, CANVAS_HEIGHT);

    const animate = () => {
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        game.draw(ctx);
        game.update();
        requestAnimationFrame(animate);
    }

    animate();
});