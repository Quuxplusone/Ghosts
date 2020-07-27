function GameManager(InputManager, Actuator, StorageManager) {
  this.size           = 6; // Size of the grid
  this.inputManager   = new InputManager;
  this.storageManager = new StorageManager("ghosts");
  this.actuator       = new Actuator;

  this.inputManager.on("arrow", this.arrow.bind(this));
  this.inputManager.on("enter", this.enter.bind(this));
  this.inputManager.on("click", this.click.bind(this));
  this.inputManager.on("swipe", this.swipe.bind(this));
  this.inputManager.on("restart", this.restart.bind(this));

  this.setup();
}

// Restart the game
GameManager.prototype.restart = function () {
  this.storageManager.clearGameState();
  this.actuator.continueGame(); // Clear the game won/lost message
  this.setup();
};

// Return true if the game is over
GameManager.prototype.isGameTerminated = function () {
    return this.lost || this.won;
};

// Set up the game
GameManager.prototype.setup = function () {
  var previousState = this.storageManager.getGameState();

  // Reload the game from a previous game if present
  if (previousState) {
    this.grid = new Grid(previousState.grid.size, previousState.grid.cells);
    this.lost = previousState.lost;
    this.won = previousState.won;
    this.keepPlaying = previousState.keepPlaying;
    this.capturedGhosts = previousState.capturedGhosts;
  } else {
    this.grid = new Grid(this.size);
    this.lost = false;
    this.won = false;
    this.capturedGhosts = [];

    // Add the initial tiles
    this.addStartTiles();
  }

  // Input UI states:
  // 0: Still stepping the "selected tile" highlight region around the screen.
  // 1: Have actually selected a tile (with one of my ghosts on it).
  // 2: Have indicated the (valid) direction in which to move that ghost.
  // The next step is to confirm the move, which puts us back into state 0.
  this.inputState = 0;
  this.highlightedTile = {x: 2, y: 2};
  this.selectedDirection = null;

  // Update the actuator
  this.actuate();
};

