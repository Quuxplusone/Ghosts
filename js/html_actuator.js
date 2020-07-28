function HTMLActuator() {
    this.tileContainer    = document.querySelector(".tile-container");
    this.messageContainer = document.querySelector(".game-message");
}

HTMLActuator.prototype.actuate = function (grid, metadata) {
  var self = this;

  window.requestAnimationFrame(function () {
    self.clearContainer(self.tileContainer);

    grid.cells.forEach(function (column) {
      column.forEach(function (cell) {
        if (cell) {
          self.addTile(cell);
        }
      });
    });

    if (metadata.terminated) {
      if (metadata.lost) {
        self.message(false); // You lose
      } else if (metadata.won) {
        self.message(true); // You win!
      }
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

  var appearanceClasses = this.appearanceClasses(tile);

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
    console.log('before', tile);
    tile.previousPosition = null;
    this.applyClasses(wrapper, classes);
    window.requestAnimationFrame(function () {
      self.applyClasses(wrapper, classes);
      window.requestAnimationFrame(function () {
        console.log('raf', tile);
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
        return "enemy-ghost";
    } else if (tile.color == 'red') {
        return "red-ghost";
    } else {
        return "blue-ghost";
    }
};

HTMLActuator.prototype.appearanceClasses = function (tile) {
  return [this.valueClass(tile)];
};

HTMLActuator.prototype.message = function (won) {
  var type    = won ? "game-won" : "game-lost";
  var message = won ? "You win!" : "You lose!";

  this.messageContainer.classList.add(type);
  this.messageContainer.getElementsByTagName("p")[0].textContent = message;
};

HTMLActuator.prototype.clearMessage = function () {
  // IE only takes one value to remove at a time.
  this.messageContainer.classList.remove("game-won");
  this.messageContainer.classList.remove("game-lost");
};
