Util = {};

Util.shuffleArray = function (array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
};

Util.maxByMetric = function (array, keyfunction) {
    console.assert(array.length >= 1);
    let besti = 0;
    let bestk = keyfunction(array[0]);
    for (let i = 1; i < array.length; ++i) {
        let k = keyfunction(array[i]);
        if (k > bestk) {
            bestk = k;
            besti = i;
        }
    }
    return array[besti];
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

Util.neighborsOf = function (position) {
    var result = [];
    if (position.x > 0) result.push({ x: position.x-1, y: position.y });
    if (position.x < 5) result.push({ x: position.x+1, y: position.y });
    if (position.y > 0) result.push({ x: position.x, y: position.y-1 });
    if (position.y < 5) result.push({ x: position.x, y: position.y+1 });
    return result;
};

Util.notme = function (who) {
    console.assert(who === 'ai' || who === 'human');
    return (who === 'ai') ? 'human' : 'ai';
};

Util.isHumanStartPosition = function (position) {
    return 1 <= position.x && position.x <= 4 &&
           4 <= position.y && position.y <= 5;
};

Util.isAIStartPosition = function (position) {
    return 1 <= position.x && position.x <= 4 &&
           0 <= position.y && position.y <= 1;
};

Util.isGoalFor = function (who, position) {
    console.assert(who === 'ai' || who === 'human');
    if (who === 'ai') {
        return (position.x === 0 || position.x === 5) && (position.y === 5);
    } else {
        return (position.x === 0 || position.x === 5) && (position.y === 0);
    }
};

Util.distanceToGoalFor = function (who, position) {
    console.assert(who === 'ai' || who === 'human');
    let horizontal = (position.x <= 2) ? position.x : (5 - position.x);
    let vertical = (who === 'human') ? position.y : (5 - position.y);
    return horizontal + vertical;
};
