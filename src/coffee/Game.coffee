class Game
  constructor: ->
    @board = new Board
    @directions = [-1..1].reduce ((mem, row) =>
      row = [-1..1].map (col) =>
        row: row
        col: col
      mem.concat row
      ), []
    # looks like, used as deltas
    #     [
    #       {row: -1, col: -1},
    #       {row: -1, col: 0},
    #       {row: -1, col: 1},
    #       ...
    #     ]
    @directions = _.reject @directions, (dir) ->
      dir.row is 0 and dir.col is 0
    @currentMarker = @board.markers.a

  getBoard: =>
    @board

  # Recursive check for markers in a row
  # @param {Object} index
  # @param {String} marker
  # @param {Object} delta
  # @param {Number} steps
  # @returns {Boolean} Returns true if the marker at the passed position
  #                    matches the passed marker and markers in the same
  #                    direction for the given number of steps _also_
  #                    match the passed marker.
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

  # Determines whether there is any winning combination of markers
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

  # @todo Not well implemented
  isWinPossible: =>
    not @board.hasMovesRemaining()

  getCurrentMarker: =>
    @currentMarker

  markerAt: (index) =>
    @board.markerAt index

  positionIndices: =>
    @board.positionIndices()

  # Returns the first empty row in the passed column. Note that the
  # bottom row has the highest row index.
  getFirstEmptyRowInCol: (column) =>
    throw 'Out of bounds' if not @board.isInBounds {row: 0, col: column}

    # This function implements a recursive check
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

  # Applies the passed move to the game.
  # @param {Object} move is a Move object
  # @returns {Mixed} Returns false if the move could not be made because
  #                  someone won. Otherwise, returns the last marker
  #                  used.
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

  getBoardSize: =>
    @board.size

  getMarkers: =>
    @board.markers
