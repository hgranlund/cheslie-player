var should = require('chai').should(),
    Chess = require('../modules/chess-extended.js').Chess,
    ai = require('./../ai.js');

describe('When the ai is asked to generate å move', () => {
    var chess = new Chess();
    var generatedMove;

    before('Make the ai generate a move', () => generatedMove = ai.move(chess.fen()));

    it('should generate a move in a string representation', () => {
        generatedMove.should.be.a('string');
    });

    it('should generate a legal move', () => {
        chess.moves().should.include(generatedMove);
    });
});