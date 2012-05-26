describe "Game Play", ->
  game = null

  beforeEach ->
    game = new Game

  describe "Move choice", ->
    it "should be determined by choosing a column to play", ->
      colNum = 1
      move = new Move colNum
      game.move move
      expect(game.markerAt 
        row: 5
        col: colNum
        ).toBe 'a'
      game.move move
      expect(game.markerAt 
        row: 4,
        col: colNum
        ).toBe 'b'
    it "should be able to determine the first empty row in a column", ->
      expect(game.getFirstEmptyRowInCol(1)).toBe game.getBoard().size.height-1

  it "should alternate between two markers", ->
    expect(game.getCurrentMarker()).toBe 'a'
    game.move(new Move 1)
    expect(game.getCurrentMarker()).toBe 'b'

  it "should detect a win when someone gets a vertical match", ->
    a = new Move 1
    b = new Move 2

    game.move a
    expect(game.isWin()).toBe false
    game.move b
    expect(game.isWin()).toBe false

    game.move a
    expect(game.isWin()).toBe false
    game.move b
    expect(game.isWin()).toBe false

    game.move a
    expect(game.isWin()).toBe false
    game.move b
    expect(game.isWin()).toBe false

    game.move a
    expect(game.isWin()).toBe true

  it "should throw an error when someone tries to move after there's already been a win", ->
    a = new Move 1
    b = new Move 2

    [1..3].forEach ->
      [a, b].forEach (m) ->
        game.move m

    game.move a
    expect(game.isWin()).toBe true
    expect(->
      game.move b
      ).toThrow 'Cannot make another move because the game is already won.'

  it "should return false when a move cannot be made in the column because it's full", ->
    m = new Move 1
    [1..game.getBoard().size.height].forEach ->
      expect(game.move m).toBeTruthy() 

    expect(game.move m).toBe false

