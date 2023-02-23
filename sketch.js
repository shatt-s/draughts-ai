new p5();

class Tile {

    static grid = []

    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.color = (this.x + this.y) % 2 == 0 ? color(255, 255, 230) : color(140, 110, 70)
        Tile.grid.push(this);
    }

    static getTileSize() {
        return min(canvas.width / 9, canvas.height / 9);
    }

    draw() {
        let tileSize = Tile.getTileSize();
        fill(this.color);
        // fill(255, 255, 240);
        strokeWeight(0);
        rect(this.x * tileSize + canvas.width / 2 - tileSize * 4, this.y * tileSize + canvas.height / 2 - tileSize * 4, tileSize, tileSize);
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function setupGrid() {
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            new Tile(j, i)
        }
    }
}

let canvas;
function setup() {
    canvas = createCanvas(windowWidth, windowHeight);
    setupGrid();
}

function draw() {
    background(220);

    let tileSize = Tile.getTileSize();
    strokeWeight(tileSize / 5);
    rect(canvas.width / 2 - tileSize * 4, canvas.height / 2 - tileSize * 4, tileSize * 8, tileSize * 8)

    for (let i = 0; i < Tile.grid.length; i++) {
        Tile.grid[i].draw();
    }
}