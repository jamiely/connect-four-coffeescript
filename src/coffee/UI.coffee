class UI
  constructor: (@elementId, @game) ->

  generateBoardView: =>
    board = @game.getBoard()
    sz = board.size

    tbl = $('<table border="1"></table>')
    [0..sz.height-1].forEach (row) ->

      rowElement = $ '<tr></tr>'
      [0..sz.width-1].forEach (col) ->
        marker = board.markerAt 
          row: row
          col: col
        rowElement.append $("<td>#{marker}</td>")

      tbl.append rowElement 

    tbl

  generateMoveView: =>
    lbl = $('<label>Column?</label>')
    input = $('<input type="number" />').appendTo(lbl)
    submit = $('<button />').html('Submit').click (e) =>
      e.preventDefault()
      @render() if @game.move(new Move input.val()-1)

    $('<div class="move"></div>').
      append(lbl).
      append(submit)

  generateWinView: =>
    $('<div>Won!</div>')

  render: =>
    board = @generateBoardView()
    main = $(@elementId).
      empty().
      append(board)

    main.append if @game.isWin() then @generateWinView() else @generateMoveView

    board.find('input').focus()
