const Direction = {
    UP: 0,
    DOWN: 1,
    LEFT: 2,
    RIGHT: 3
};

let display;
let direction = Direction.RIGHT;
const snake = [
    {x: 32, y: 16},
    {x: 31, y: 16},
    {x: 30, y: 16},
    {x: 30, y: 15},
    {x: 30, y: 14},
    {x: 30, y: 13},
    {x: 29, y: 13}
]
const client = new Paho.MQTT.Client('mqtt-ws.sdi.hevs.ch', 80, '/ws', 'snake-prototype');
let intervalID = 0;

function onConnected() {
    client.subscribe('sdi42/VirtualGamePad/UpButton');
    client.subscribe('sdi42/VirtualGamePad/DownButton');
    client.subscribe('sdi42/VirtualGamePad/LeftButton');
    client.subscribe('sdi42/VirtualGamePad/RightButton');

    client.send('sdi42/VirtualGamePad/LED', JSON.stringify({
        red: 50,
        green: 255,
        blue: 100
    }));

    setInterval(() => {
        update();
        render();
        updateGamePadLCD();
    }, 100);
}

function onDisconnected() {
    clearInterval(intervalID);
    intervalID = 0;
}

function onMessageArrived(message) {
    if (message.destinationName === 'sdi42/VirtualGamePad/UpButton' &&
        message.payloadString === "1" && this.direction !== Direction.DOWN) {
        direction = Direction.UP;
    }
    if (message.destinationName === 'sdi42/VirtualGamePad/DownButton' &&
        message.payloadString === "1" && this.direction !== Direction.UP) {
        direction = Direction.DOWN;
    }
    if (message.destinationName === 'sdi42/VirtualGamePad/LeftButton' &&
        message.payloadString === "1" && this.direction !== Direction.RIGHT) {
        direction = Direction.LEFT;
    }
    if (message.destinationName === 'sdi42/VirtualGamePad/RightButton' &&
        message.payloadString === "1" && this.direction !== Direction.LEFT) {
        direction = Direction.RIGHT;
    }
}

function update() {
    const newHead = {x: snake[0].x, y: snake[0].y};
    switch (direction) {
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
            if (newHead.x < 0) newHead.x = 63;
            break;

        case Direction.RIGHT:
            newHead.x++;
            if (newHead.x > 63) newHead.x = 0;
            break;
    }

    snake.unshift(newHead);
    snake.pop();
}

function render() {
    const context = display.getContext('2d');
    context.clearRect(0, 0, 640, 320);

    context.save();
    context.scale(10, 10);
    context.fillStyle = 'black';
    for (const point of snake) {
        context.fillRect(point.x, point.y, 1, 1);
    }

    context.restore();
}

function updateGamePadLCD() {
    const data = display.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');
    client.send('sdi42/VirtualGamePad/LCD/PNG', data);
}

$(() => {
    display = $('#display')[0];

    const lastWillMessage = new Paho.MQTT.Message(JSON.stringify({
        red: 0,
        green: 0,
        blue: 0
    }));
    lastWillMessage.destinationName = 'sdi42/VirtualGamePad/LED';

    client.onConnectionLost = onDisconnected;
    client.onMessageArrived = onMessageArrived;

    client.connect({
        userName: 'sdiXX',
        password: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        keepAliveInterval: 30,
        cleanSession: true,
        onSuccess: onConnected,
        willMessage: lastWillMessage
    });
});
