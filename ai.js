var Chess = require('./modules/chess-extended.js').Chess,
    deepening = require('./modules/deepening.js'),
    Modules = { deepening: deepening.move },
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
        [KING]: 0
    },
    valuePieces = function (chess, color) {
        return chess.pieces(color)
            .map(p => { return PIECEVALUES[p.type]; })
            .reduce((v1, v2) => { return v1 + v2; }, 0);
    };
// Feel free to give your AI a more personal name
//ai.name = 'Tørrfisk - ' + Math.floor(Math.random() * 1000);


ai.move = function (board) {
    var depth = 4,
        score = function (chess) {
            var score = (valuePieces(chess, 'w') - valuePieces(chess, 'b')) * 2;
            if (chess.in_check()) score -= 1;
            if (chess.in_checkmate()) score += 10000;
            return chess.turn() === 'w' ? score : score * -1;
        },
        span = 3;


    return Modules.deepening(board, depth, score, span);
};

//https://jsfiddle.net/vo5sc0r6/7/
exports.move = ai.move;
exports.name = ai.name;