GameManager.prototype.shuffleArray = function(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Set up the initial tiles to start the game with
GameManager.prototype.addStartTiles = function () {
    var pieces = ['blue', 'blue', 'blue', 'blue', 'red', 'red', 'red', 'red'];
    this.shuffleArray(pieces);
    this.grid.insertTile(new Tile({x: 1, y: 5}, pieces[0], 'human'));
    this.grid.insertTile(new Tile({x: 2, y: 5}, pieces[1], 'human'));
    this.grid.insertTile(new Tile({x: 3, y: 5}, pieces[2], 'human'));
    this.grid.insertTile(new Tile({x: 4, y: 5}, pieces[3], 'human'));
    this.grid.insertTile(new Tile({x: 1, y: 4}, pieces[4], 'human'));
    this.grid.insertTile(new Tile({x: 2, y: 4}, pieces[5], 'human'));
    this.grid.insertTile(new Tile({x: 3, y: 4}, pieces[6], 'human'));
    this.grid.insertTile(new Tile({x: 4, y: 4}, pieces[7], 'human'));
    this.shuffleArray(pieces);
    this.grid.insertTile(new Tile({x: 1, y: 0}, pieces[0], 'ai'));
    this.grid.insertTile(new Tile({x: 2, y: 0}, pieces[1], 'ai'));
    this.grid.insertTile(new Tile({x: 3, y: 0}, pieces[2], 'ai'));
    this.grid.insertTile(new Tile({x: 4, y: 0}, pieces[3], 'ai'));
    this.grid.insertTile(new Tile({x: 1, y: 1}, pieces[4], 'ai'));
    this.grid.insertTile(new Tile({x: 2, y: 1}, pieces[5], 'ai'));
    this.grid.insertTile(new Tile({x: 3, y: 1}, pieces[6], 'ai'));
    this.grid.insertTile(new Tile({x: 4, y: 1}, pieces[7], 'ai'));
    for (var x = 0; x < 6; ++x) {
        for (var y = 0; y < 6; ++y) {
            if ((1 <= x && x <= 4) && (y <= 1 || y >= 4)) {
                continue;
            }
            this.grid.insertTile(new Tile({x: x, y: y}, null, null));
        }
    }
};

// Sends the updated grid to the actuator
GameManager.prototype.actuate = function () {
    if (this.won || this.lost) {
        this.storageManager.clearGameState();
    } else {
        this.storageManager.setGameState(this.serialize());
    }

    this.actuator.actuate(this.grid, {
        lost:       this.lost,
        won:        this.won,
        terminated: this.isGameTerminated(),
    });
};

// Represent the current game as an object
GameManager.prototype.serialize = function () {
  return {
    grid:        this.grid.serialize(),
    lost:        this.lost,
    won:         this.won,
  };
};

GameManager.prototype.arrow = function (direction) {
    if (this.isGameTerminated()) return; // Don't do anything if the game's over

    // Input UI states:
    // 0: Still stepping the "selected tile" highlight region around the screen.
    // 1: Have actually selected a tile (with one of my ghosts on it).
    // 2: Have indicated the (valid) direction in which to move that ghost.
    // The next step is to confirm the move, which puts us back into state 0.
    if (this.inputState == 0) {
        var [dx, dy] = this.getVector(direction);
        this.highlightedTile.x = Math.min(0, Math.max(this.highlightedTile.x + dx, 5));
        this.highlightedTile.y = Math.min(0, Math.max(this.highlightedTile.y + dy, 5));
    } else if (this.inputState == 1) {
        var [dx, dy] = this.getVector(direction);
        var sx = this.highlightedTile.x + dx;
        var sy = this.highlightedTile.y + dy;
        if (0 <= sx && sx <= 5 && 0 <= sy && sy <= 5) {
            var tile = self.grid.cellContent({x: sx, y: sy});
            if (tile.owner != 'human') {
                this.selectedDirection = direction;
                this.inputState = 2;
            }
        } else {
            // remain in state 1
        }
    } else if (this.inputState == 2) {
        this.selectedDirection = null;
        this.inputState = 0;
    }
    self.grid.highlightTile(this.highlightedTile, this.selectedDirection);
};

GameManager.prototype.enter = function (dummy) {
    if (this.isGameTerminated()) return; // Don't do anything if the game's over

    // Input UI states:
    // 0: Still stepping the "selected tile" highlight region around the screen.
    // 1: Have actually selected a tile (with one of my ghosts on it).
    // 2: Have indicated the (valid) direction in which to move that ghost.
    // The next step is to confirm the move, which puts us back into state 0.
    if (this.inputState === 0) {
        var tile = self.grid.cellContent(this.highlightedTile);
        if (tile.owner === 'human') {
            this.inputState = 1;
        }
    } else if (this.inputState === 1) {
        this.inputState = 0;
    } else if (this.inputState === 2) {
        this.commitMove(this.highlightedTile, this.selectedDirection);
    }
    self.grid.highlightTile(this.highlightedTile, this.selectedDirection);
};

GameManager.prototype.click = function (position) {
    if (this.isGameTerminated()) return; // Don't do anything if the game's over
    if (this.inputState === 0) {
        var tile = self.grid.cellContent(position);
        if (tile.owner === 'human') {
            this.highlightedTile = {x: position.x, y: position.y};
            this.inputState = 1;
        }
    } else if (this.inputState === 1) {
        var hx = this.highlightedTile.x;
        var hy = this.highlightedTile.y;
        if (this.positionsEqual(position, {x: hx+1, y: hy})) {
            this.selectedDirection = 1;
        } else if (this.positionsEqual(position, {x: hx-1, y: hy})) {
            this.selectedDirection = 3;
        } else if (this.positionsEqual(position, {x: hx, y: hy+1})) {
            this.selectedDirection = 2;
        } else if (this.positionsEqual(position, {x: hx, y: hy-1})) {
            this.selectedDirection = 0;
        } else {
            this.highlightedTile = position;
            this.inputState = 0;
        }
    } else if (this.inputState === 2) {
        var [dx, dy] = this.getVector(this.selectedDirection);
        var target = {x: this.highlightedTile.x + dx, y: this.highlightedTile.y + dy};
        if (this.positionsEqual(position, target)) {
            this.commitMove(this.highlightedTile, this.selectedDirection);
        }
    }
};

GameManager.prototype.swipe = function (position_and_direction) {
    if (this.isGameTerminated()) return; // Don't do anything if the game's over
};

// Move tiles on the grid in the specified direction
GameManager.prototype.commitMove = function (source, direction) {
    // 0: up, 1: right, 2: down, 3: left

    var [dx, dy] = this.getVector(direction);
    var target = {x: source.x + dx, y: source.y + dy};
    console.assert(this.grid.withinBounds(source));
    console.assert(this.grid.withinBounds(target));
    var sourceTile = this.grid.cellContents(source);
    var targetTile = this.grid.cellContents(target);
    console.assert(sourceTile.owner === 'human');
    console.assert(targetTile.owner !== 'human');
    if (targetTile.owner === 'ai') {
        this.capturedGhosts.push(targetTile.color);
    }
    targetTile.color = sourceTile.color;
    targetTile.owner = sourceTile.owner;
    targetTile.previousPosition = sourceTile.position;
    sourceTile.owner = null;
    sourceTile.color = null;

    if (targetTile.isExit() && targetTile.color === 'blue') {
        self.won = true;
    }
    if (this.capturedGhosts.filter(function(c){ return c === 'blue'; }).length === 4) {
        self.won = true;
    }
    if (this.capturedGhosts.filter(function(c){ return c === 'red'; }).length === 4) {
        self.lost = true;
    }

    var [dx, dy] = this.getVector(this.selectedDirection);
    this.highlightedTile.x = Math.min(0, Math.max(this.highlightedTile.x + dx, 5));
    this.highlightedTile.y = Math.min(0, Math.max(this.highlightedTile.y + dy, 5));
    this.selectedDirection = null;
    this.inputState = 0;
    this.actuate();
};

// Get the vector representing the chosen direction
GameManager.prototype.getVector = function (direction) {
  // Vectors representing tile movement
  var map = {
    0: { x: 0,  y: -1 }, // Up
    1: { x: 1,  y: 0 },  // Right
    2: { x: 0,  y: 1 },  // Down
    3: { x: -1, y: 0 }   // Left
  };

  return map[direction];
};

GameManager.prototype.positionsEqual = function (first, second) {
  return first.x === second.x && first.y === second.y;
};
