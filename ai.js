var Chess = require('./modules/chess-extended.js').Chess;
var minmax = require('./modules/minmax.js');
var rndJesus = require('./sample-players/rnd-jesus.js');
var endgamer = require('./sample-players/endgamer.js');
var minmaxer = require('./sample-players/minmaxer.js');
exports.name = 'FaceOfBoe - ' + Math.floor(Math.random() * 1000);


var pieceValues = {
    'p': 1,
    'n': 3,
    'b': 3,
    'r': 5,
    'q': 9,
    'k': 100,
};

var sumPieceValues = function (pieces) {
    return pieces.reduce((a, b) => a + b, 0);
};

exports.move = function (board, doMove) {
    minmax.move(board, doMove, function (chess) {
        var black = sumPieceValues(chess.pieces('b').map((p) => pieceValues[p.type]));
        var white = sumPieceValues(chess.pieces('w').map((p) => pieceValues[p.type]));
        return (chess.turn() == 'w') ? white - black : black - white;
    }, 10);
};
