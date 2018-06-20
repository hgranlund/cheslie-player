var Chess = require('./modules/chess-extended.js').Chess,
    minmax = require('./modules/minmax.js'),
    constants = require('./constants.js').constants,
    endgame = require('./modules/endgame.js');

var sum = (v1, v2) => {
        return v1 + v2;
    },

    getPositionScoreFromSquare = (table, square) => {
        if (!square || square.length !== 2) {
            console.log("error in mapSquareToArrayPosition")
            return 0;
        }
        square = square.toLowerCase();
        var x = constants.squareLatterToInt[square[0]],
            y = 8 - parseInt(square[1]);
        return table[y][x];
    },

    piecePositionValue = (piece) => {
        var positionScore = 0,
            pieceSquareTables = constants.pieceSquareTables,
            type = piece.type.toLowerCase();
        if (constants.pieceSquareTables.hasOwnProperty(type)) {
            var squareTable = (piece.color === 'w') ? pieceSquareTables[type] : pieceSquareTables[type].slice().reverse();
            positionScore = getPositionScoreFromSquare(squareTable, piece.square);
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
        var white = chess.pieces('w')
            .map(p => {
                return piecePositionValue(p)
            })
            .reduce(sum, 0);
        var black = chess.pieces('b')
            .map(p => {
                return piecePositionValue(p)
            })
            .reduce(sum, 0);
        return white - black;
    },

    castlingScoreColor = (chess, color) => {
        var k = chess.pieces(color).find((p) => {
                return p.type == constants.KING
            }),
            r1 = chess.pieces(color).reverse().find((p) => {
                return p.type == constants.ROOK
            }),
            r2 = chess.pieces(color).find((p) => {
                return p != r1 && p.type == constants.ROOK
            });
        if (![k, r1, r2].every((p) => {
                return p && ['1', '8'].includes(p.square[1])
            })) return 0;
        var krr = [k, r1, r2].map(p => {
            return constants.squareLatterToInt[p.square[0]]
        })
        if ((krr[0] > krr[1] && krr[0] > krr[2]) || (krr[0] < krr[1] && krr[0] < krr[2])) {
            return 25;
        }
        return 0;
    },

    castlingScore = (chess) => {
        return castlingScoreColor(chess, 'w') - castlingScoreColor(chess, 'b')
    },

    materialScore = (chess) => {
        return (valuePieces(chess, 'w') - valuePieces(chess, 'b')) * 1000;
    },

    blackOrWhiteSign = chess => {
        return chess.turn() === 'w' ? 1 : -1
    },

    score = chess => {
        var score = materialScore(chess);
        if (chess.in_check()) score -= 5 * blackOrWhiteSign(chess);
        if (chess.in_checkmate()) score -= 1000000 * blackOrWhiteSign(chess);
        score += valueMoves(chess) * blackOrWhiteSign(chess);
        score += positionScore(chess);
        score += castlingScore(chess);
        score += Math.random();
        return score;
    },

    move = (board) => {
        var chess = new Chess(board);
        if (chess.numberOfPieces() <= 5) return endgame.move(board);

        return minmax.move(board, 2, score);
    };

exports.score = score;
exports.move = move;
exports.name = 'JacuBird';