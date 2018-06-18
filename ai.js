var Chess = require('./modules/chess-extended.js').Chess,
    minmax = require('./modules/minmax.js'),
    constants = require('./constants.js').constants,
    endgame = require('./modules/endgame.js');

var sum = (v1, v2) => {
        return v1 + v2;
    },
    mapSquareToArrayPosition = function (square) {
        if (!square || square.length !== 2) {
            console.log("error in mapSquareToArrayPosition")
            return 0;
        }
        square = square.toLowerCase();

        return constants.squareLatterToInt[square[0]] + Math.abs(8 - parseInt(square[1])) * 8;
    },
    piecePositionValue = function (piece) {
        var positionScore = 0,
            pieceSquareTables = constants.pieceSquareTables,
            c = piece.type.toLowerCase();

        if (constants.pieceSquareTables.hasOwnProperty(piece.type)) {
            var squareTable = (piece.color === 'w') ? pieceSquareTables[piece.type] : pieceSquareTables[piece.type].reverse();
            positionScore = squareTable[mapSquareToArrayPosition(piece.square)];
        }
        return positionScore;
    },

    valuePieces = function (chess, color) {
        return chess.pieces(color)
            .map(piece => {
                return constants.PIECEVALUES[piece.type]
            })
            .reduce(sum, 0);
    },
    valueMoves = (chess) => {
        var score = chess.moves({
                verbose: true
            })
            .map(move => {
                return move.flags.split('')
            })
            .map(scoreList => {
                return scoreList.map(flag => {
                    return constants.mapMoveFlagToScore[flag]
                })
            })
            .map(scoreList => {
                return scoreList.reduce(sum, 0)
            })
            .reduce(sum, 0);
        return score;
    },
    positionScore = (chess) => {
        var scorePlayer = chess.pieces('w')
            .map(p => {
                return piecePositionValue(p)
            })
            .reduce(sum, 0);
        var scoreOther = chess.pieces('b')
            .map(p => {
                return piecePositionValue(p)
            })
            .reduce(sum, 0);
        return scorePlayer - scoreOther;
    },
    materialScore = (chess) => {
        return (valuePieces(chess, 'w') - valuePieces(chess, 'b')) * 1000;
    },
    blackOrWhiteSign = chess => {
        return chess.turn() === 'w' ? 1 : -1
    }

var score = (chess) => {
    var score = materialScore(chess);
    if (chess.in_check()) score -= 5 * blackOrWhiteSign(chess);
    if (chess.in_checkmate()) score -= 1000000 * blackOrWhiteSign(chess);
    score += valueMoves(chess) * blackOrWhiteSign(chess);
    score += positionScore(chess);
    score += Math.random();
    return score;
}

move = function (board) {
    var chess = new Chess(board);
    if (chess.numberOfPieces() <= 5) return endgame.move(board);

    return minmax.move(board, 2, score);
};

exports.score = score;
exports.move = move;
exports.name = 'JacuBird';