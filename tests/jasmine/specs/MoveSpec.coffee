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

