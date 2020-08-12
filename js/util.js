Util = {};

Util.shuffleArray = function(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
};

Util.getVector = function (direction) {
    var map = {
        0: { x: 0,  y: -1 }, // Up
        1: { x: 1,  y: 0 },  // Right
        2: { x: 0,  y: 1 },  // Down
        3: { x: -1, y: 0 }   // Left
    };
    return map[direction];
};

Util.addDirection = function (source, direction) {
    var d = Util.getVector(direction);
    return {
        x: source.x + d.x,
        y: source.y + d.y,
    };
};

Util.positionsEqual = function (first, second) {
    return first.x === second.x && first.y === second.y;
};

Util.isWithinBounds = function (position) {
    return 0 <= position.x && position.x <= 5 &&
           0 <= position.y && position.y <= 5;
};

Util.isHumanStartPosition = function (position) {
    return 1 <= position.x && position.x <= 4 &&
           4 <= position.y && position.y <= 5;
};

Util.isAIStartPosition = function (position) {
    return 1 <= position.x && position.x <= 4 &&
           0 <= position.y && position.y <= 1;
};