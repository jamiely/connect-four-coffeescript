class Board
  constructor: ->
    markers = @markers = 
      empty: ''
      a: 'a'
      b: 'b'
    @possibleMarkers = value for _, value of @markers

    size = @size =
      width: 7
      height: 6

    # we throw away x and y here. we don't really need them
    @board = [1..size.height].map ->
      markers.empty for _ in [1..size.width]

  # Updates the board position
  move: (marker, position) =>
    throw 'Invalid marker' if marker in @possibleMarkers

    row = position.row
    col = position.col
    throw 'Out of bounds' if col > @size.width or col < 0 or row > @size.height or row < 0 

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
    indices = @positionIndices()
    indices.reduce ((memo, i) =>
      memo = memo and @posIs(i, @markers.empty)
      memo
      ), true

# stuff

class Game
  constructor: ->
    @board = new Board

  getBoard: ->
    @board

