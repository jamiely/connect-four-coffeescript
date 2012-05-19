describe "Game", ->
  it "should be defined", ->
    expect(Game).toBeTruthy()

  it "should have a board", ->
    expect(game.getBoard()).toBeTruthy()

describe "Board", ->
  it "should have a board of have 7 columns and 6 rows", ->
    board = game.getBoard()
    expect(board).toBeTruthy()
    expect(board.size()).toBe
      width: 7
      height: 6
  it "should be empty", ->
    expect(false).toBeTruthy()

describe "Move", ->
  it "should modify the board in the correct position", ->
    expect(false).toBeTruthy()

describe "Gameover check", ->
  it "should be a player's win whenever there are four in a row", ->
    expect(false).toBeTruthy()
  it "should be a stalemate whenever it is not possible to win", ->
    expect(false).toBeTruthy()

