var Utilities = (function() {
  return {
    wrapAsClass: function(elementName) {
      return "." + elementName;
    }
  };
})();

var gameController = (function() {
  var cards;
  var totalPairsNum;
  var matchedPairsNum;

  var Card = function(x, y, value) {
    this.x = x;
    this.y = y;
    this.value = value;
  };

  return {
    initPairsNum(num) {
      this.totalPairsNum = (num * num) / 2;
      this.matchedPairsNum = 0;
    },

    createCards(num) {
      var tmpArray = [];
      for (var i = 0; i < Math.pow(num, 2) / 2; i++) {
        tmpArray[i * 2] = i + 1;
        tmpArray[i * 2 + 1] = i + 1;
      }

      var randomArray = [];
      while (tmpArray.length > 0) {
        var rvalue = Math.floor(Math.random() * tmpArray.length);
        randomArray.push(tmpArray[rvalue]);
        tmpArray.splice(rvalue, 1);
      }

      this.cards = [];
      for (var i = 0; i < num; i++) {
        this.cards[i] = [];
        for (var j = 0; j < num; j++) {
          this.cards[i][j] = new Card(i, j, randomArray[i * num + j]);
        }
      }

      return this.cards;
    },

    findMatch(firstCard, secondCard) {
      var firstIdx = firstCard.split("_");
      var secondIdx = secondCard.split("_");

      if (
        this.cards[firstIdx[1]][firstIdx[2]].value ===
        this.cards[secondIdx[1]][secondIdx[2]].value
      ) {
        this.matchedPairsNum++;
        return true;
      } else {
        return false;
      }
    },

    decideGameOver() {
      return this.totalPairsNum == this.matchedPairsNum ? true : false;
    }
  };
})();

var UIController = (function() {
  var ElementStrings = {
    dataNum: "4",
    container: ".container-memory",
    startBtn: "#start",
    resetBtn: "#reset",
    timer: "#timer"
  };

  return {
    getNum: function() {
      return parseInt(ElementStrings.dataNum);
    },

    displayGame: function(cards) {
      document.querySelector(ElementStrings.container).style[
        "grid-template-rows"
      ] = "repeat(" + cards.length + ", 1fr)";
      document.querySelector(ElementStrings.container).style[
        "grid-template-columns"
      ] = "repeat(" + cards[0].length + ", 1fr)";

      var html = "";

      for (var i = 0; i < cards.length; i++) {
        html += "";
        for (var j = 0; j < cards[0].length; j++) {
          html +=
            '<div class="item c_' +
            i +
            "_" +
            j +
            '" data-value="' +
            cards[i][j].value +
            '"><img src="img/back.png" /></div>';
        }
        html += "</div>";
      }
      document
        .querySelector(ElementStrings.container)
        .insertAdjacentHTML("beforeend", html);
    },

    clearGameBoard: function() {
      document.querySelector(ElementStrings.container).innerHTML = "";
    },

    getElementStrings: function() {
      return ElementStrings;
    },

    flipCard: function(card) {
      var imgNum = document.querySelector(card).dataset.value;
      document.querySelector(card).firstChild.src = `img/${imgNum}.png`;
    },

    updateMatched: function(firstCard, secondCard) {
      document.querySelector(firstCard).firstChild.src = "";
      document.querySelector(firstCard).style.backgroundColor = "white";

      document.querySelector(secondCard).firstChild.src = "";
      document.querySelector(secondCard).style.backgroundColor = "white";
    },

    updateNotMatched: function(firstCard, secondCard) {
      document.querySelector(firstCard).firstChild.src = "img/back.png";
      document.querySelector(secondCard).firstChild.src = "img/back.png";
    },

    updateTime: function() {
      var seconds = 0;
      return (timer = setInterval(function() {
        seconds++;
        document.querySelector(ElementStrings.timer).innerText =
          "Elapsed Time: " +
          parseInt(seconds / 60) +
          " mins " +
          (seconds % 60) +
          " secs";
      }, 1000));
    },

    removeTimer: function() {
      document.querySelector(ElementStrings.timer).innerText = "";
    },

    disableReset: function() {
      document.querySelector(ElementStrings.resetBtn).disabled = true;
    },

    enableReset: function() {
      document.querySelector(ElementStrings.resetBtn).disabled = false;
    }
  };
})();

