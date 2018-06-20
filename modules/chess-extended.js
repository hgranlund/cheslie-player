var Chess = require('chess.js');
if (typeof window === 'undefined') {
    Chess = Chess.Chess;
}

exports.Chess = function (fen) {
    var chess = new Chess(fen),
        numberOfMoves = 0,
        _move = chess.move,
        _pieces= {},
        _game_over = chess.game_over;

    chess.pieces = function (color) {
        if (_pieces[color]) return _pieces[color];
        var letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
            squares = [];

        for (var i = 1; i <= 8; i++) {
            letters.forEach(function (letter) {
                squares.push(letter + i);
            });
        };

        _pieces[color] =  squares.map(function (square) {
            var piece = chess.get(square);
            if (!piece) return null;
            piece.square = square;
            return piece;
        }).filter(function (val) {
            if (color && val) {
                return val.color === color;
            }
            return val;
        });
        return _pieces[color];
    };

    chess.numberOfPieces = function (color) {
        return chess.pieces(color).length;
    };

    chess.movesInformation = function () {
        return chess.moves({ verbose: true });
    };

    chess.move = function (arg) {
        numberOfMoves++;
        _move(arg);
    };

    chess.game_over = function () {
        return numberOfMoves >= 100
            || _game_over();
    };

    return chess;
};