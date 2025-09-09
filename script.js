class MinesweeperPro {
  constructor() {
    this.difficulties = {
      easy: { rows: 9, cols: 9, mines: 10 },
      medium: { rows: 16, cols: 16, mines: 40 },
      hard: { rows: 24, cols: 24, mines: 50 }
    };

    this.board = [];
    this.rows = 0;
    this.cols = 0;
    this.mines = 0;
    this.flags = 0;
    this.timer = 0;
    this.interval = null;
    this.gameOver = false;
    this.firstClick = true;

    this.boardElement = document.getElementById("gameBoard");
    this.minesCountElement = document.getElementById("minesCount");
    this.timerElement = document.getElementById("timer");

    document.getElementById("newGame").addEventListener("click", () => this.startGame());
    document.getElementById("closeModal").addEventListener("click", () => this.closeModal());
    document.getElementById("difficulty").addEventListener("change", () => this.startGame());


    this.startGame();
  }

  
  startGame() {
    const difficulty = document.getElementById("difficulty").value;
    const { rows, cols, mines } = this.difficulties[difficulty];

    this.rows = rows;
    this.cols = cols;
    this.mines = mines;
    this.flags = 0;
    this.timer = 0;
    this.gameOver = false;
    this.firstClick = true;
    this.board = [];
    clearInterval(this.interval);
    this.timerElement.textContent = "0";
    this.minesCountElement.textContent = this.mines;

    this.boardElement.innerHTML = "";
    let cellSize = 35;
    if (difficulty === "medium") cellSize = 30;
    if (difficulty === "hard") cellSize = 23;

    this.boardElement.style.gridTemplateRows = `repeat(${rows}, ${cellSize}px)`;
    this.boardElement.style.gridTemplateColumns = `repeat(${cols}, ${cellSize}px)`;

    for (let r = 0; r < rows; r++) {
      this.board[r] = [];
      for (let c = 0; c < cols; c++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.style.width = `${cellSize}px`;
        cell.style.height = `${cellSize}px`;
        cell.dataset.row = r;
        cell.dataset.col = c;
        this.boardElement.appendChild(cell);

        this.board[r][c] = {
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          adjacent: 0,
          element: cell
        };

        cell.addEventListener("click", () => this.handleClick(r, c));
        cell.addEventListener("contextmenu", (e) => {
          e.preventDefault();
          this.toggleFlag(r, c);
        });
      }
    }
  }

  placeMines(excludeRow, excludeCol) {
    let placed = 0;
    while (placed < this.mines) {
      const r = Math.floor(Math.random() * this.rows);
      const c = Math.floor(Math.random() * this.cols);
      if ((r === excludeRow && c === excludeCol) || this.board[r][c].isMine) continue;
      this.board[r][c].isMine = true;
      placed++;
    }

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.board[r][c].isMine) continue;
        this.board[r][c].adjacent = this.getNeighbors(r, c).filter(n => n.isMine).length;
      }
    }
  }

  getNeighbors(row, col) {
    const neighbors = [];
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = row + dr;
        const nc = col + dc;
        if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols) {
          neighbors.push(this.board[nr][nc]);
        }
      }
    }
    return neighbors;
  }

  handleClick(r, c) {
    if (this.gameOver) return;
    const cell = this.board[r][c];

    if (this.firstClick) {
      this.placeMines(r, c);
      this.startTimer();
      this.firstClick = false;
    }

    if (cell.isFlagged || cell.isRevealed) return;

    if (cell.isMine) {
      this.revealMines();
      this.showModal("💥 Game Over!");
      this.gameOver = true;
      clearInterval(this.interval);
      return;
    }

    this.revealCell(r, c);

    if (this.checkWin()) {
      this.showModal("🎉 You Win!");
      this.gameOver = true;
      clearInterval(this.interval);
    }
  }

  revealCell(r, c) {
    const cell = this.board[r][c];
    if (cell.isRevealed || cell.isFlagged) return;

    cell.isRevealed = true;
    cell.element.classList.add("revealed");

    cell.element.classList.add("shake");
    setTimeout(() => cell.element.classList.remove("shake"), 100);

    if (cell.adjacent > 0) {
      cell.element.textContent = cell.adjacent;
    } else {
      this.getNeighbors(r, c).forEach(n => this.revealCell(
        parseInt(n.element.dataset.row),
        parseInt(n.element.dataset.col)
      ));
    }
  }

  toggleFlag(r, c) {
    if (this.gameOver) return;
    const cell = this.board[r][c];

    if (cell.isRevealed) return;

    cell.isFlagged = !cell.isFlagged;
    if (cell.isFlagged) {
      cell.element.classList.add("flagged");
      cell.element.textContent = "🚩";
      this.flags++;
    } else {
      cell.element.classList.remove("flagged");
      cell.element.textContent = "";
      this.flags--;
    }
    this.minesCountElement.textContent = this.mines - this.flags;
  }

  revealMines() {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const cell = this.board[r][c];
        if (cell.isMine) {
          cell.element.classList.add("mine");
          cell.element.textContent = "💥";
        }
      }
    }
  }

  checkWin() {
    let revealedCount = 0;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.board[r][c].isRevealed) revealedCount++;
      }
    }
    return revealedCount === (this.rows * this.cols - this.mines);
  }

  startTimer() {
    this.interval = setInterval(() => {
      this.timer++;
      this.timerElement.textContent = this.timer;
    }, 1000);
  }

  showModal(message) {
    document.getElementById("modalMessage").textContent = message;
    document.getElementById("modal").style.display = "flex";
  }

  closeModal() {
    document.getElementById("modal").style.display = "none";
  }
}

window.onload = () => new MinesweeperPro();
