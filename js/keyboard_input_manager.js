function KeyboardInputManager() {
  this.events = {};

  if (window.navigator.msPointerEnabled) {
    //Internet Explorer 10 style
    this.eventTouchstart    = "MSPointerDown";
    this.eventTouchmove     = "MSPointerMove";
    this.eventTouchend      = "MSPointerUp";
  } else {
    this.eventTouchstart    = "touchstart";
    this.eventTouchmove     = "touchmove";
    this.eventTouchend      = "touchend";
  }

  this.listen();
}

KeyboardInputManager.prototype.on = function (event, callback) {
    if (!this.events[event]) {
        this.events[event] = [];
    }
    this.events[event].push(callback);
};

KeyboardInputManager.prototype.emit = function (event, data) {
    console.log("emit(", event, ",", data, ")");
    var callbacks = this.events[event];
    if (callbacks) {
        callbacks.forEach(function (callback) {
            callback(data);
        });
    }
};

KeyboardInputManager.prototype.listen = function () {
  var self = this;

  var map = {
    38: 0, // Up
    39: 1, // Right
    40: 2, // Down
    37: 3, // Left
    75: 0, // Vim up
    76: 1, // Vim right
    74: 2, // Vim down
    72: 3, // Vim left
    87: 0, // W
    68: 1, // D
    83: 2, // S
    65: 3, // A
    13: 4, // Enter
  };

  // Respond to direction keys
  document.addEventListener("keydown", function (event) {
    var modifiers = event.altKey || event.ctrlKey || event.metaKey ||
                    event.shiftKey;
    var mapped    = map[event.which];

    // Ignore the event if it's happening in a text field
    if (self.targetIsInput(event)) return;

    if (!modifiers) {
        if (mapped === 4) {
            event.preventDefault();
            self.emit("enter", null);
        } else if (mapped !== undefined) {
            event.preventDefault();
            self.emit("arrow", mapped);
        }
    }

    // R key restarts the game
    if (!modifiers && event.which === 82) {
      self.restart.call(self, event);
    }
  });

  this.bindButtonPress(".tile-position-1-1", function (event) { this.emit("click", {x: 0, y: 0}); });
  this.bindButtonPress(".tile-position-1-2", function (event) { this.emit("click", {x: 0, y: 1}); });
  this.bindButtonPress(".tile-position-1-3", function (event) { this.emit("click", {x: 0, y: 2}); });
  this.bindButtonPress(".tile-position-1-4", function (event) { this.emit("click", {x: 0, y: 3}); });
  this.bindButtonPress(".tile-position-1-5", function (event) { this.emit("click", {x: 0, y: 4}); });
  this.bindButtonPress(".tile-position-1-6", function (event) { this.emit("click", {x: 0, y: 5}); });
  this.bindButtonPress(".tile-position-2-1", function (event) { this.emit("click", {x: 1, y: 0}); });
  this.bindButtonPress(".tile-position-2-2", function (event) { this.emit("click", {x: 1, y: 1}); });
  this.bindButtonPress(".tile-position-2-3", function (event) { this.emit("click", {x: 1, y: 2}); });
  this.bindButtonPress(".tile-position-2-4", function (event) { this.emit("click", {x: 1, y: 3}); });
  this.bindButtonPress(".tile-position-2-5", function (event) { this.emit("click", {x: 1, y: 4}); });
  this.bindButtonPress(".tile-position-2-6", function (event) { this.emit("click", {x: 1, y: 5}); });
  this.bindButtonPress(".tile-position-3-1", function (event) { this.emit("click", {x: 2, y: 0}); });
  this.bindButtonPress(".tile-position-3-2", function (event) { this.emit("click", {x: 2, y: 1}); });
  this.bindButtonPress(".tile-position-3-3", function (event) { this.emit("click", {x: 2, y: 2}); });
  this.bindButtonPress(".tile-position-3-4", function (event) { this.emit("click", {x: 2, y: 3}); });
  this.bindButtonPress(".tile-position-3-5", function (event) { this.emit("click", {x: 2, y: 4}); });
  this.bindButtonPress(".tile-position-3-6", function (event) { this.emit("click", {x: 2, y: 5}); });
  this.bindButtonPress(".tile-position-4-1", function (event) { this.emit("click", {x: 3, y: 0}); });
  this.bindButtonPress(".tile-position-4-2", function (event) { this.emit("click", {x: 3, y: 1}); });
  this.bindButtonPress(".tile-position-4-3", function (event) { this.emit("click", {x: 3, y: 2}); });
  this.bindButtonPress(".tile-position-4-4", function (event) { this.emit("click", {x: 3, y: 3}); });
  this.bindButtonPress(".tile-position-4-5", function (event) { this.emit("click", {x: 3, y: 4}); });
  this.bindButtonPress(".tile-position-4-6", function (event) { this.emit("click", {x: 3, y: 5}); });
  this.bindButtonPress(".tile-position-5-1", function (event) { this.emit("click", {x: 4, y: 0}); });
  this.bindButtonPress(".tile-position-5-2", function (event) { this.emit("click", {x: 4, y: 1}); });
  this.bindButtonPress(".tile-position-5-3", function (event) { this.emit("click", {x: 4, y: 2}); });
  this.bindButtonPress(".tile-position-5-4", function (event) { this.emit("click", {x: 4, y: 3}); });
  this.bindButtonPress(".tile-position-5-5", function (event) { this.emit("click", {x: 4, y: 4}); });
  this.bindButtonPress(".tile-position-5-6", function (event) { this.emit("click", {x: 4, y: 5}); });
  this.bindButtonPress(".tile-position-6-1", function (event) { this.emit("click", {x: 5, y: 0}); });
  this.bindButtonPress(".tile-position-6-2", function (event) { this.emit("click", {x: 5, y: 1}); });
  this.bindButtonPress(".tile-position-6-3", function (event) { this.emit("click", {x: 5, y: 2}); });
  this.bindButtonPress(".tile-position-6-4", function (event) { this.emit("click", {x: 5, y: 3}); });
  this.bindButtonPress(".tile-position-6-5", function (event) { this.emit("click", {x: 5, y: 4}); });
  this.bindButtonPress(".tile-position-6-6", function (event) { this.emit("click", {x: 5, y: 5}); });

  // Respond to button presses
  this.bindButtonPress(".retry-button", this.restart);
  this.bindButtonPress(".restart-button", this.restart);
  this.bindButtonPress(".keep-playing-button", this.keepPlaying);

  // Respond to swipe events
  var touchStartClientX, touchStartClientY;
  var gameContainer = document.getElementsByClassName("game-container")[0];

  gameContainer.addEventListener(this.eventTouchstart, function (event) {
    if ((!window.navigator.msPointerEnabled && event.touches.length > 1) ||
        event.targetTouches.length > 1 ||
        self.targetIsInput(event)) {
      return; // Ignore if touching with more than 1 finger or touching input
    }

    if (window.navigator.msPointerEnabled) {
      touchStartClientX = event.pageX;
      touchStartClientY = event.pageY;
    } else {
      touchStartClientX = event.touches[0].clientX;
      touchStartClientY = event.touches[0].clientY;
    }

    event.preventDefault();
  });

  gameContainer.addEventListener(this.eventTouchmove, function (event) {
    event.preventDefault();
  });

  gameContainer.addEventListener(this.eventTouchend, function (event) {
    if ((!window.navigator.msPointerEnabled && event.touches.length > 0) ||
        event.targetTouches.length > 0 ||
        self.targetIsInput(event)) {
      return; // Ignore if still touching with one or more fingers or input
    }

    var touchEndClientX, touchEndClientY;

    if (window.navigator.msPointerEnabled) {
      touchEndClientX = event.pageX;
      touchEndClientY = event.pageY;
    } else {
      touchEndClientX = event.changedTouches[0].clientX;
      touchEndClientY = event.changedTouches[0].clientY;
    }

    var dx = touchEndClientX - touchStartClientX;
    var absDx = Math.abs(dx);

    var dy = touchEndClientY - touchStartClientY;
    var absDy = Math.abs(dy);

    if (Math.max(absDx, absDy) > 10) {
      // (right : left) : (down : up)
      self.emit("arrow", absDx > absDy ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0));
    }
  });
};

KeyboardInputManager.prototype.restart = function (event) {
  event.preventDefault();
  this.emit("restart");
};

KeyboardInputManager.prototype.keepPlaying = function (event) {
  event.preventDefault();
  this.emit("keepPlaying");
};

KeyboardInputManager.prototype.bindButtonPress = function (selector, fn) {
  var button = document.querySelector(selector);
  if (button) {
    button.addEventListener("click", fn.bind(this));
    button.addEventListener(this.eventTouchend, fn.bind(this));
  }
};

KeyboardInputManager.prototype.targetIsInput = function (event) {
  return event.target.tagName.toLowerCase() === "input";
};
