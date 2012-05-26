class Board
  constructor: ->
    @markers = 
      empty: ''
      a: 'a'
      b: 'b'
    @possibleMarkers = value for _, value of @markers

    @size =
      width: 7
      height: 6

    # we throw away x and y here. we don't really need them
    @board = [1..@size.height].map =>
      @markers.empty for _ in [1..@size.width]

  isInBounds: (index) =>
    row = index.row
    col = index.col
    not (col > @size.width-1 or col < 0 or row > @size.height-1 or row < 0)

  # Updates the board position
  move: (marker, position) =>
    throw 'Invalid marker' if not marker in @possibleMarkers

    row = position.row
    col = position.col
    throw 'Out of bounds' if not @isInBounds position

    @board[row][col] = marker

  markerAt: (index) =>
    @board[index.row][index.col]

  posIs: (index, marker) =>
    m = @markerAt index
    marker is m

  positionIndices: =>
    [0..@size.height-1].reduce ((mem, row) =>
      row = [0..@size.width-1].map (col) =>
        row: row
        col: col
      mem.concat row
      ), []

  isEmpty: =>
    results = @positionIndices().map (i) =>
      @posIs i, @markers.empty
    _.all results, _.identity

# stuff
class Move
  constructor: (@col) ->

class Game
  constructor: ->
    @board = new Board
    @directions = [-1..1].reduce ((mem, row) =>
      row = [-1..1].map (col) =>
        row: row
        col: col
      mem.concat row
      ), []
    @directions = _.reject @directions, (dir) ->
      dir.row is 0 and dir.col is 0
    @currentMarker = @board.markers.a

  getBoard: =>
    @board

  checkPosition: (index, marker, delta, steps) =>
    board = @getBoard()
    if steps is 0
      true
    else if board.isInBounds(index) and board.posIs(index, marker) 
      newIndex = 
        row: index.row + delta.row
        col: index.col + delta.col
      @checkPosition newIndex, marker, delta, steps-1
    else
      # No match
      false

  isWin: =>
    # we'll boil this into a recursive check to make things simpler
    board = @getBoard()
    indices = board.positionIndices()
    results = indices.map (i) =>
      marker = board.markerAt i
      if marker is board.markers.empty
        false
      else
        checked = @directions.map (delta) =>
          result = @checkPosition i, marker, delta, 4
          result
        # now check if any of the results were positive
        _.any checked
    _.any results

  isWinPossible: =>
    false

  getCurrentMarker: =>
    @currentMarker

  markerAt: (index) =>
    @board.markerAt index

  getFirstEmptyRowInCol: (column) =>
    throw 'Out of bounds' if not @board.isInBounds {row: 0, col: column}

    helper = (row) =>
      if row < 0
        -1
      else
        marker = @markerAt 
          row: row
          col: column
        if marker is @board.markers.empty
          row
        else
          helper (row-1)

    helper (@board.size.height-1)

  toggleMarker: =>
    @currentMarker = if @currentMarker is @board.markers.a then @board.markers.b else @board.markers.a

  updateBoard: (index) =>
    @board.move @currentMarker, index
    @toggleMarker()

  move: (move) =>
    throw 'Cannot make another move because the game is already won.' if @isWin()

    col = move.col
    row = @getFirstEmptyRowInCol col
    if row >= 0
      @updateBoard 
        row: row
        col: col
    else
      false

