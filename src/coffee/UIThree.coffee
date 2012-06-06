class UIThree
  camera = scene = renderer = geometry = material = mesh = null

  start: =>
    init()
    animate()

  init = =>
    scene = new THREE.Scene
    w = window.innerWidth
    h = window.innerHeight
    camera = new THREE.PerspectiveCamera 75, w/h, 1, 10000
    camera.position.z = 1000
    scene.add camera

    depth = 50
    width = 700
    height = 500

    geometry = new THREE.CubeGeometry width, height, depth
    material = new THREE.MeshBasicMaterial 
      color: 0xff0000
      wireframe: true

    mesh = new THREE.Mesh geometry, material
    scene.add mesh

    renderer = new THREE.CanvasRenderer
    renderer.setSize w, h

    document.body.appendChild renderer.domElement

  animate = =>
    requestAnimationFrame animate
    render()

  render = =>
    mesh.rotation.x += 0.01
    mesh.rotation.y += 0.02

    renderer.render scene, camera
