function AIPlayer() {
}

AIPlayer.prototype.chooseMove = function (gameManager) {
    while (true) {
        var source = {
            x: Math.floor(Math.random() * 6),
            y: Math.floor(Math.random() * 6),
        };
        var direction = Math.floor(Math.random() * 4);
        if (gameManager.isLegalMoveForAI(source, direction)) {
            return {
                source: source,
                direction: direction,
            };
        }
    }
};
