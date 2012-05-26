

describe "Game", ->
  game = null
  initGame = ->
    game = new Game

  beforeEach initGame

  it "should be defined", ->
    expect(Game).toBeTruthy()

  it "should have a board", ->
    expect(game.getBoard()).toBeTruthy()

describe "Board", ->
  game = null
  initGame = ->
    game = new Game
  beforeEach initGame

  it "should have a size of 7 columns and 6 rows", ->
    board = game.getBoard()
    expect(board.size).toEqual
      width: 7
      height: 6

  it "should have a board of have 7 columns and 6 rows", ->
    board = game.getBoard()
    example = [
      ['', '', '', '', '', '', ''],
      ['', '', '', '', '', '', ''],
      ['', '', '', '', '', '', ''],
      ['', '', '', '', '', '', ''],
      ['', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '']
    ]
    expect(board.board).toEqual example

describe "Move", ->
  it "should modify the board in the correct position", ->
    expect(false).toBeTruthy()

describe "Gameover check", ->
  it "should be a player's win whenever there are four in a row", ->
    expect(false).toBeTruthy()
  it "should be a stalemate whenever it is not possible to win", ->
    expect(false).toBeTruthy()

