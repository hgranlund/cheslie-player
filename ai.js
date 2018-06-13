var Chess = require('./modules/chess-extended.js').Chess,
    deepening = require('./modules/deepening.js'),
    Modules = { deepening: deepening.move },
    endgame = require('./modules/endgame.js'),

    ai = {};

var
    PAWN = 'p',
    KNIGHT = 'n',
    BISHOP = 'b',
    ROOK = 'r',
    QUEEN = 'q',
    KING = 'k',
    BLACK = 'b',
    WHITE = 'w',
    PIECEVALUES = {
        [PAWN]: 1,
        [KNIGHT]: 3,
        [BISHOP]: 3,
        [ROOK]: 5,
        [QUEEN]: 9,
        [KING]: 100
    },
    valuePieces = function (chess, color) {
        return chess.pieces(color)
            .map(p => { return PIECEVALUES[p.type]; })
            .reduce((v1, v2) => { return v1 + v2; }, 0);
    },
    valueMoves = (chess) => {
        return chess.moves({ verbose: true })
            .map(move => { return (move.flag === 'c') ? 1 : 0 })
            .reduce((v1, v2) => { return v1 + v2; }, 0);
    },
    piecesV = function (chess, color) {
        var letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
            squares = [];

        for (var i = 1; i <= 8; i++) {
            letters.forEach(function (letter) {
                squares.push(letter + i);
            });
        };

        return squares.map(function (square) {
            var p = chess.get(square);
            if (!p) return;
            p.square = square;
            return p;
        }).filter(function (val) {
            if (color && val) {
                return val.color === color;
            }
            return val;
        });
    },
    possitionScore = (chess) => {
        var whiteC = piecesV(chess, 'w').filter(p => ['c', 'd', 'e', 'f'].some(l => l === p.square[0]))
        var blackC = piecesV(chess, 'b').filter(p => ['c', 'd', 'e', 'f'].some(l => l === p.square[0]))
        return whiteC.length - blackC.length
    }
// Feel free to give your AI a more personal name
//ai.name = 'Tørrfisk - ' + Math.floor(Math.random() * 1000);

var score = (chess) => {
    var score = (valuePieces(chess, 'w') - valuePieces(chess, 'b')) * 10;

    if (chess.in_check()) score -= 1;
    if (chess.in_checkmate()) score -= 10000;
    score += valueMoves(chess)
    score += possitionScore(chess);
    score += Math.random()
    return chess.turn() === 'w' ? score : score * -1;
}

var opening = (fen) => {
    if (fen === "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1") return 'e4';
    if (fen.startsWith("rnbqkbnr/pppppppp/8/8")) return 'e6';
    return undefined
}


ai.move = function (board) {
    var chess = new Chess(board);
    var move = opening(board)
    if (move) return move;
    if (chess.numberOfPieces() <= 5) return endgame.move(board);

    var depth = 4,
        span = 3,
        numerOfMoves = chess.moves().length;
    console.log(numerOfMoves);
    if (numerOfMoves <= 5) {
        depth = 8
        span = 4
    }
    if (numerOfMoves <= 10) {
        depth = 6
        span = 4
    }
    if (numerOfMoves <= 15) {
        depth = 4
        span = 3
    }
    if (numerOfMoves <= 20) {
        depth = 3
        span = 2
    }
    return Modules.deepening(board, depth, score, span);
};
ai.name = "Doctor who"
exports.score = score;
//https://jsfiddle.net/vo5sc0r6/7/
exports.move = ai.move;
exports.name = ai.name;