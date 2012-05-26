emptyBoardArray = ->
  example = [
    ['', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '']
  ]
  example

describe "Game", ->
  game = null
  initGame = ->
    game = new Game

  beforeEach initGame

  it "should be defined", ->
    expect(Game).toBeTruthy()

  it "should have a board", ->
    expect(game.getBoard()).toBeTruthy()

  it "should have directions", ->
    expect(game.directions).toEqual [ { row : -1, col : -1 }, { row : -1, col : 0 }, { row : -1, col : 1 }, { row : 0, col : -1 }, { row : 0, col : 1 }, { row : 1, col : -1 }, { row : 1, col : 0 }, { row : 1, col : 1 } ]

describe "Gameover check", ->
  game = null
  beforeEach ->
    game = new Game

  it "should return true when checkPosition is called with 0 steps", ->
    expect(game.checkPosition null, null, null, 0).toBe true

  it "should return true when checkPosition is called with an index and the marker at that index and 1 step", ->
    board = game.getBoard()
    example = [
      ['', '', '', '', '', '', ''],
      ['', '', '', '', '', '', ''],
      ['', '', 'a', '', '', '', ''],
      ['', '', 'a', '', '', '', ''],
      ['', '', 'a', '', '', '', ''],
      ['', '', 'a', '', '', '', '']
    ]
    index =
      row: 2
      col: 2
    board.board = example
    result = game.checkPosition index, 'a', {row: 1, col: 0}, 1
    expect(result).toBe true

  it "should return true when checkPosition is called with an index and the marker at that index, the same marker beneath it, and 2 steps", ->
    board = game.getBoard()
    example = [
      ['', '', '', '', '', '', ''],
      ['', '', '', '', '', '', ''],
      ['', '', 'a', '', '', '', ''],
      ['', '', 'a', '', '', '', ''],
      ['', '', 'a', '', '', '', ''],
      ['', '', 'a', '', '', '', '']
    ]
    index =
      row: 2
      col: 2
    board.board = example
    result = game.checkPosition index, 'a', {row: 1, col: 0}, 2
    expect(result).toBe true

  it "can check whether there are markers in a row", ->
    board = game.getBoard()
    example = [
      ['', '', '', '', '', '', ''],
      ['', '', '', '', '', '', ''],
      ['', '', 'a', '', '', '', ''],
      ['', '', 'a', '', '', '', ''],
      ['', '', 'a', '', '', '', ''],
      ['', '', 'a', '', '', '', '']
    ]
    index =
      row: 2
      col: 2
    board.board = example
    result = game.checkPosition index, 'a', {row: 1, col: 0}, 4
    expect(result).toBe true

  it "should be a player's win whenever there are four in a row", ->
    board = game.getBoard()
    example = [
      ['', '', '', '', '', '', ''],
      ['', '', '', '', '', '', ''],
      ['', '', 'a', '', '', '', ''],
      ['', '', 'a', '', '', '', ''],
      ['', '', 'a', '', '', '', ''],
      ['', '', 'a', '', '', '', '']
    ]
    expect(game.isWin()).toBe false
    board.board = example
    expect(game.isWin()).toBe true

  it "should be a stalemate whenever it is not possible to win", ->
    board = game.getBoard()
    example = [
      ['a', 'b', 'a', 'a', 'b', 'a', 'a'],
      ['b', 'a', 'b', 'b', 'a', 'b', 'b'],
      ['a', 'b', 'a', 'a', 'b', 'a', 'a'],
      ['b', 'a', 'b', '', 'a', 'b', 'b'],
      ['a', 'b', 'a', 'a', 'b', 'a', 'a'],
      ['b', 'a', 'b', 'b', 'a', 'b', 'b']
    ]
    expect(game.isWinPossible()).toBe true
    board.board = example
    expect(game.isWinPossible()).toBe false

