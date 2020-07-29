function AIPlayer() {
}

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