var controller = (function(gameCtrl, UICtrl, Utils) {
  var currentDimension;
  var timer;
  var firstCard = null;
  var secondCard = null;

  var initMemoryGame = function() {
    var DOM = UICtrl.getElementStrings();

    document
      .querySelector(DOM.startBtn)
      .addEventListener("click", function(evt) {
        evt.preventDefault();
        var num = UIController.getNum();
        if (num === 2 || num === 4 || num === 6) {
          startGame(num);
        } else {
          sendMessage("Please enter a value among 2, 4, and 6.");
        }
      });

    document
      .querySelector(DOM.resetBtn)
      .addEventListener("click", function(evt) {
        evt.preventDefault();
        resetGame();
      });

    document
      .querySelector(DOM.container)
      .addEventListener("click", findMatch.bind(this));
  };

  var initCards = function() {
    this.firstCard = null;
    this.secondCard = null;
  };

  var startGame = function(num) {
    this.currentDimension = num;

    UIController.clearGameBoard();
    gameController.initPairsNum(num);
    UIController.displayGame(gameController.createCards(num));
    UIController.enableReset();
    initCards();
    if (this.timer != null) {
      clearInterval(this.timer);
    }
    this.timer = UIController.updateTime();
  };

  var sendMessage = function(message) {
    alert(message);
  };

  var resetGame = function() {
    UIController.clearGameBoard();
    gameController.initPairsNum(this.currentDimension);
    UIController.displayGame(gameController.createCards(this.currentDimension));
    UIController.enableReset();
    initCards();
    if (this.timer != null) {
      clearInterval(this.timer);
    }
    this.timer = UIController.updateTime();
  };

  var findMatch = function(evt) {
    if (evt.target.tagName === "IMG") {
      if (this.firstCard == null) {
        this.firstCard = evt.target.parentNode.classList[1];
        UIController.flipCard(
          Utils.wrapAsClass(evt.target.parentNode.classList[1])
        );
      } else {
        this.secondCard = evt.target.parentNode.classList[1];
        if (!(this.firstCard === this.secondCard)) {
          if (gameController.findMatch(this.firstCard, this.secondCard)) {
            if (gameController.decideGameOver()) {
              UIController.flipCard(Utils.wrapAsClass(this.secondCard));
              UIController.updateMatched(
                Utils.wrapAsClass(this.firstCard),
                Utils.wrapAsClass(this.secondCard)
              );
              setTimeout(sendMessage, 1000, "You Completed");
              clearInterval(this.timer);
              setTimeout(UIController.removeTimer, 3000);
              setTimeout(UIController.disableReset, 1000);
              window.location.href = 'EndPage.html';
            } else {
              UIController.flipCard(Utils.wrapAsClass(this.secondCard));
              UIController.updateMatched(
                Utils.wrapAsClass(this.firstCard),
                Utils.wrapAsClass(this.secondCard)
              );
            }
            this.firstCard = null;
          } else {
            UIController.flipCard(Utils.wrapAsClass(this.secondCard));
            setTimeout(
              UIController.updateNotMatched,
              1000,
              Utils.wrapAsClass(this.firstCard),
              Utils.wrapAsClass(this.secondCard)
            );
            this.firstCard = null;
          }
        }
      }
    }
  };

  return {
    init: function() {
      initMemoryGame();
    }
  };
})(gameController, UIController, Utilities);

controller.init();

$(document).ready(function(){
  $('#startModalCenter').modal('show')
})
