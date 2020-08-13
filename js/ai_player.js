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

    var targetA = gameManager.grid.adjacentPieces(target, 'ai');
    var sourceA = gameManager.grid.adjacentPieces(source, 'ai');
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
                if (gameManager.grid.adjacentPieces({x: x, y: y}, 'ai') >= 1) {
                    this.estimatedBlueness[x][y] -= 1.2;
                }
            }
        }
    }
};

AIPlayer.prototype.allValidMovesForAI = function (gameManager) {
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
                    });
                }
            }
        }
    }
    return moves;
};

AIPlayer.prototype.positionDependentBlueness = function () {
    var result = [
        [0.0,5.4,1.4,0.4,0.4,0.4],
        [5.2,1.4,1.0,0.1,0.1,0.1],
        [5.0,1.0,0.0,0.0,0.0,0.0],
        [5.0,1.0,0.0,0.0,0.0,0.0],
        [5.2,1.4,1.0,0.1,0.1,0.1],
        [0.0,5.4,1.4,0.4,0.4,0.4],
    ];
    for (var x=0; x < 6; ++x) {
        for (var y=0; y < 6; ++y) {
            if (this.estimatedBlueness[x][y] === null) {
                result[x][y] = null;
            } else {
                result[x][y] += this.estimatedBlueness[x][y];
            }
        }
    }
    return result;
};

AIPlayer.prototype.distanceToAIGoal = function (position) {
    if (position.x <= 2) {
        return (5 - position.y) + position.x;
    } else {
        return (5 - position.y) + (5 - position.x);
    }
};

AIPlayer.prototype.moveWins = function (m, grid) {
    if (grid.at(m.source).color === 'blue') {
        if (this.distanceToAIGoal(m.target) == 0) {
            return 0;
        }
        if (this.distanceToAIGoal(m.target) == 1) {
            if (grid.adjacentPieces(m.target, 'human') == 0) {
                return 1;
            }
        }
    }
    return null;
};

AIPlayer.prototype.movePlacesGoalkeeper = function (m) {
    return (m.target.y == 1) && (m.target.x == 1 || m.target.x == 4);
};

AIPlayer.prototype.moveAbandonsGoalkeeping = function (m) {
    return (m.source.y == 1) && (m.source.x == 1 || m.source.x == 4);
};

AIPlayer.prototype.moveProtectsMyBlue = function (m, grid) {
    if (grid.at(m.source).color === 'blue') {
        if (grid.adjacentPieces(m.source, 'human') >= 1 && grid.adjacentPieces(m.target, 'human') == 0) {
            return true;
        }
    }
    return false;
};

AIPlayer.prototype.moveCapturesEstimatedBluePiece = function (m, grid, blueness) {
    var eb = blueness[m.target.x][m.target.y];
    if (eb !== null) {
        var estimates = blueness.flat().filter(e => (e !== null));
        estimates.sort();
        var bluesLeft = grid.humanPiecesRemaining('blue');
        var redsLeft = grid.humanPiecesRemaining('red');
        var threshold = [
            [0, 0, 0, 0, 0],
            [0, 1, 1, 2, 3],
            [0, 1, 2, 3, 3],
            [0, 2, 3, 4, 5],
            [0, 3, 4, 6, 7],
        ][bluesLeft][redsLeft];
        if (eb >= estimates[8 - threshold]) {
            return eb;
        }
    }
    return null;
};

AIPlayer.prototype.moveAdvancesForward = function (m) {
    var movesForward = (m.target.y == m.source.y + 1);
    var movesSideways = (m.target.y == m.source.y);
    if (movesForward) {
        return 25 - m.target.y;
    } else if (movesSideways) {
        return 15 - m.target.y;
    } else {
        return 5 - m.target.y;
    }
};

AIPlayer.prototype.chooseMove = function (gameManager) {
    var m = this.chooseMoveToObserve(gameManager);

    // If this move captures a human piece, update its estimated blueness.
    console.assert(this.estimatedBlueness[m.source.x][m.source.y] === null);
    this.estimatedBlueness[m.target.x][m.target.y] = null;

    return m;
};

AIPlayer.prototype.chooseMoveToObserve = function (gameManager) {
    var self = this;
    var moves = this.allValidMovesForAI(gameManager);
    var grid = gameManager.grid;
    var blueness = this.positionDependentBlueness();

    Util.shuffleArray(moves);

    // Return the move that's guaranteed to win the quickest.
    var winningMoves = moves.filter(m => (self.moveWins(m, grid) !== null));
    if (winningMoves.length >= 1) {
        return Util.maxByMetric(winningMoves, m => -self.moveWins(m, grid));
    }

    // Protect our sole remaining blue piece.
    if (grid.aiPiecesRemaining('blue') === 1) {
        var protectingMoves = moves.filter(m => self.moveProtectsMyBlue(m, grid));
        if (protectingMoves.length >= 1) {
            return protectingMoves[0];
        }
    }

    // Capture an estimated blue piece.
    var capturingMoves = moves.filter(m => (self.moveCapturesEstimatedBluePiece(m, grid, blueness) !== null));
    if (capturingMoves.length >= 1) {
        return Util.maxByMetric(capturingMoves, m => self.moveCapturesEstimatedBluePiece(m, grid, blueness));
    }

    if (grid.capturedByHuman.length <= 4) {
        var goalkeepingMoves = moves.filter(m => self.movePlacesGoalkeeper(m));
        if (goalkeepingMoves >= 1) {
            return goalkeepingMoves[0];
        }
    }

    if (grid.capturedByHuman.length <= 4) {
        moves = moves.filter(m => !self.moveAbandonsGoalkeeping(m));
    }
    return Util.maxByMetric(moves, m => self.moveAdvancesForward(m));
};
