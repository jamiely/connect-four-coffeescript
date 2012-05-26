class Board
  constructor: (@size = {width: 7, height: 6}) ->
    @markers = 
      empty: ''
      a: 'a'
      b: 'b'
    @possibleMarkers = value for _, value of @markers

    @length = @size.width * @size.height

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

  # Returns an array of indices which can be used to iterate over the
  # positions. 
  # @returns {Array} The return looks like: `[ {row: 0, col: 0}, {row: 0,
  #                  col: 1}, ... ]`.
  positionIndices: =>
    [0..@size.height-1].reduce ((mem, row) =>
      row = [0..@size.width-1].map (col) =>
        row: row
        col: col
      mem.concat row
      ), []

  # helper methods for isEmpty and movesRemaining
  positionsEmpty: (fun) =>
    @positionIndices().map (i) =>
      @posIs i, @markers.empty

  getEmptyPositions: =>
    @positionIndices().filter (i) =>
      @posIs i, @markers.empty

  hasMovesRemaining: =>
    _.any @positionsEmpty(), _.identity

  isEmpty: =>
    _.all @positionsEmpty(), _.identity

