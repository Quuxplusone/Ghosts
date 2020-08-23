function AIPlayer() {
}

AIPlayer.winningPatterns = {
    '0 2 -> 0 3': [
        [['??????',
          '??????',
          'B?????',
          '*F????',
          '.FF???',
          '.F????'], 3],
        [['??????',
          '??????',
          'R?????',
          'hF????',
          '.BF???',
          '.F????'], 3],
    ],
    '0 3 -> 0 4': [
        [['??????',
          '??????',
          '??????',
          'B?????',
          '*F????',
          '.?????'], 2],
    ],
    '0 4 -> 0 5': [
        [['??????',
          '??????',
          '??????',
          '??????',
          'B?????',
          '.?????'], 1],
    ],
    '0 4 -> 1 4': [
        [['??????',
          '??????',
          'F?????',
          'BF????',
          'RhF???',
          '.F????'], 3],
    ],
    '1 2 -> 0 2': [
        [['??????',
          'F?????',
          '*B????',
          '.FF???',
          '.FFF??',
          '.FF???'], 4],
    ],
    '1 2 -> 1 3': [
        [['??????',
          '??????',
          'FA????',
          'B*F???',
          '.hF???',
          '.FF???'], 3],
        [['??????',
          'F?????',
          'BA????',
          '.hF???',
          '.FF???',
          '.F????'], 4],
        [['??????',
          '??????',
          'FB????',
          '.*F???',
          '.FFF??',
          '.FF???'], 4],
    ],
    '1 3 -> 0 3': [
        [['??????',
          '??????',
          'F?????',
          'hA????',
          '.BF???',
          '.F????'], 3],
        [['??????',
          '??????',
          'F?????',
          '*B????',
          '.FF???',
          '.F????'], 3],
    ],
    '1 3 -> 1 4': [
        [['??????',
          '??????',
          'F?????',
          'BA????',
          '.hF???',
          '.F????'], 3],
        [['??????',
          '??????',
          'F?????',
          'FB????',
          '.*F???',
          '.F????'], 3],
        [['??????',
          '??????',
          '??????',
          '?B????',
          'F*F???',
          '..FF??'], 3],
        [['??????',
          '??????',
          'F?????',
          'FB????',
          'h*B???',
          '.F????'], 4],
    ],
    '1 4 -> 0 4': [
        [['??????',
          '??????',
          '??????',
          'F?????',
          '*B????',
          '.?????'], 2],
    ],
    '1 4 -> 1 5': [
        [['??????',
          '??????',
          '??????',
          '??????',
          '?B????',
          '.*F???'], 2],
    ],
    '1 5 -> 0 5': [
        [['??????',
          '??????',
          '??????',
          '??????',
          '??????',
          '.B????'], 1],
    ],
    '2 3 -> 1 3': [
        [['??????',
          'F?????',
          'FF????',
          'B*A???',
          '.hFF??',
          '.FF???'], 4],
    ],
    '2 3 -> 2 4': [
        [['??????',
          'F?????',
          'FF????',
          'BFA???',
          '.h*F??',
          '.FF???'], 4],
    ],
    '2 4 -> 1 4': [
        [['??????',
          '??????',
          'F?????',
          'BF????',
          '.hA???',
          '.F????'], 3],
    ],
    '2 5 -> 1 5': [
        [['??????',
          '??????',
          '??????',
          '??????',
          '?F????',
          '.*B???'], 2],
    ],
};

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

    // If this piece declined to move into the goal, it must be red.
    if (Util.distanceToGoalFor('human', source) === 1) {
        this.estimatedBlueness[target.x][target.y] = -1000.0;
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
                if (Util.distanceToGoalFor('human', {x: x, y: y}) === 1) {
                    this.estimatedBlueness[x][y] = -1000.0;
                }
            }
        }
    }
};

AIPlayer.prototype.legalMoves = function (grid) {
    var moves = [];
    for (var x=0; x < 6; ++x) {
        for (var y=0; y < 6; ++y) {
            for (var direction=0; direction < 4; ++direction) {
                var source = {x: x, y: y};
                var target = Util.addDirection(source, direction);
                if (grid.isLegalMove(source, direction)) {
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

AIPlayer.prototype.flipPattern = function (p) {
    return p.map(s => s.split("").reverse().join(""));
};

AIPlayer.prototype.patternMatches = function (p, grid) {
    for (var x=0; x < 6; ++x) {
        for (var y=0; y < 6; ++y) {
            let pat = p[y][x];
            let tile = grid.at({x: x, y: y});
            if (pat == '?') {
                // ok so far
            } else if (pat === 'h') {
                if (tile.owner !== 'human') return false;
            } else if (pat === 'A') {
                if (tile.owner !== 'ai') return false;
            } else if (pat === 'F') {  // "friendly"
                if (tile.owner === 'human') return false;
            } else if (pat === '*') {  // "target"
                if (tile.owner === 'ai') return false;
            } else if (pat === 'R') {
                if (tile.owner !== 'ai') return false;
                if (tile.color !== 'red') return false;
            } else if (pat === 'B') {
                if (tile.owner !== 'ai') return false;
                if (tile.color !== 'blue') return false;
            } else if (pat === '.') {
                if (tile.owner !== null) return false;
            } else {
                console.assert(false);
            }
        }
    }
    return true;
};

AIPlayer.prototype.moveWins = function (m, grid) {
    var patterns = AIPlayer.winningPatterns;

    let key = `${m.source.x} ${m.source.y} -> ${m.target.x} ${m.target.y}`;
    for (var p of patterns[key] || []) {
        if (this.patternMatches(p[0], grid)) {
            return p[1];
        }
    }

    key = `${5 - m.source.x} ${m.source.y} -> ${5 - m.target.x} ${m.target.y}`;
    for (var p of patterns[key] || []) {
        if (this.patternMatches(this.flipPattern(p[0]), grid)) {
            return p[1];
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

AIPlayer.prototype.moveAdvancesForward = function (m, grid) {
    var sourceDistance = Util.distanceToGoalFor('ai', m.source);
    var targetDistance = Util.distanceToGoalFor('ai', m.target);
    if (targetDistance === 1 && grid.at(m.source).color === 'red') {
        // Try not to step in the way of a blue piece on its way to victory.
        return 5 - m.target.y;
    }
    if (targetDistance < sourceDistance) {
        return 25 - m.target.y;
    } else if (targetDistance == sourceDistance) {
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
    var grid = gameManager.grid;
    var moves = this.legalMoves(grid);
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

    // Reposition the goalkeepers, at least if the game is still in the "first half."
    if (grid.capturedByHuman.length <= 4) {
        var goalkeepingMoves = moves.filter(m => self.movePlacesGoalkeeper(m));
        if (goalkeepingMoves >= 1) {
            return goalkeepingMoves[0];
        }
    }

    // Move a trailing piece forward toward the goal.
    if (grid.capturedByHuman.length <= 3) {
        moves = moves.filter(m => !self.moveAbandonsGoalkeeping(m));
    }
    return Util.maxByMetric(moves, m => self.moveAdvancesForward(m, grid));
};
