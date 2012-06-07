class UIThree
  camera = scene = renderer = geometry = material = gridMesh = null
  width = height = 0
  depth = 100
  halfDepth = halfW = halfH = offsetW = offsetH = 0
  pieceWidth = pieceHeight = pieceDepth = 100
  pieceInsetDepth = pieceInsetRadius = 0
  pieces = []
  cylinderSegments = 8

  constructor: (@elementId, @game) ->
    @boardSize = @game.getBoardSize()

    width = pieceWidth * @boardSize.width
    height = pieceHeight * @boardSize.height
    halfW = width/2
    halfH = height/2
    halfDepth = depth/2
    offsetW = halfW - halfDepth
    offsetH = halfH - halfDepth

    pieceDepth = depth/1.5
    pieceInsetDepth = depth/4
    pieceInsetRadius = halfDepth/1.5


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

  newMat = (color, wireframe = false) ->
    new THREE.MeshLambertMaterial
      color: color
      wireframe: wireframe

  materials =
    empty: newMat(0x999999, true)
    a: newMat 0xff0000
    b: newMat 0x000000
    grid: newMat 0xffff00
    text: newMat 0xFF0000
    leg: newMat 0x0000ff
    wire: new THREE.MeshBasicMaterial
      color: 0xaaaaaa
      wireframe: true

  createPiece: (index) =>
    pieceGeom = new THREE.CylinderGeometry halfDepth, halfDepth, pieceDepth, cylinderSegments

    mesh = @createMeshBlock index, pieceGeom
    pieceGeom.computeBoundingBox()
    pieceGeomBox = pieceGeom.boundingBox

    # create a solid we can use to create an inset on the piece, to give it some definition
    pieceInsetGeom = new THREE.CylinderGeometry pieceInsetRadius, pieceInsetRadius, pieceDepth - pieceInsetDepth, cylinderSegments
    subtractInset = (z) =>
      pieceInsetMesh = @createMeshBlock index, pieceInsetGeom
      pieceInsetMesh.position.z = z
      # subtract the inset to give a beveled look
      mesh.subtract pieceInsetMesh
      pieceInsetMesh 

    [pieceGeomBox.max.z, pieceGeomBox.min.z].forEach subtractInset

    mesh


  createMeshBlock: (index, geom, material = materials.empty) =>
    mesh = new THREE.Mesh geom, material
    mesh.position.x = index.col * pieceWidth - offsetW
    mesh.position.y = index.row * pieceHeight - offsetH
    mesh.rotation.x = Math.PI/2
    mesh

  setupPiece: (index) =>
    pieceMesh = @createPiece index
    pieces[index.row] = [] unless !!pieces[index.row]
    pieces[index.row][index.col] = pieceMesh

    @grp.add pieceMesh

  setupGrid: =>
    # will contain the grid objects
    gridGroup = new THREE.Object3D
    gridAdd = (obj) ->
      gridGroup.add obj

    gridGeom = new THREE.CubeGeometry depth, depth, depth
    pieceSlotGeom = new THREE.CubeGeometry halfDepth, pieceDepth, depth

    blocks = @game.positionIndices().map (index) =>
      blk = @createMeshBlock index, gridGeom, materials.grid

      # first we're going to work on removing the piece hole
      holeGeom = new THREE.CylinderGeometry halfDepth, halfDepth, depth, cylinderSegments
      hole = @createMeshBlock index, holeGeom, materials.empty
      blk.subtract hole

      # now let's remove the portion that allows the piece to fall through the top
      if index.row != @game.getBoardSize().height-1
        slot = @createMeshBlock index, pieceSlotGeom, materials.wire
        slot.rotation.x = Math.PI/2
        slot.rotation.z = Math.PI/2
        blk.subtract slot

      blk

    blocks.forEach gridAdd

    gridWidth = depth * @boardSize.width
    legs = @createGridLegs gridWidth
    legs.forEach (leg) ->
      gridGroup.add leg

    gridGroup

  createGridLegs: (gridWidth) =>
    right = @createGridLeg gridWidth, 1
    left = @createGridLeg gridWidth, -1
    [right, left]

  createGridLeg: (gridWidth, sign) =>
    legGeom = new THREE.Object3D
    legHeight = height * 1.5
    vert = new THREE.CubeGeometry halfDepth, legHeight, depth*1.5
    vertMesh = new THREE.Mesh vert, materials.leg

    console.log "gridWidth = #{gridWidth}"
    vertMesh.position.x = sign * (gridWidth/2 + halfDepth/2)
    vertMesh.position.y += legHeight/8

    legGeom.add vertMesh
    legGeom


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

    #lighting
    directionalLight = new THREE.DirectionalLight()
    directionalLight.position.set( 1, 1, 1).normalize()
    scene.add( directionalLight )

    directionalLight = new THREE.DirectionalLight()
    directionalLight.position.set( -1, -1, -1).normalize()
    scene.add( directionalLight ) 

    renderer = new THREE.WebGLRenderer
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
      @grp.rotation.x -= 0.01
      @grp.rotation.y -= 0.02

      @game.positionIndices().forEach @renderIndex

    renderer.render scene, camera

  renderIndex: (index) =>
    markers = @getMarkers()
    piece = pieces[index.row][index.col]
    marker = @game.markerAt(index)
    piece.material = @getMaterialByMarker marker
    piece.visible = marker != markers.empty 

  getMarkers: =>
    @game.getMarkers()

  getMaterialByMarker: (marker) =>
    markers = @getMarkers()
    switch marker
      when markers.empty then materials.empty
      when markers.a then materials.a
      when markers.b then materials.b
      else throw 'There is no material defined for that marker'

