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

describe "Board", ->
  game = null
  initGame = ->
    game = new Game
  getExample = emptyBoardArray

  beforeEach initGame

  it "should have a size of 7 columns and 6 rows", ->
    board = game.getBoard()
    expect(board.size).toEqual
      width: 7
      height: 6

  it "should have a board of have 7 columns and 6 rows, which are empty.", ->
    board = game.getBoard()
    example = getExample()
    expect(board.board).toEqual example

  it "should have width*height position indices", ->
    board = game.getBoard()
    indices = board.positionIndices()
    expect(indices.length).toBe(7*6)
    expect(indices[0]).toEqual
      row: 0
      col: 0
    expect(indices).toEqual  [ { row : 0, col : 0 }, { row : 0, col : 1 }, { row : 0, col : 2 }, { row : 0, col : 3 }, { row : 0, col : 4 }, { row : 0, col : 5 }, { row : 0, col : 6 }, { row : 1, col : 0 }, { row : 1, col : 1 }, { row : 1, col : 2 }, { row : 1, col : 3 }, { row : 1, col : 4 }, { row : 1, col : 5 }, { row : 1, col : 6 }, { row : 2, col : 0 }, { row : 2, col : 1 }, { row : 2, col : 2 }, { row : 2, col : 3 }, { row : 2, col : 4 }, { row : 2, col : 5 }, { row : 2, col : 6 }, { row : 3, col : 0 }, { row : 3, col : 1 }, { row : 3, col : 2 }, { row : 3, col : 3 }, { row : 3, col : 4 }, { row : 3, col : 5 }, { row : 3, col : 6 }, { row : 4, col : 0 }, { row : 4, col : 1 }, { row : 4, col : 2 }, { row : 4, col : 3 }, { row : 4, col : 4 }, { row : 4, col : 5 }, { row : 4, col : 6 }, { row : 5, col : 0 }, { row : 5, col : 1 }, { row : 5, col : 2 }, { row : 5, col : 3 }, { row : 5, col : 4 }, { row : 5, col : 5 }, { row : 5, col : 6 } ]

  it "should return true for isEmpty", ->
    board = game.getBoard()
    expect(board.isEmpty()).toBe true

  it "should return posIs true when appropriate", ->
    board = game.getBoard()
    index = 
      row: 3
      col: 2
    board.move(board.markers.a, index)
    expect(board.posIs(index, board.markers.a)).toBe true

  it "should be detectable when there are no moves left", ->
    board = game.getBoard()
    example = [
      ['a', 'b', 'a', 'a', 'b', 'a', 'a'],
      ['b', 'a', 'b', 'b', 'a', 'b', 'b'],
      ['a', 'b', 'a', 'a', 'b', 'a', 'a'],
      ['b', 'a', 'b', '', 'a', 'b', 'b'],
      ['a', 'b', 'a', 'a', 'b', 'a', 'a'],
      ['b', 'a', 'b', 'b', 'a', 'b', 'b']
    ]
    board.board = example
    expect(board.hasMovesRemaining()).toBe true
    example = [
      ['a', 'b', 'a', 'a', 'b', 'a', 'a'],
      ['b', 'a', 'b', 'b', 'a', 'b', 'b'],
      ['a', 'b', 'a', 'a', 'b', 'a', 'a'],
      ['b', 'a', 'b', 'b', 'a', 'b', 'b'],
      ['a', 'b', 'a', 'a', 'b', 'a', 'a'],
      ['b', 'a', 'b', 'b', 'a', 'b', 'b']
    ]
    board.board = example
    expect(board.hasMovesRemaining()).toBe false

describe "Move", ->
  game = null

  getExample = ->
    example = [
      ['', '', '', '', '', '', ''],
      ['', '', 'a', '', '', '', ''],
      ['', '', '', '', '', '', ''],
      ['', '', '', '', '', '', ''],
      ['', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '']
    ]
    example

  beforeEach ->
    game = new Game

  it "should modify the board in the correct position", ->
    board = game.getBoard()
    index = 
      row: 1
      col: 2
    example = getExample()
    board.move board.markers.a, index
    expect(board.board).toEqual example

  it "should be confirmable via board#markerAt", ->
    board = game.getBoard()
    index = 
      row: 1
      col: 2
    example = getExample()
    board.move board.markers.a, index
    expect(board.markerAt index).toEqual board.markers.a
    expect(board.posIs index, board.markers.a).toBe true
    expect(board.posIs index, board.markers.b).toBeFalsy()

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

