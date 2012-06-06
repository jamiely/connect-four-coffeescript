class UIThree
  camera = scene = renderer = geometry = material = gridMesh = null
  depth = width = height = 0
  halfDepth = halfW = halfH = offsetW = offsetH = 0
  pieceWidth = pieceHeight = pieceDepth = 100
  pieces = []

  constructor: (@elementId, @game) ->
    @boardSize = @game.getBoardSize()
    depth = pieceDepth
    width = pieceWidth * @boardSize.width
    height = pieceHeight * @boardSize.height
    halfW = width/2
    halfH = height/2
    halfDepth = depth/2
    offsetW = halfW - halfDepth
    offsetH = halfH - halfDepth

  start: =>
    @init()
    @animate()
    @setupControl()

  setupControl: =>
    instructions = $('<p>Press the numbers 1 through 7 to play a piece in that column</p>')
    $('body').prepend(instructions)
    ascii1 = '1'.charCodeAt()
    $(document).keypress (ev) =>
      console.log ev.which
      @game.move new Move(ev.which-ascii1) if ev.which >= ascii1 and ev.which <= '9'.charCodeAt()

  setupPieces: =>
    @game.positionIndices().forEach @setupPiece

  newMat = (color) ->
    new THREE.MeshBasicMaterial
      color: color
      wireframe: true

  materials =
    empty: newMat 0x999999
    a: newMat 0x00ff00
    b: newMat 0x0000ff
    grid: newMat 0xff0000
    text: new THREE.MeshBasicMaterial 
      color: 0xFFFF00
      wireframe: true

  setupPiece: (index) =>
    cd = depth/2
    pieceGeom = new THREE.CylinderGeometry cd, cd, cd
    pieceMesh = new THREE.Mesh pieceGeom, materials.empty
    pieceMesh.position.x = index.col * pieceWidth - offsetW
    pieceMesh.position.y = index.row * pieceHeight - offsetH
    pieceMesh.rotation.x = Math.PI/2
    pieces[index.row] = [] unless !!pieces[index.row]
    pieces[index.row][index.col] = pieceMesh

    @grp.add pieceMesh

  setupGrid: =>
    # Setup the grid mesh
    gridMesh = new THREE.Mesh geometry, material
    gridMesh

  setupGroup: =>
    @grp = new THREE.Object3D
    @grp.rotation.x = Math.PI 
    @grp


  init: =>
    @setupGroup()

    scene = new THREE.Scene
    w = window.innerWidth
    h = window.innerHeight
    camera = new THREE.PerspectiveCamera 75, w/h, 1, 10000
    camera.position.z = 1000
    scene.add camera

    geometry = new THREE.CubeGeometry width, height, depth
    material = materials.grid

    @grp.add @setupGrid()

    scene.add @grp
    @setupPieces()


    # Setup the text geometry used to display a win notice
    textGeom = new THREE.TextGeometry "Win!", 
      font: "helvetiker"
      size: 100
    textGeom.computeBoundingBox()
    console.log "Textgeom bounding box: #{textGeom.boundingBox.min.x}  #{textGeom.boundingBox.max.x}"

    @textMesh = new THREE.Mesh textGeom, materials.text
    @textMesh.position.z = 700
    @textMesh.position.x -= textGeom.boundingBox.max.x/2
    @textMesh.position.y -= textGeom.boundingBox.max.y/2
    @textMesh.visible = false
    scene.add @textMesh

    renderer = new THREE.CanvasRenderer
    renderer.setSize w, h

    $(@elementId).append renderer.domElement

  animate: =>
    requestAnimationFrame @animate
    @render()

  render: =>
    if @game.isWin()
      @grp.visible = false
      @textMesh.visible = true
      @textMesh.rotation.x += 0.01
    else
      @grp.rotation.y += 0.02

      @game.positionIndices().forEach @renderIndex

    renderer.render scene, camera

  renderIndex: (index) =>
    piece = pieces[index.row][index.col]
    piece.material = @getMaterialByMarker @game.markerAt(index)

  getMaterialByMarker: (marker) =>
    markers = @game.getMarkers()
    switch marker
      when markers.empty then materials.empty
      when markers.a then materials.a
      when markers.b then materials.b
      else throw 'There is no material defined for that marker'

