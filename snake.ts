class Point {
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public x: number = 0;
    public y: number = 0;
}

enum Direction {
    UP,
    DOWN,
    LEFT,
    RIGHT
}

class SnakeGame {
    private display = $('#display')[0] as HTMLCanvasElement;
    private direction = Direction.RIGHT;
    private snake = [
        new Point(32, 16),
        new Point(31, 16),
        new Point(30, 16),
        new Point(30, 15),
        new Point(30, 14),
        new Point(30, 13),
        new Point(29, 13)
    ];

    public update() {}

    public render() {
        const context = this.display.getContext('2d');
        context.clearRect(0, 0, 640, 320);

        context.save();
        context.scale(10, 10);
        context.fillStyle = 'black';
        for (const point of this.snake) {
            context.fillRect(point.x, point.y, 1, 1);
        }

        context.restore();
    }
}

$(() => {
    const game = new SnakeGame();
    game.render();
});
