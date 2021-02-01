function createMat(ROWS, COLS) {
    var mat = []
    for (var i = 0; i < ROWS; i++) {
        var row = []
        for (var j = 0; j < COLS; j++) {
            row.push('')
        }
        mat.push(row)
    }
    return mat
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function getEmptyCellsArray(board) {
    var emptyCells = [];
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var cellCoords = {i,j}
            if (board[i][j].type === FLOOR && !board[i][j].gameElement) {
                emptyCells.push(cellCoords)
            }
        }
    }
    return emptyCells;

}