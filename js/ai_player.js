function AIPlayer() {
}

AIPlayer.newGame = function () {
    var self = new AIPlayer();
    let n = null;
    self.estimatedBlueness = [
        [n,n,n,n,n,n],
        [n,n,n,n,0,0],
        [n,n,n,n,0,0],
        [n,n,n,n,0,0],
        [n,n,n,n,0,0],
        [n,n,n,n,n,n],
    ];
    return self;
};

AIPlayer.fromPreviousState = function (previousState) {
    var self = new AIPlayer();
    self.estimatedBlueness = previousState.estimatedBlueness;
    return self;
};

AIPlayer.prototype.serialize = function () {
    return {
        estimatedBlueness: this.estimatedBlueness,
    };
};

AIPlayer.prototype.observeHumanMove = function (gameManager, source, target) {
    console.assert(this.estimatedBlueness[source.x][source.y] !== null);
    console.assert(this.estimatedBlueness[target.x][target.y] === null);
    this.estimatedBlueness[target.x][target.y] = this.estimatedBlueness[source.x][source.y];
    this.estimatedBlueness[source.x][source.y] = null;

    var targetA = gameManager.grid.adjacentAIPieces(target);
    var sourceA = gameManager.grid.adjacentAIPieces(source);
    var movedForward = (target.y == source.y - 1);
    var movedSideways = (target.y == source.y);
    var reachedLastTwoRows = (target.y <= 1);

    if (movedForward && reachedLastTwoRows && (targetA > sourceA)) {
        // The piece moved riskily forward into proximity of the goal.
        this.estimatedBlueness[target.x][target.y] += 4.5;
    } else if (movedForward && (targetA > sourceA)) {
        this.estimatedBlueness[target.x][target.y] -= 1.5;
    } else if (movedSideways && (targetA > sourceA)) {
        this.estimatedBlueness[target.x][target.y] -= 1.0;
    } else if (movedForward && (sourceA >= 1) && (targetA == 0)) {
        this.estimatedBlueness[target.x][target.y] += 4.0;
    } else if (!movedForward && (sourceA >= 1) && (targetA == 0)) {
        this.estimatedBlueness[target.x][target.y] += 1.5;
    } else if (reachedLastTwoRows && (sourceA == 0) && (targetA == 0)) {
        this.estimatedBlueness[target.x][target.y] += 10.0;
    }

    // Now, for each threatened piece that DIDN'T move, increase its redness.
    for (var x=0; x < 6; ++x) {
        for (var y=0; y < 6; ++y) {
            if (x == target.x && y == target.y) {
                continue;
            }
            if (this.estimatedBlueness[x][y] !== null) {
                if (gameManager.grid.adjacentAIPieces({x: x, y: y}) >= 1) {
                    this.estimatedBlueness[x][y] -= 1.2;
                }
            }
        }
    }
};

AIPlayer.prototype.allValidMoves = function (gameManager) {
    var moves = [];
    for (var x=0; x < 6; ++x) {
        for (var y=0; y < 6; ++y) {
            for (var direction=0; direction < 4; ++direction) {
                var source = {x: x, y: y};
                var target = Util.addDirection(source, direction);
                if (gameManager.isLegalMoveForAI(source, direction)) {
                    moves.push({
                        source: source,
                        direction: direction,
                        target: target,
                        makesCapture: (gameManager.grid.at(target).owner === 'human'),
                        advancesSouthward: (direction == 2),
                    });
                }
            }
        }
    }
    return moves;
};

AIPlayer.prototype.compareMoves = function (a, b) {
    if (a.makesCapture != b.makesCapture) {
        return (a.makesCapture ? -1 : +1);
    }
    if (a.advancesSouthward != b.advancesSouthward) {
        return (a.advancesSouthward ? -1 : +1);
    }
    return 0;
};

AIPlayer.prototype.mightPreventWin = function (a) {
    if (!a.makesCapture) {
        return false;
    }
    return (a.target.x == 0 && (a.target.y == 1 || a.target.y == 4)) ||
           (a.target.x == 1 && (a.target.y == 0 || a.target.y == 5));
};

AIPlayer.prototype.chooseMove = function (gameManager) {
    var moves = this.allValidMoves(gameManager);
    Util.shuffleArray(moves);
    moves.sort(this.compareMoves);  // stable sort good moves toward the front
    if (this.mightPreventWin(moves[0])) {
        return moves[0];
    }
    var i = Math.floor(Math.sqrt(Math.random() * moves.length * moves.length));
    return moves[i];
};
