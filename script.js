window.onload = function () {
  const canvasWidth = 1050;
  const canvasHeight = 700;
  const blockSize = 35;
  let canvasContext;
  const initialDelay = 400;
  let delay = initialDelay;
  let Snakee;
  let Applee;
  const widthInBlocks = canvasWidth / blockSize;
  const heightInBlocks = canvasHeight / blockSize;
  let score;
  let timeout;

  init();

  function init() {
    const canvas = document.createElement("canvas");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    canvas.style.border = "20px solid #000";
    canvas.style.borderRadius = "15px";
    canvas.style.margin = "50px auto";
    canvas.style.display = "block";
    canvas.style.backgroundColor = "lightgray";
    document.body.appendChild(canvas);
    canvasContext = canvas.getContext("2d");
    Snakee = new Snake(
      [
        [6, 4],
        [5, 4],
        [4, 4],
      ],
      "right"
    );
    Applee = new Apple([10, 10]);
    score = 0;
    refreshCanvas();
  }

  function refreshCanvas() {
    Snakee.advance();

    if (Snakee.checkCollision()) {
      gameOver();
    } else {
      if (Snakee.isEatingApple(Applee)) {
        score++;
        Snakee.ateApple = true;
        do {
          Applee.setNewPosition();
        } while (Applee.isOnSnake(Snakee));

        // Plus le score monte, plus la vitesse augmente aussi, avec une limite maximale
        if (delay > 100) { // Limite vitesse maximale de 100 ms
          delay -= 10;
        }
        console.log(delay);
      }

      canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);
      drawScore();
      Snakee.draw();
      Applee.draw();
      timeout = setTimeout(refreshCanvas, delay);
    }
  }

  //   Fontion de fin du jeu
  function gameOver() {
    console.log("game over");
    canvasContext.save();
    canvasContext.font = "bold 70px sans-serif";
    canvasContext.fillStyle = "#000";
    canvasContext.textAlign = "center";
    canvasContext.textBaseline = "middle";
    canvasContext.strokeStyle = "white";
    canvasContext.lineWidth = 3;
    let centreX = canvasWidth / 2;
    let centreY = canvasHeight / 2;
    canvasContext.strokeText("Game Over", centreX, centreY - 150);
    canvasContext.fillText("Game Over", centreX, centreY - 150);
    canvasContext.font = "bold 30px sans-serif";
    canvasContext.fillStyle = "#000";
    canvasContext.fillText(
      "Appuyer sur la touche Espace pour rejouer",
      centreX,
      centreY - 80
    );
    canvasContext.restore();
  }

  function restart() {
    Snakee = new Snake(
      [
        [6, 4],
        [5, 4],
        [4, 4],
      ],
      "right"
    );
    Applee = new Apple([10, 10]);
    score = 0;
    clearTimeout(timeout);
    refreshCanvas();
  }
  //   Affichage du score dans le canvas
  function drawScore() {
    canvasContext.save();

    canvasContext.font = "bold 210px Lucida";
    canvasContext.fillStyle = "white";
    canvasContext.textAlign = "center";
    canvasContext.textBaseLine = "middle";
    const centreX = canvasWidth / 2;
    const centreY = canvasHeight / 2;
    canvasContext.fillText(score.toString(), centreX, centreY + 50);
    canvasContext.restore();
  }

  function drawBlock(canvasContext, position) {
    let x = position[0] * blockSize;
    let y = position[1] * blockSize;
    canvasContext.fillRect(x, y, blockSize, blockSize);
  }

  //   Fonctions liées au Snake
  function Snake(body, direction) {
    this.body = body;
    this.direction = direction;
    this.ateApple = false;

    this.draw = function () {
      canvasContext.save();
      canvasContext.fillStyle = "#710627";

      for (let i = 0; i < this.body.length; i++) {
        drawBlock(canvasContext, this.body[i]);
      }
      canvasContext.restore();
    };

    this.advance = function () {
      let nextPosition = this.body[0].slice();
      switch (this.direction) {
        case "left":
          nextPosition[0] -= 1;
          break;
        case "right":
          nextPosition[0] += 1;
          break;
        case "down":
          nextPosition[1] += 1;
          break;
        case "up":
          nextPosition[1] -= 1;
          break;
        default:
          throw "Invalid Direction";
      }

      this.body.unshift(nextPosition);
      if (!this.ateApple) this.body.pop();
      else this.ateApple = false;
    };

    this.setDirection = function (newDirection) {
      let allowedDirections;
      switch (this.direction) {
        case "left":
        case "right":
          allowedDirections = ["up", "down"];
          break;
        case "down":
        case "up":
          allowedDirections = ["left", "right"];
          break;
        default:
          throw "Invalid Direction";
      }

      if (allowedDirections.indexOf(newDirection) > -1) {
        this.direction = newDirection;
      }
    };
    // Gestion des collisions contre les murs ou le corps
    this.checkCollision = function () {
      let wallCollision = false;
      let snakeCollision = false;
      let head = this.body[0];
      let rest = this.body.slice(1);
      let snakeX = head[0];
      let snakeY = head[1];
      const minX = 0;
      const minY = 0;
      const maxX = widthInBlocks - 1;
      const maxY = heightInBlocks - 1;
      const isNotBetweenHorizontalWalls = snakeX < minX || snakeX > maxX;
      const isNotBetweenVerticalWalls = snakeY < minY || snakeY > maxY;

      if (isNotBetweenHorizontalWalls || isNotBetweenVerticalWalls) {
        wallCollision = true;
      }
      for (let i = 0; i < rest.length; i++) {
        if (snakeX == rest[i][0] && snakeY === rest[i][1]) {
          snakeCollision = true;
        }
      }
      return wallCollision || snakeCollision;
    };
    // Gestion de l'action manger une pomme
    this.isEatingApple = function (appleToEat) {
      const head = this.body[0];
      if (
        head[0] === appleToEat.position[0] &&
        head[1] === appleToEat.position[1]
      ) {
        return true;
      } else {
        return false;
      }
    };
  }
  //   Fonctions liées à la pomme (Apple)
  function Apple(position) {
    this.position = position;
    this.draw = function () {
      canvasContext.save();
      canvasContext.fillStyle = "#00CC00";
      canvasContext.beginPath();
      const radius = blockSize / 2;
      const x = this.position[0] * blockSize + radius;
      const y = this.position[1] * blockSize + radius;
      canvasContext.arc(x, y, radius, 0, Math.PI * 2, true);
      canvasContext.fill();
      canvasContext.restore();
    };

    this.setNewPosition = function () {
      const newX = Math.floor(Math.random() * widthInBlocks);
      const newY = Math.floor(Math.random() * heightInBlocks);
      this.position = [newX, newY];
    };

    this.isOnSnake = function (snakeToCheck) {
      let isOnSnake = false;

      for (let i = 0; i < snakeToCheck.body.length; i++) {
        if (
          this.position[0] === snakeToCheck.body[i][0] &&
          this.position[1] === snakeToCheck.body[i][1]
        ) {
          isOnSnake = true;
          break;
        }
      }
      return isOnSnake;
    };
  }

  //   Gestion des déplacements
  document.onkeydown = function handleKeyDown(e) {
    const key = e.keyCode;
    let newDirection;
    switch (key) {
      case 37:
        newDirection = "left";
        break;
      case 38:
        newDirection = "up";
        break;
      case 39:
        newDirection = "right";
        break;
      case 40:
        newDirection = "down";
        break;
      case 32:
        restart();
        return;
      default:
        return;
    }
    Snakee.setDirection(newDirection);
  };
};
