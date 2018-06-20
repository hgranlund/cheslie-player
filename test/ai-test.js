var should = require('chai').should(),
    Chess = require('../modules/chess-extended.js').Chess,
    ai = require('./../ai.js');

describe('When the ai is asked to generate a move', () => {
    describe(', and we are at the starting position', () => {
        var chess = new Chess();
        var generatedMove;
        before('Make the ai generate a move', () => {
            chess = new Chess();
            generatedMove = ai.move(chess.fen())
        });

        it('should generate a move in a string representation', () => {
            generatedMove.should.be.a('string');
        });

        it('should generate a legal move', () => {
            chess.moves().should.include(generatedMove);
        });

        it('should generate one of the best moves', () => {
            generatedMove.should.be.oneOf(['e4', 'd4', 'Nc3', 'Nf3'])
        });
        describe('And white has done his move', () => {
            before('Make the ai generate a move', () => {
                var chess = new Chess();                
                chess.move('e4');
                generatedMove = ai.move(chess.fen())
            });
            it('should generate one of the best moves', () => {
                generatedMove.should.be.oneOf(['e6', 'd6', 'Nc6', 'Nf6'])
            });
        })
    })

    describe(', and the board is one move from checkmate', () => {
        var chess = new Chess('1k6/5R2/4Q3/8/8/8/4K1PP/8 w - - 1 2');
        var generatedMove;

        before('Make the ai generate a move', () => {
            generatedMove = ai.move(chess.fen())
        });

        it('should generate a legal move', () => {
            chess.moves().should.include(generatedMove);
        });

        it('should make the best move', () => {
            generatedMove.should.be.eql('Qe8#');
        })
    })
});

describe('When the scoring function evaluets', () => {
    describe(' and black is in checkmate', () => {
        var chess = new Chess('k1Q5/5R2/8/8/8/8/4K3/8 b - - 0 1');
        it('should give the board a really high value', () => {
            ai.score(chess).should.be.gt(10000);
        })
    })
    describe(' and white is in checkmate', () => {
        var chess = new Chess('r1b2knr/1p4p1/7p/p7/2q5/5BB1/5PPP/2qK2NR w - - 0 1');
        it('should give the board a really low value', () => {
            ai.score(chess).should.be.lt(-10000);
        })
    })

    describe('a board that is better for white', () => {
        var chess = new Chess('1k6/5R2/4Q3/8/8/8/4K1PP/8 w - - 1 2');
        it('should give a possitive score', () => {
            ai.score(chess).should.be.greaterThan(0);
        })
    })

    it('should evaluete a sentered pawn better (white)', () => {
        var centerPawn = new Chess('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1');
        var notCenteredPawn = new Chess();
        ai.score(centerPawn).should.be.greaterThan(ai.score(notCenteredPawn));
    })

    it('should evaluete a sentered pawn better (black)', () => {
        var centerPawn = new Chess('rnbqkbnr/pppp1ppp/8/4p3/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
        var notCenteredPawn = new Chess();
        ai.score(centerPawn).should.be.lessThan(ai.score(notCenteredPawn));
    })
})