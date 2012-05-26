class Board
  constructor: ->
    markers = @markers = 
      empty: ''
      a: 'a'
      b: 'b'

    size = @size =
      width: 7
      height: 6

    # we throw away x and y here. we don't really need them
    @board = [1..size.height].map ->
      markers.empty for x in [1..size.width]

# stuff

class Game
  constructor: ->
    @board = new Board

  getBoard: ->
    @board

