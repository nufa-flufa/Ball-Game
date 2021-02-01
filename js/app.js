'use strict';
const WALL = 'WALL';
const FLOOR = 'FLOOR';
const BALL = 'BALL';
const GAMER = 'GAMER';
const GLUE = 'GLUE';

const GAMER_IMG = '<img src="img/gamer.png">';
const BALL_IMG = '<img src="img/ball.png">';
const GLUE_IMG = '<img src="img/candy.png" />';

var gBoard;
var gIsGameOn = true;
var gGamerPos;
var gGlueInterval;
var gBallOnBoardInterval;
var gIsPlayerOnGlue = false;
var gBallsCount = 0;

function init() {
	gGamerPos = { i: 2, j: 9 };
	gBoard = buildBoard();
	renderBoard(gBoard);
	gGlueInterval = setInterval(putGlueOnBoard, 5000)
	// gBallOnBoardInterval = setInterval(putBallOnBoard, 2000)
	var elCounter = document.querySelector('.counter')
	elCounter.innerText = gBallsCount;
}

function restart() {
	gBallsCount = 0;
	var elModal = document.querySelector('.modal');
	elModal.style.display = 'none';
	gIsGameOn = true;
	init()
}

// Create the Matrix 10 * 12 
function buildBoard() {
	var board = createMat(10, 12);
	// Put FLOOR everywhere and WALL at edges
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[0].length; j++) {
			var cell = { type: FLOOR, gameElement: null }
			if (i === 0 || i === board.length - 1 ||
				j === 0 || j === board[0].length - 1) {
				cell.type = WALL
			}

			board[i][j] = cell;
		}
	}
	board[0][6].type = FLOOR;
	board[9][6].type = FLOOR;
	board[4][0].type = FLOOR;
	board[4][11].type = FLOOR;
	// Place the gamer
	board[gGamerPos.i][gGamerPos.j].gameElement = GAMER
	board[3][8].gameElement = BALL;
	board[7][4].gameElement = BALL;
	console.table(board)
	return board;
}

// Render the board to an HTML table
function renderBoard(board) {

	var strHTML = '';
	for (var i = 0; i < board.length; i++) {
		strHTML += '<tr>\n';
		for (var j = 0; j < board[0].length; j++) {
			var currCell = board[i][j];

			var cellClass = getClassName({ i: i, j: j })

			if (currCell.type === FLOOR) cellClass += ' floor';
			else if (currCell.type === WALL) cellClass += ' wall';

			strHTML += '\t<td class="cell ' + cellClass + '"  onclick="moveTo(' + i + ',' + j + ')" >\n';

			if (currCell.gameElement === GAMER) {
				strHTML += GAMER_IMG;
			} else if (currCell.gameElement === BALL) {
				strHTML += BALL_IMG;
			}

			strHTML += '\t</td>\n';
		}
		strHTML += '</tr>\n';
		// console.log(strHTML)
	}

	var elBoard = document.querySelector('.board');
	elBoard.innerHTML = strHTML;
	// getRndBallPosition()
}


// Move the player to a specific location
function moveTo(i, j) {
	if (!gIsGameOn) return;
	if (gIsPlayerOnGlue) return;

	if (i === -1) i = 9;
	if (i === 10) i = 0;
	if (j === -1) j = 11;
	if (j === 12) j = 0

	var targetCell = gBoard[i][j];
	if (targetCell.type === WALL) return;
	// console.log(i + ':' + j)	// Calculate distance to ake sure we are moving to a neighbor cell
	var iAbsDiff = Math.abs(i - gGamerPos.i);
	var jAbsDiff = Math.abs(j - gGamerPos.j);

	if ((iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0) ||
		(iAbsDiff === 0 && jAbsDiff === 11) || (iAbsDiff === 9 && jAbsDiff === 0)) {
		if (targetCell.gameElement === GLUE) {
			gIsPlayerOnGlue = true;
			setTimeout(function () {
				gIsPlayerOnGlue = false
			}, 3000)
		}
		if (targetCell.gameElement === BALL) {
			gBallsCount++;
			var collectSound = document.createElement('audio')
			collectSound.src = 'sounds/popsound.mp3'
			collectSound.play();
			var elCounter = document.querySelector('.counter')
			elCounter.innerText = gBallsCount;
		}

		//Move the gamer

		//update the model
		gBoard[gGamerPos.i][gGamerPos.j].gameElement = null

		//update the DOM:
		renderCell(gGamerPos, '')

		//update the model
		gGamerPos = { i: i, j: j }
		targetCell.gameElement = GAMER

		//update the DOM:
		renderCell(gGamerPos, GAMER_IMG)

	}

	var count = countBallsOnBoard()
	if (count === 0) {
		gIsGameOn = false;
		gameOver()
	}
}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
	var cellSelector = '.' + getClassName(location)
	var elCell = document.querySelector(cellSelector);
	elCell.innerHTML = value;
}

// Move the player by keyboard arrows
function handleKey(event) {

	var i = gGamerPos.i;
	var j = gGamerPos.j;


	switch (event.key) {
		case 'ArrowLeft':
			moveTo(i, j - 1);
			break;
		case 'ArrowRight':
			moveTo(i, j + 1);
			break;
		case 'ArrowUp':
			moveTo(i - 1, j);
			break;
		case 'ArrowDown':
			moveTo(i + 1, j);
			break;
	}

}

// Returns the class name for a specific cell
function getClassName(location) {
	var cellClass = 'cell-' + location.i + '-' + location.j;
	return cellClass;
}

function putBallOnBoard() {
	var EmptyCells = getEmptyCellsArray(gBoard);
	var rndCellIdx = getRandomInt(0, EmptyCells.length);
	var ballPos = EmptyCells[rndCellIdx];
	gBoard[ballPos.i][ballPos.j].gameElement = BALL;
	renderCell(ballPos, BALL_IMG)
}

function countBallsOnBoard() {
	var countBalls = 0;
	for (var i = 0; i < gBoard.length; i++) {
		for (var j = 0; j < gBoard[0].length; j++) {
			var currCell = gBoard[i][j];
			if (currCell.gameElement === BALL) countBalls++
		}
	}
	return countBalls;
}

function putGlueOnBoard() {
	var emptyCells = getEmptyCellsArray(gBoard);
	var glueRndIdx = getRandomInt(0, emptyCells.length);
	var gluePos = emptyCells[glueRndIdx];
	gBoard[gluePos.i][gluePos.j].gameElement = GLUE;
	renderCell(gluePos, GLUE_IMG)

	setTimeout(function () {
		if (gBoard[gluePos.i][gluePos.j].gameElement === GAMER) return;
		gBoard[gluePos.i][gluePos.j].gameElement = null;
		renderCell(gluePos, '')

	}, 3000)
}

function gameOver() {
	clearInterval(gGlueInterval)
	clearInterval(gBallOnBoardInterval)
	var elModal = document.querySelector('.modal');
	var elSpan = elModal.querySelector('span');
	elModal.style.display = 'flex';
	elSpan.innerText = gBallsCount;
}
