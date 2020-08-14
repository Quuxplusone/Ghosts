function HTMLActuator() {
    this.tileContainer = document.querySelector(".tile-container");
    this.messageContainer = document.querySelector(".game-message");
    this.capturedByAIContainer = document.querySelector(".captured-by-ai-container");
    this.capturedByHumanContainer = document.querySelector(".captured-by-human-container");
}

HTMLActuator.prototype.actuate = function (grid, metadata) {
    var self = this;

    window.requestAnimationFrame(function () {
        self.clearContainer(self.tileContainer);
        self.clearContainer(self.capturedByHumanContainer);
        self.clearContainer(self.capturedByAIContainer);

        grid.cells.forEach(function (column) {
            column.forEach(function (cell) {
                console.assert(cell);
                self.addTile(cell);
            });
        });

        for (var i=0; i < 7; ++i) {
            let piece = document.createElement("div");
            piece.classList.add("captured-piece");
            if (i < grid.capturedByAI.length) {
                piece.classList.add(`${grid.capturedByAI[i]}-ghost`);
            } else {
                piece.classList.add("no-ghost");
            }
            self.capturedByAIContainer.appendChild(piece);
        }

        for (var i=6; i >= 0; --i) {
            let piece = document.createElement("div");
            piece.classList.add("captured-piece");
            if (i < grid.capturedByHuman.length) {
                piece.classList.add(`${grid.capturedByHuman[i]}-ghost`);
            } else {
                piece.classList.add("no-ghost");
            }
            self.capturedByHumanContainer.appendChild(piece);
        }

        if (metadata.lost) {
            self.messageContainer.classList.add("game-lost");
            self.messageContainer.getElementsByTagName("p")[0].textContent = "You lose!";
        } else if (metadata.won) {
            self.messageContainer.classList.add("game-won");
            self.messageContainer.getElementsByTagName("p")[0].textContent = "You win!";
        }
    });
};

HTMLActuator.prototype.clearContainer = function (container) {
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
};

HTMLActuator.prototype.addTile = function (tile) {
    var self = this;

    var wrapper   = document.createElement("div");
    var inner     = document.createElement("div");
    var position  = { x: tile.x, y: tile.y };
    var positionClass = this.positionClass(tile.previousPosition ? tile.previousPosition : position);

    var appearanceClasses = [ this.valueClass(tile) ];

    if (tile.highlightType !== null) {
        appearanceClasses.push("tile-highlighted-" + tile.highlightType);
        if (tile.selectedDirection !== null) {
            appearanceClasses.push("tile-bounce-" + tile.selectedDirection);
        }
    }

    // We can't use classlist because it somehow glitches when replacing classes
    var classes = ["tile", positionClass].concat(appearanceClasses);

    inner.classList.add("tile-inner");

    if (tile.previousPosition !== null) {
        // Make sure that the tile gets rendered in the previous position first
        tile.previousPosition = null;
        this.applyClasses(wrapper, classes);
        window.requestAnimationFrame(function () {
            self.applyClasses(wrapper, classes);
            window.requestAnimationFrame(function () {
                classes[1] = self.positionClass({ x: tile.x, y: tile.y });
                self.applyClasses(wrapper, classes); // Update the position
            });
        });
    } else {
        this.applyClasses(wrapper, classes);
    }

    // Add the inner part of the tile to the wrapper
    wrapper.appendChild(inner);

    // Put the tile on the board
    this.tileContainer.appendChild(wrapper);
};

HTMLActuator.prototype.applyClasses = function (element, classes) {
    element.setAttribute("class", classes.join(" "));
};

HTMLActuator.prototype.normalizePosition = function (position) {
    return { x: position.x + 1, y: position.y + 1 };
};

HTMLActuator.prototype.positionClass = function (position) {
    position = this.normalizePosition(position);
    return "tile-position-" + position.x + "-" + position.y;
};

HTMLActuator.prototype.valueClass = function (tile) {
    if (tile.owner === null) {
        return "empty-cell";
    } else if (tile.owner == 'ai') {
        if (!window.cheat) {
            return "enemy-ghost";
        } else if (tile.color == 'red') {
            return "cheat-enemy-red-ghost";
        } else {
            return "cheat-enemy-blue-ghost";
        }
    } else if (tile.color == 'red') {
        return "red-ghost";
    } else {
        return "blue-ghost";
    }
};

HTMLActuator.prototype.clearMessage = function () {
    // IE only takes one value to remove at a time.
    this.messageContainer.classList.remove("game-won");
    this.messageContainer.classList.remove("game-lost");
};
