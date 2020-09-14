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
          'A?????',
          'hF????',
          '.BF???',
          '.F????'], 3],
        [['??????',
          '??????',
          'B?????',
          '*F????',
          '.1????',
          '.?????'], 3],
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
          'A*F???',
          '.F????'], 3],
        [['??????',
          '??????',
          'F?????',
          'BF????',
          '1*????',
          '.?????'], 3],
    ],
    '1 2 -> 0 2': [
        [['??????',
          'F?????',
          '*B????',
          '.FF???',
          '.FFF??',
          '.FF???'], 4],
        [['??????',
          'F?????',
          '*B????',
          '.FF???',
          '.1????',
          '.?????'], 4],
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
        [['??????',
          '??????',
          'F?????',
          '*B????',
          '.1????',
          '.?????'], 3],
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
        [['??????',
          'F?????',
          'FF????',
          'B*1???',
          '.h????',
          '.?????'], 4],
    ],
    '2 3 -> 2 4': [
        [['??????',
          'F?????',
          'FF????',
          'BFA???',
          '.h*F??',
          '.FF???'], 4],
        [['??????',
          'F?????',
          'FF????',
          'BF1???',
          '.h*???',
          '.?????'], 4],
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
    let f = function () { return Math.random()*0.001; };
    self.estimatedBlueness = [
        [null, null, null, null, null, null],
        [null, null, null, null, f(),  f() ],
        [null, null, null, null, f(),  f() ],
        [null, null, null, null, f(),  f() ],
        [null, null, null, null, f(),  f() ],
        [null, null, null, null, null, null],
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

AIPlayer.prototype.updateBlueIndex = function (grid) {
    var blueness = this.positionDependentBlueness();
    var redsLeft = grid.humanPiecesRemaining('red');
    this.blueIndex = [
        [0,0,0,0,0,0],
        [0,0,0,0,0,0],
        [0,0,0,0,0,0],
        [0,0,0,0,0,0],
        [0,0,0,0,0,0],
        [0,0,0,0,0,0],
    ];
    for (var x=0; x < 6; ++x) {
        for (var y=0; y < 6; ++y) {
            var eb = blueness[x][y];
            if (eb === null) {
                this.blueIndex[x][y] = null;
            } else {
                let estimatesLessThanEB = blueness.flat().filter(e => (e !== null) && (e < eb)).length;
                this.blueIndex[x][y] = estimatesLessThanEB - redsLeft;
            }
        }
    }
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
            } else if (pat === '1') {
                if (grid.aiPiecesRemaining('red') !== 1) return false;
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

AIPlayer.prototype.humanPatternMatches = function (p, grid) {
    for (var x=0; x < 6; ++x) {
        for (var y=0; y < 6; ++y) {
            let pat = p[5 - y][x];
            let tile = grid.at({x: x, y: y});
            let isDefinitelyRed = (this.estimatedBlueness[x][y] < -900.0);
            if (pat == '?') {
                // ok so far
            } else if (pat === 'h') {
                if (tile.owner !== 'ai') return false;
            } else if (pat === 'A') {
                if (tile.owner !== 'human') return false;
            } else if (pat === 'F') {  // "friendly"
                if (tile.owner === 'ai') return false;
            } else if (pat === '*') {  // "target"
                if (tile.owner === 'human') return false;
            } else if (pat === '1') {
                if (grid.humanPiecesRemaining('red') !== 1) return false;
                if (tile.owner !== 'human') return false;
            } else if (pat === 'B') {
                if (tile.owner !== 'human') return false;
                if (isDefinitelyRed) return false;
            } else if (pat === '.') {
                if (tile.owner !== null) return false;
            } else {
                console.assert(false);
            }
        }
    }
    return true;
};

AIPlayer.prototype.moveProbablyLoses = function (m, grid) {
    var hgrid = grid.clone();
    hgrid.commitMove(m.source, m.target);
    // Now hgrid is what the human player will see.
    var best = 1000;
    var patterns = AIPlayer.winningPatterns;
    for (var hm of this.legalMoves(hgrid)) {
        let key = `${hm.source.x} ${5 - hm.source.y} -> ${hm.target.x} ${5 - hm.target.y}`;
        for (var p of patterns[key] || []) {
            if (this.humanPatternMatches(p[0], hgrid)) {
                best = Math.min(best, p[1]);
            }
        }

        key = `${5 - hm.source.x} ${5 - hm.source.y} -> ${5 - hm.target.x} ${5 - hm.target.y}`;
        for (var p of patterns[key] || []) {
            if (this.humanPatternMatches(this.flipPattern(p[0]), hgrid)) {
                best = Math.min(best, p[1]);
            }
        }
    }
    return (best === 1000) ? null : best;
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

AIPlayer.prototype.moveMaintainsGoalkeeping = function (m, grid) {
    if (m.source.y === 1 && (m.source.x === 1 || m.source.x === 4)) {
        // It's okay to step out of position if there's someone else behind you to step into it.
        return (grid.at({x: m.source.x, y: 0}).owner === 'ai');
    }
    return true;
};

AIPlayer.prototype.moveProtectsMyBlue = function (m, grid) {
    var hgrid = grid.clone();
    hgrid.commitMove(m.source, m.target);
    // Now hgrid is what the human player will see.
    for (var x=0; x < 6; ++x) {
        for (var y=0; y < 6; ++y) {
            let position = {x: x, y: y};
            let tile = hgrid.at(position);
            if (tile.owner === 'ai' && tile.color === 'blue') {
                return (hgrid.adjacentPieces(position, 'human') === 0);
            }
        }
    }
    console.assert(false);
    return true;
};

AIPlayer.prototype.moveCapturesEstimatedBluePiece = function (m, grid) {
    var i = this.blueIndex[m.target.x][m.target.y];
    if (i !== null) {
        var bluesLeft = grid.humanPiecesRemaining('blue');
        var redsLeft = grid.humanPiecesRemaining('red');
        // Notice that if the human has only one red left, we'll be conservative and raise our threshold;
        // if the human has many red left, we'll be reckless and lower it.
        var threshold = [
            [0, 0, 0, 0, 0],
            [0, 0, 0, -1, -2],
            [0, 1, 0, -1, -1],
            [0, 1, 0, -1, -2],
            [0, 1, 0, -2, -3],
        ][bluesLeft][redsLeft];
        if (i >= threshold) {
            return i;
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
        return 300 + targetDistance;
    } else if (targetDistance == sourceDistance) {
        return 200 + targetDistance;
    } else {
        return 100 + targetDistance;
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

    window.cheat_aiplayer = this;

    this.updateBlueIndex(grid);

    var moves = this.legalMoves(grid);
    Util.shuffleArray(moves);

    for (let m of moves) {
        m.probablyLoses = self.moveProbablyLoses(m, grid);
        m.wins = self.moveWins(m, grid);
        m.captures = grid.at(m.target).owner === 'human';
        if ((m.wins || 1000) <= (m.probablyLoses || 1000)) {
            // A move that wins a horse race doesn't actually lose.
            m.probablyLoses = null;
        }
    }

    // Look ahead to avoid losing by a silly move in the endgame.
    var nonlosingMoves = moves.filter(m => (m.probablyLoses === null));
    if (nonlosingMoves.length === 0) {
        // If all moves seem to lose, pick the move that might win the quickest and/or loses the slowest,
        // If winning, avoid unnecessary captures; if losing, prefer moves that capture.
        return Util.maxByMetric(moves, m => (m.wins ? 2*(1000 - m.wins) + !m.captures : 2*m.probablyLoses + m.captures));
    }
    moves = nonlosingMoves;

    // Return the move that's guaranteed to win the quickest.
    var winningMoves = moves.filter(m => (m.wins !== null));
    if (winningMoves.length >= 1) {
        return Util.maxByMetric(winningMoves, m => -m.wins);
    }

    // Protect our sole remaining blue piece.
    if (grid.aiPiecesRemaining('blue') === 1) {
        var protectingMoves = moves.filter(m => self.moveProtectsMyBlue(m, grid));
        if (protectingMoves.length >= 1) {
            moves = protectingMoves;
        }
    }

    // Capture an estimated blue piece.
    var capturingMoves = moves.filter(m => (self.moveCapturesEstimatedBluePiece(m, grid) !== null));
    if (capturingMoves.length >= 1) {
        return Util.maxByMetric(capturingMoves, m => self.moveCapturesEstimatedBluePiece(m, grid));
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
        var maintainingMoves = moves.filter(m => self.moveMaintainsGoalkeeping(m, grid));
        if (maintainingMoves.length >= 1) {
            moves = maintainingMoves;
        }
    }
    return Util.maxByMetric(moves, m => self.moveAdvancesForward(m, grid));
};
