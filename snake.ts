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
    private client = new Paho.MQTT.Client("mqtt-ws.sdi.hevs.ch", 80, "/ws", "snake-prototype");
    private intervalID = 0;

    constructor() {
        const lastWillMessage = new Paho.MQTT.Message(JSON.stringify({
            red: 0,
            green: 0,
            blue: 0
        }));
        lastWillMessage.destinationName = "sdi42/VirtualGamePad/LED";

        this.client.onConnectionLost = this.onDisconnected.bind(this);
        this.client.onMessageArrived = this.onMessageArrived.bind(this);

        this.client.connect({
            userName: 'sdiXX',
            password: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
            keepAliveInterval: 30,
            cleanSession: true,
            onSuccess: this.onConnected.bind(this),
            willMessage: lastWillMessage
        });
    }

    private onConnected() {
        this.client.send("sdi42/VirtualGamePad/LED", JSON.stringify({
            red: 50,
            green: 255,
            blue: 100
        }));

        setInterval(() => {
            this.update();
            this.render();
            this.updateGamePadLCD();
        }, 100);
    }

    private onDisconnected() {
        clearInterval(this.intervalID);
        this.intervalID = 0;
    }

    private onMessageArrived(message: Paho.MQTT.Message) {}

    private update() {
        const newHead = new Point(this.snake[0].x, this.snake[0].y);
        switch (this.direction) {
            case Direction.UP:
                newHead.y--;
                if (newHead.y < 0) newHead.y = 31;
                break;

            case Direction.DOWN:
                newHead.y++;
                if (newHead.y > 31) newHead.y = 0;
                break;

            case Direction.LEFT:
                newHead.x--;
                if (newHead.x < 0) newHead.x = 0;
                break;

            case Direction.RIGHT:
                newHead.x++;
                if (newHead.x > 63) newHead.x = 0;
                break;
        }

        this.snake.unshift(newHead);
        this.snake.pop();
    }

    private render() {
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

    private updateGamePadLCD() {
        const data = this.display.toDataURL("image/png").replace(/^data:image\/png;base64,/, "");
        this.client.send("sdi42/VirtualGamePad/LCD/PNG", data);
    }
}

$(() => {
    const game = new SnakeGame();
});
