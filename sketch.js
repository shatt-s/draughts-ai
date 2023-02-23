let selectedPiece;

new p5();

class Move {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.enemyPieces = [];
    }

    addPieces(pieces) {
        for (const piece of pieces) {
            this.enemyPieces.push(piece);
        }
    }

    equals(v) {
        return this.x == v.x && this.y == v.y;
    }
}

class Piece {

    static playerPieces = []; // TODO: different player groups, winning mechanism
    static enemyPieces = [];

    constructor(tile, player) {
        this.tile = tile;
        this.king = false;
        this.player = player;
        this.color = this.player ? 0 : 255;
        this.kingColor = color(255, 215, 0);

        if (player) Piece.playerPieces.push(this);
        else Piece.enemyPieces.push(this);
    }

    getDirection() {
        return this.player ? -1 : 1;
    }

    getMoves() {
        let moves = [];
        let direction = this.getDirection();
        moves = this.addMove(this.tile.x + 1, this.tile.y + direction, moves);
        moves = this.addMove(this.tile.x - 1, this.tile.y + direction, moves);
        if (this.king) {
            moves = this.addMove(this.tile.x + 1, this.tile.y - direction, moves);
            moves = this.addMove(this.tile.x - 1, this.tile.y - direction, moves);
        }
        moves = this.addJumps(this.tile.x, this.tile.y, moves);
        return moves;
    }

    addMove(x, y, moves, enemyPieces) {
        let tile = Tile.get(x, y)
        if (tile?.piece == null && x >= 0 && x < 8 && y >= 0 && y < 8) {
            let newMove = new Move(x, y);
            moves.push(newMove);
            if (typeof enemyPieces !== "undefined") newMove?.addPieces(enemyPieces);
        }
        return moves;
    }

    takeable(piece) {
        return piece.player != this.player;
    }

    addJumps(x, y, moves, enemyPieces) {
        if(typeof enemyPieces === "undefined") enemyPieces = [];
        let newMoves = [];
        let direction = this.getDirection();
        let piece;
        if ((piece = Tile.get(x + 1, y + direction)?.piece) != null && this.takeable(piece)) if (!enemyPieces.some(p => p == piece)) newMoves = this.addMove(x + 2, y + 2 * direction, newMoves, [...enemyPieces, piece]);
        if ((piece = Tile.get(x - 1, y + direction)?.piece) != null && this.takeable(piece)) if (!enemyPieces.some(p => p == piece)) newMoves = this.addMove(x - 2, y + 2 * direction, newMoves, [...enemyPieces, piece]);
        if (this.king) {
            if ((piece = Tile.get(x + 1, y - direction)?.piece) != null && this.takeable(piece)) if (!enemyPieces.some(p => p == piece)) newMoves = this.addMove(x + 2, y - 2 * direction, newMoves, [...enemyPieces, piece]);
            if ((piece = Tile.get(x - 1, y - direction)?.piece) != null && this.takeable(piece)) if (!enemyPieces.some(p => p == piece)) newMoves = this.addMove(x - 2, y - 2 * direction, newMoves, [...enemyPieces, piece]);
        }

        for (const move of [...newMoves]) {
            newMoves = this.addJumps(move.x, move.y, newMoves, move.enemyPieces);
        }

        moves = [...moves, ...newMoves];
        return moves;
    }
}

class Tile {

    static grid = [];
    static hoveredTile;

    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.color = (this.x + this.y) % 2 == 0 ? color(255, 255, 230) : color(140, 110, 70)
        this.highlight = color(50, 50, 150, 75);
        this.moveColor = color(150, 50, 150, 150);
        this.piece = null;
        this.possibleMove = false;
        this.enemyPieces = [];

