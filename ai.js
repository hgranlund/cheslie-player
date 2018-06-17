var Chess = require('./modules/chess-extended.js').Chess,
    deepening = require('./modules/deepening.js'),
    minmax = require('./modules/minmax.js'),
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
        [KING]: 10
    },
    // move.flags
// 'n' - a non - capture
// 'b' - a pawn push of two squares
// 'e' - an en passant capture
// 'c' - a standard capture
// 'p' - a promotion
// 'k' - kingside castling
// 'q' - queenside castling
    mapMoveFlagToScore = {'n': 0, 'b': 0, 'e': 1, 'c': 2, 'p': 1, 'k': 3, 'q':3},
    squareLatterToInt = {'a':7, 'b':6, 'c':5,'d':4, 'e':3,'f':2,'g':1,'h':0},
    pieceSquareTables = {
        p: [0, 0, 0, 0, 0, 0, 0, 0,
            50, 50, 50, 50, 50, 50, 50, 50,
            10, 10, 20, 30, 30, 20, 10, 10,
            5, 5, 10, 25, 25, 10, 5, 5,
            0, 0, 0, 20, 20, 0, 0, 0,
            5, -5, -10, 0, 0, -10, -5, 5,
            5, 10, 10, -20, -20, 10, 10, 5,
            0, 0, 0, 0, 0, 0, 0, 0
        ],
        k: [-50, -40, -30, -30, -30, -30, -40, -50,
            -40, -20, 0, 0, 0, 0, -20, -40,
            -30, 0, 10, 15, 15, 10, 0, -30,
            -30, 5, 15, 20, 20, 15, 5, -30,
            -30, 0, 15, 20, 20, 15, 0, -30,
            -30, 5, 10, 15, 15, 10, 5, -30,
            -40, -20, 0, 5, 5, 0, -20, -40,
            -50, -40, -30, -30, -30, -30, -40, -50
        ],
        b: [-20, -10, -10, -10, -10, -10, -10, -20,
            -10, 0, 0, 0, 0, 0, 0, -10,
            -10, 0, 5, 10, 10, 5, 0, -10,
            -10, 5, 5, 10, 10, 5, 5, -10,
            -10, 0, 10, 10, 10, 10, 0, -10,
            -10, 10, 10, 10, 10, 10, 10, -10,
            -10, 5, 0, 0, 0, 0, 5, -10,
            -20, -10, -10, -10, -10, -10, -10, -20
        ],
        r: [0, 0, 0, 0, 0, 0, 0, 0,
            5, 10, 10, 10, 10, 10, 10, 5,
            -5, 0, 0, 0, 0, 0, 0, -5,
            -5, 0, 0, 0, 0, 0, 0, -5,
            -5, 0, 0, 0, 0, 0, 0, -5,
            -5, 0, 0, 0, 0, 0, 0, -5,
            -5, 0, 0, 0, 0, 0, 0, -5,
            0, 0, 0, 5, 5, 0, 0, 0
        ],
        q: [-20, -10, -10, -5, -5, -10, -10, -20,
            -10, 0, 0, 0, 0, 0, 0, -10,
            -10, 0, 5, 5, 5, 5, 0, -10,
            -5, 0, 5, 5, 5, 5, 0, -5,
            0, 0, 5, 5, 5, 5, 0, -5,
            -10, 5, 5, 5, 5, 5, 0, -10,
            -10, 0, 5, 0, 0, 0, 0, -10,
            -20, -10, -10, -5, -5, -10, -10, -20
        ],
        k: [-30, -40, -40, -50, -50, -40, -40, -30,
            -30, -40, -40, -50, -50, -40, -40, -30,
            -30, -40, -40, -50, -50, -40, -40, -30,
            -30, -40, -40, -50, -50, -40, -40, -30,
            -20, -30, -30, -40, -40, -30, -30, -20,
            -10, -20, -20, -20, -20, -20, -20, -10,
            20, 20, 0, 0, 0, 0, 20, 20,
            20, 30, 10, 0, 0, 10, 30, 20
        ],
        kEnd: [-50, -40, -30, -20, -20, -30, -40, -50,
            -30, -20, -10, 0, 0, -10, -20, -30,
            -30, -10, 20, 30, 30, 20, -10, -30,
            -30, -10, 30, 40, 40, 30, -10, -30,
            -30, -10, 30, 40, 40, 30, -10, -30,
            -30, -10, 20, 30, 30, 20, -10, -30,
            -30, -30, 0, 0, 0, 0, -30, -30,
            -50, -30, -30, -30, -30, -30, -30, -50]
    },
    sum = (v1, v2) => { return v1 + v2; },
    mapSquareToArrayPosition = function (square) {
        if (!square || square.length !== 2){
            console.log("error in mapSquareToArrayPosition")
            return 0;
        }
        square = square.toLowerCase();
        
        return squareLatterToInt[square[0]] + Math.abs(8 - parseInt(square[1])) * 8 ;
    },
    piecePositionValue = function (piece) {
        var positionScore = 0;
        var c = piece.type.toLowerCase();
        if (pieceSquareTables.hasOwnProperty(piece.type)) {
            var squareTable = (piece.color === 'w') ? pieceSquareTables[piece.type] : pieceSquareTables[piece.type].reverse();
            positionScore = squareTable[mapSquareToArrayPosition(piece.square)];
        }
        return positionScore;
    },

    valuePieces = function (chess, color) {
        return chess.pieces(color)
            .map(piece => {return PIECEVALUES[piece.type]})
            .reduce(sum, 0);
    },
    valueMoves = (chess) => {
        var score = chess.moves({
                verbose: true
            })
            .map(move => { return move.flags.split('')})
            .map(scoreList => { return scoreList.map(flag => { return mapMoveFlagToScore[flag] })})
            .map(scoreList => {return scoreList.reduce(sum,0)})
            .reduce(sum, 0);
        return chess.turn() === 'w' ? score : score * -1
    },
    positionScore = (chess) =>  {
        var scorePlayer=  chess.pieces('w')
            .map(p => {return piecePositionValue(p)})
            .reduce(sum, 0);
        var scoreOther = chess.pieces('b')
            .map(p => { return piecePositionValue(p) })
            .reduce(sum, 0);
        return scorePlayer - scoreOther ; 
    },
    materialScore = (chess) => {
        return  (valuePieces(chess, 'w') - valuePieces(chess, 'b')) * 1000;
    },
    blackOrWhiteSign = (score, chess) => { return chess.turn() === 'w' ? score : score * -1}

var score = (chess) => {
    var score = materialScore(chess);
    if (chess.in_check()) score -= blackOrWhiteSign(5, chess);
    if (chess.in_checkmate()) score -= blackOrWhiteSign(1000000, chess);
    score += blackOrWhiteSign(valueMoves(chess), chess);
    score += positionScore(chess);
    score += Math.random();
    return score;
}

ai.move = function (board) {
    var chess = new Chess(board);
    if (chess.numberOfPieces() <= 5) return endgame.move(board);

    var depth = 2,
        numerOfMoves = chess.moves().length;

    // if (numerOfMoves <= 5) {
    //     depth = 8
    //     span = 4
    // }
    // if (numerOfMoves <= 10) {
    //     depth = 6
    //     span = 4
    // }
    // if (numerOfMoves <= 15) {
    //     depth = 4
    //     span = 3
    // }
    // if (numerOfMoves <= 20) {
    //     depth = 6
    //     span = 3
    // }
    return minmax.move(board, depth, score);
};
ai.name = "Doctor who"
exports.score = score;
exports.move = ai.move;
exports.name = ai.name;