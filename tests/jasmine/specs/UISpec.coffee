describe "UI", ->
  it "should generate a table based on the game board", ->
    game = new Game
    ui = new UI '#game', game
    tbl = ui.generateBoardView()
    cell = "<td></td>"
    cells = [1..7].map ->
      cell
    row = "<tr>#{cells.join('')}</tr>"
    rows = [1..6].map ->
      row
    tblHtml = "<tbody>#{rows.join('')}</tbody>"

    expect(tbl.html()).toEqual tblHtml