        Tile.grid.push(this);
    }

    static getTileSize() {
        return min(canvas.width / 9, canvas.height / 9);
    }

    static get(x, y) {
        if(typeof y === "undefined") { // Vector Input
            if (x.x + 8 * x.y > 64) return null;
            return this.grid[x.x + 8 * x.y];
        } else { // X and Y input
            if (x + 8 * y > 64) return null;
            return this.grid[x + 8 * y];
        }
    }

    static createPiece(x, y, player) {
        let tile = Tile.get(x, y);
        tile.piece = new Piece(tile, player);
        return tile.piece;
    }

    static resetPossibleMoves() {
        for (let i = 0; i < Tile.grid.length; i++) {
            Tile.grid[i].possibleMove = false;
        }
    }

    getPosition() {
        return new Move(this.x, this.y);
    }

    mouseOver() {
        let tileSize = Tile.getTileSize();
        return mouseX >= this.x * tileSize + canvas.width / 2 - tileSize * 4 &&
        mouseX < (this.x + 1) * tileSize + canvas.width / 2 - tileSize * 4 &&
        mouseY >= this.y * tileSize + canvas.height / 2 - tileSize * 4 &&
        mouseY < (this.y + 1) * tileSize + canvas.height / 2 - tileSize * 4
    }

    draw() {
        strokeWeight(0);
        let tileSize = Tile.getTileSize();
        let mouseOver = this.mouseOver();
        // fill(mouseOver ? this.highlight : this.color);
        fill(this.color);
        if (mouseOver) Tile.hoveredTile = this;
        rect(this.x * tileSize, this.y * tileSize, tileSize, tileSize);

        if (this.piece != null) {
            push();
            translate(this.x * tileSize + tileSize / 2, this.y * tileSize + tileSize / 2)
            strokeWeight(tileSize / 100);
            stroke(this.piece.color == 0 ? 255 : 0);
            if (this.piece.king) fill(this.piece.kingColor); else fill(this.piece.color);
            circle(0, 0, tileSize / 2);
            fill(this.piece.color);
            circle(0, 0, tileSize / 3);
            pop();
        }

        if (Tile.hoveredTile == this) {
            fill(this.highlight);
            rect(this.x * tileSize, this.y * tileSize, tileSize, tileSize);
        }

        if (this.possibleMove) {
            fill(this.moveColor);
            rect(this.x * tileSize, this.y * tileSize, tileSize, tileSize);
        }
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

function setupPieces() {
    // AI
    Tile.createPiece(1, 0, false);
    Tile.createPiece(3, 0, false);
    Tile.createPiece(5, 0, false);
    Tile.createPiece(7, 0, false);

    Tile.createPiece(0, 1, false);
    Tile.createPiece(2, 1, false);
    Tile.createPiece(4, 1, false);
    Tile.createPiece(6, 1, false);

    Tile.createPiece(1, 2, false);
    Tile.createPiece(3, 2, false);
    Tile.createPiece(5, 2, false);
    Tile.createPiece(7, 2, false);

    // Player
    Tile.createPiece(0, 7, true);
    Tile.createPiece(2, 7, true);
    Tile.createPiece(4, 7, true);
    Tile.createPiece(6, 7, true);

    Tile.createPiece(1, 6, true);
    Tile.createPiece(3, 6, true);
    Tile.createPiece(5, 6, true);
    Tile.createPiece(7, 6, true);

    Tile.createPiece(0, 5, true);
    Tile.createPiece(2, 5, true);
    Tile.createPiece(4, 5, true);
    Tile.createPiece(6, 5, true);
}

let canvas;
function setup() {
    canvas = createCanvas(windowWidth, windowHeight);
    setupGrid();
    setupPieces();
}

function draw() {
    resetMatrix();
    background(220);
    
    let tileSize = Tile.getTileSize();
    translate(canvas.width / 2 - tileSize * 4, canvas.height / 2 - tileSize * 4);
    strokeWeight(tileSize / 5);
    rect(0, 0, tileSize * 8, tileSize * 8)

    for (let i = 0; i < Tile.grid.length; i++) {
        Tile.grid[i].draw();
    }
}

function endGame(player) {
    if (player) alert("Player Wins!");
    else alert("AI Wins!");

    Tile.grid = [];

    Piece.playerPieces = [];
    Piece.enemyPieces = [];

    setupGrid();
    setupPieces();
}

function mouseClicked() {
    if (selectedPiece != null) {
        if (Tile.hoveredTile.piece == selectedPiece) {
            Tile.resetPossibleMoves();
            selectedPiece = null;
        }
        if (Tile.hoveredTile.possibleMove) {
            for (let i = 0; i < Tile.hoveredTile.enemyPieces.length; i++) {
                if (Tile.hoveredTile.enemyPieces[i].tile.piece.player) Piece.playerPieces.splice(Piece.playerPieces.indexOf(Tile.hoveredTile.enemyPieces[i].tile.piece), 1);
                else Piece.enemyPieces.splice(Piece.enemyPieces.indexOf(Tile.hoveredTile.enemyPieces[i].tile.piece), 1);
                Tile.hoveredTile.enemyPieces[i].tile.piece = null;
            }
            Tile.hoveredTile.enemyPieces = [];
            selectedPiece.tile.piece = null;
            selectedPiece.tile = Tile.hoveredTile;
            Tile.hoveredTile.piece = selectedPiece;
            
            if (Tile.hoveredTile.y == 0 && Tile.hoveredTile.piece.player || Tile.hoveredTile.y == 7 && !Tile.hoveredTile.piece.player) Tile.hoveredTile.piece.king = true;

            if (Piece.enemyPieces.length == 0) endGame(true)
            if (Piece.playerPieces.length == 0) endGame(false)

            Tile.resetPossibleMoves();
            selectedPiece = null;
        }
    } else if (Tile.hoveredTile.piece != null) {
        let possibleMoves = Tile.hoveredTile.piece.getMoves();
        selectedPiece = possibleMoves.length == 0 ? null : Tile.hoveredTile.piece;
        Tile.resetPossibleMoves();
        for (const move of possibleMoves) {
            let tile = Tile.get(move)
            tile.possibleMove = true;
            tile.enemyPieces = [...move.enemyPieces];
        }
    }
    
}