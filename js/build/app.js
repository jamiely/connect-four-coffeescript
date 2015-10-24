var Board, Game, Move, UI, UIThree,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

Board = (function() {
  function Board(size) {
    var _, j, ref, ref1, results1, value;
    this.size = size != null ? size : {
      width: 7,
      height: 6
    };
    this.isEmpty = bind(this.isEmpty, this);
    this.hasMovesRemaining = bind(this.hasMovesRemaining, this);
    this.getEmptyPositions = bind(this.getEmptyPositions, this);
    this.positionsEmpty = bind(this.positionsEmpty, this);
    this.positionIndices = bind(this.positionIndices, this);
    this.posIs = bind(this.posIs, this);
    this.markerAt = bind(this.markerAt, this);
    this.move = bind(this.move, this);
    this.isInBounds = bind(this.isInBounds, this);
    this.markers = {
      empty: '',
      a: 'a',
      b: 'b'
    };
    ref = this.markers;
    for (_ in ref) {
      value = ref[_];
      this.possibleMarkers = value;
    }
    this.length = this.size.width * this.size.height;
    this.board = (function() {
      results1 = [];
      for (var j = 1, ref1 = this.size.height; 1 <= ref1 ? j <= ref1 : j >= ref1; 1 <= ref1 ? j++ : j--){ results1.push(j); }
      return results1;
    }).apply(this).map((function(_this) {
      return function() {
        var j, ref1, results1;
        results1 = [];
        for (_ = j = 1, ref1 = _this.size.width; 1 <= ref1 ? j <= ref1 : j >= ref1; _ = 1 <= ref1 ? ++j : --j) {
          results1.push(_this.markers.empty);
        }
        return results1;
      };
    })(this));
  }

  Board.prototype.isInBounds = function(index) {
    var col, row;
    row = index.row;
    col = index.col;
    return !(col > this.size.width - 1 || col < 0 || row > this.size.height - 1 || row < 0);
  };

  Board.prototype.move = function(marker, position) {
    var col, ref, row;
    if (ref = !marker, indexOf.call(this.possibleMarkers, ref) >= 0) {
      throw 'Invalid marker';
    }
    row = position.row;
    col = position.col;
    if (!this.isInBounds(position)) {
      throw 'Out of bounds';
    }
    return this.board[row][col] = marker;
  };

  Board.prototype.markerAt = function(index) {
    return this.board[index.row][index.col];
  };

  Board.prototype.posIs = function(index, marker) {
    var m;
    m = this.markerAt(index);
    return marker === m;
  };

  Board.prototype.positionIndices = function() {
    var j, ref, results1;
    return (function() {
      results1 = [];
      for (var j = 0, ref = this.size.height - 1; 0 <= ref ? j <= ref : j >= ref; 0 <= ref ? j++ : j--){ results1.push(j); }
      return results1;
    }).apply(this).reduce(((function(_this) {
      return function(mem, row) {
        var j, ref, results1;
        row = (function() {
          results1 = [];
          for (var j = 0, ref = _this.size.width - 1; 0 <= ref ? j <= ref : j >= ref; 0 <= ref ? j++ : j--){ results1.push(j); }
          return results1;
        }).apply(this).map(function(col) {
          return {
            row: row,
            col: col
          };
        });
        return mem.concat(row);
      };
    })(this)), []);
  };

  Board.prototype.positionsEmpty = function(fun) {
    return this.positionIndices().map((function(_this) {
      return function(i) {
        return _this.posIs(i, _this.markers.empty);
      };
    })(this));
  };

  Board.prototype.getEmptyPositions = function() {
    return this.positionIndices().filter((function(_this) {
      return function(i) {
        return _this.posIs(i, _this.markers.empty);
      };
    })(this));
  };

  Board.prototype.hasMovesRemaining = function() {
    return _.any(this.positionsEmpty(), _.identity);
  };

  Board.prototype.isEmpty = function() {
    return _.all(this.positionsEmpty(), _.identity);
  };

  return Board;

})();

Game = (function() {
  function Game() {
    this.getMarkers = bind(this.getMarkers, this);
    this.getBoardSize = bind(this.getBoardSize, this);
    this.move = bind(this.move, this);
    this.updateBoard = bind(this.updateBoard, this);
    this.toggleMarker = bind(this.toggleMarker, this);
    this.getFirstEmptyRowInCol = bind(this.getFirstEmptyRowInCol, this);
    this.positionIndices = bind(this.positionIndices, this);
    this.markerAt = bind(this.markerAt, this);
    this.getCurrentMarker = bind(this.getCurrentMarker, this);
    this.isWinPossible = bind(this.isWinPossible, this);
    this.isWin = bind(this.isWin, this);
    this.checkPosition = bind(this.checkPosition, this);
    this.getBoard = bind(this.getBoard, this);
    this.board = new Board;
    this.directions = [-1, 0, 1].reduce(((function(_this) {
      return function(mem, row) {
        row = [-1, 0, 1].map(function(col) {
          return {
            row: row,
            col: col
          };
        });
        return mem.concat(row);
      };
    })(this)), []);
    this.directions = _.reject(this.directions, function(dir) {
      return dir.row === 0 && dir.col === 0;
    });
    this.currentMarker = this.board.markers.a;
  }

  Game.prototype.getBoard = function() {
    return this.board;
  };

  Game.prototype.checkPosition = function(index, marker, delta, steps) {
    var board, newIndex;
    board = this.getBoard();
    if (steps === 0) {
      return true;
    } else if (board.isInBounds(index) && board.posIs(index, marker)) {
      newIndex = {
        row: index.row + delta.row,
        col: index.col + delta.col
      };
      return this.checkPosition(newIndex, marker, delta, steps - 1);
    } else {
      return false;
    }
  };

  Game.prototype.isWin = function() {
    var board, indices, results;
    board = this.getBoard();
    indices = board.positionIndices();
    results = indices.map((function(_this) {
      return function(i) {
        var checked, marker;
        marker = board.markerAt(i);
        if (marker === board.markers.empty) {
          return false;
        } else {
          checked = _this.directions.map(function(delta) {
            var result;
            result = _this.checkPosition(i, marker, delta, 4);
            return result;
          });
          return _.any(checked);
        }
      };
    })(this));
    return _.any(results);
  };

  Game.prototype.isWinPossible = function() {
    return !this.board.hasMovesRemaining();
  };

  Game.prototype.getCurrentMarker = function() {
    return this.currentMarker;
  };

  Game.prototype.markerAt = function(index) {
    return this.board.markerAt(index);
  };

  Game.prototype.positionIndices = function() {
    return this.board.positionIndices();
  };

  Game.prototype.getFirstEmptyRowInCol = function(column) {
    var helper;
    if (!this.board.isInBounds({
      row: 0,
      col: column
    })) {
      throw 'Out of bounds';
    }
    helper = (function(_this) {
      return function(row) {
        var marker;
        if (row < 0) {
          return -1;
        } else {
          marker = _this.markerAt({
            row: row,
            col: column
          });
          if (marker === _this.board.markers.empty) {
            return row;
          } else {
            return helper(row - 1);
          }
        }
      };
    })(this);
    return helper(this.board.size.height - 1);
  };

  Game.prototype.toggleMarker = function() {
    return this.currentMarker = this.currentMarker === this.board.markers.a ? this.board.markers.b : this.board.markers.a;
  };

  Game.prototype.updateBoard = function(index) {
    this.board.move(this.currentMarker, index);
    return this.toggleMarker();
  };

  Game.prototype.move = function(move) {
    var col, row;
    if (this.isWin()) {
      throw 'Cannot make another move because the game is already won.';
    }
    col = move.col;
    row = this.getFirstEmptyRowInCol(col);
    if (row >= 0) {
      return this.updateBoard({
        row: row,
        col: col
      });
    } else {
      return false;
    }
  };

  Game.prototype.getBoardSize = function() {
    return this.board.size;
  };

  Game.prototype.getMarkers = function() {
    return this.board.markers;
  };

  return Game;

})();

Move = (function() {
  function Move(col1) {
    this.col = col1;
  }

  return Move;

})();

UI = (function() {
  function UI(elementId, game1) {
    this.elementId = elementId;
    this.game = game1;
    this.render = bind(this.render, this);
    this.generateWinView = bind(this.generateWinView, this);
    this.generateMoveView = bind(this.generateMoveView, this);
    this.generateBoardView = bind(this.generateBoardView, this);
  }

  UI.prototype.generateBoardView = function() {
    var board, j, ref, results1, sz, tbl;
    board = this.game.getBoard();
    sz = board.size;
    tbl = $('<table border="1"></table>');
    (function() {
      results1 = [];
      for (var j = 0, ref = sz.height - 1; 0 <= ref ? j <= ref : j >= ref; 0 <= ref ? j++ : j--){ results1.push(j); }
      return results1;
    }).apply(this).forEach(function(row) {
      var j, ref, results1, rowElement;
      rowElement = $('<tr></tr>');
      (function() {
        results1 = [];
        for (var j = 0, ref = sz.width - 1; 0 <= ref ? j <= ref : j >= ref; 0 <= ref ? j++ : j--){ results1.push(j); }
        return results1;
      }).apply(this).forEach(function(col) {
        var marker;
        marker = board.markerAt({
          row: row,
          col: col
        });
        return rowElement.append($("<td>" + marker + "</td>"));
      });
      return tbl.append(rowElement);
    });
    return tbl;
  };

  UI.prototype.generateMoveView = function() {
    var input, lbl, submit;
    lbl = $('<label>Column?</label>');
    input = $('<input type="number" />').appendTo(lbl);
    submit = $('<button />').html('Submit').click((function(_this) {
      return function(e) {
        e.preventDefault();
        if (_this.game.move(new Move(input.val() - 1))) {
          return _this.render();
        }
      };
    })(this));
    return $('<div class="move"></div>').append(lbl).append(submit);
  };

  UI.prototype.generateWinView = function() {
    return $('<div>Won!</div>');
  };

  UI.prototype.render = function() {
    var board, main;
    board = this.generateBoardView();
    main = $(this.elementId).empty().append(board);
    main.append(this.game.isWin() ? this.generateWinView() : this.generateMoveView);
    return board.find('input').focus();
  };

  return UI;

})();

UIThree = (function() {
  var PIdiv2, PIdiv4, PIdiv8, camera, cylinderSegments, depth, direction, geometry, gridMesh, halfDepth, halfH, halfW, height, material, materials, newMat, offsetH, offsetW, pieceDepth, pieceHeight, pieceInsetDepth, pieceInsetRadius, pieceWidth, pieces, renderer, scene, sound, width, win, winDisplayed;

  camera = scene = renderer = geometry = material = gridMesh = null;

  width = height = 0;

  depth = 100;

  halfDepth = halfW = halfH = offsetW = offsetH = 0;

  pieceWidth = pieceHeight = pieceDepth = 100;

  pieceInsetDepth = pieceInsetRadius = 0;

  pieces = [];

  cylinderSegments = 24;

  PIdiv2 = Math.PI / 2;

  PIdiv4 = Math.PI / 4;

  PIdiv8 = Math.PI / 8;

  sound = function(basename) {
    var a;
    a = new Audio("audio/" + basename + ".wav");
    return a.play();
  };

  function UIThree(elementId, game1) {
    this.elementId = elementId;
    this.game = game1;
    this.getMaterialByMarker = bind(this.getMaterialByMarker, this);
    this.getMarkers = bind(this.getMarkers, this);
    this.renderIndex = bind(this.renderIndex, this);
    this.render = bind(this.render, this);
    this.animate = bind(this.animate, this);
    this.init = bind(this.init, this);
    this.setupGroup = bind(this.setupGroup, this);
    this.createGridLeg = bind(this.createGridLeg, this);
    this.createGridLegs = bind(this.createGridLegs, this);
    this.setupGrid = bind(this.setupGrid, this);
    this.setupPiece = bind(this.setupPiece, this);
    this.createMeshBlock = bind(this.createMeshBlock, this);
    this.createPiece = bind(this.createPiece, this);
    this.setupPieces = bind(this.setupPieces, this);
    this.setupControl = bind(this.setupControl, this);
    this.move = bind(this.move, this);
    this.start = bind(this.start, this);
    this.boardSize = this.game.getBoardSize();
    width = pieceWidth * this.boardSize.width;
    height = pieceHeight * this.boardSize.height;
    halfW = width / 2;
    halfH = height / 2;
    halfDepth = depth / 2;
    offsetW = halfW - halfDepth;
    offsetH = halfH - halfDepth;
    pieceDepth = depth / 1.5;
    pieceInsetDepth = depth / 4;
    pieceInsetRadius = halfDepth / 1.5;
  }

  UIThree.prototype.start = function() {
    this.init();
    this.animate();
    return this.setupControl();
  };

  UIThree.prototype.move = function(col) {
    this.game.move(new Move(col));
    return sound('drop');
  };

  UIThree.prototype.setupControl = function() {
    var ascii1, instructions;
    instructions = $('<p>Press the numbers 1 through 7 to play a piece in that column</p>');
    $('body').prepend(instructions);
    ascii1 = '1'.charCodeAt();
    return $(document).keypress((function(_this) {
      return function(ev) {
        console.log(ev.which);
        if (ev.which >= ascii1 && ev.which <= '9'.charCodeAt()) {
          return _this.move(ev.which - ascii1);
        }
      };
    })(this));
  };

  UIThree.prototype.setupPieces = function() {
    return this.game.positionIndices().forEach(this.setupPiece);
  };

  newMat = function(color, wireframe) {
    if (wireframe == null) {
      wireframe = false;
    }
    return new THREE.MeshLambertMaterial({
      color: color,
      wireframe: wireframe
    });
  };

  materials = {
    empty: newMat(0x999999, true),
    a: newMat(0xff0000),
    b: newMat(0x000000),
    grid: newMat(0xffff00),
    text: newMat(0xFF0000),
    leg: newMat(0x0000ff),
    wire: new THREE.MeshBasicMaterial({
      color: 0xaaaaaa,
      wireframe: true
    })
  };

  UIThree.prototype.createPiece = function(index) {
    var mesh, pieceGeom, pieceGeomBox, pieceInsetGeom, subtractInset;
    pieceGeom = new THREE.CylinderGeometry(halfDepth, halfDepth, pieceDepth, cylinderSegments);
    mesh = this.createMeshBlock(index, pieceGeom);
    pieceGeom.computeBoundingBox();
    pieceGeomBox = pieceGeom.boundingBox;
    pieceInsetGeom = new THREE.CylinderGeometry(pieceInsetRadius, pieceInsetRadius, pieceDepth - pieceInsetDepth, cylinderSegments);
    subtractInset = (function(_this) {
      return function(z) {
        var pieceInsetMesh;
        pieceInsetMesh = _this.createMeshBlock(index, pieceInsetGeom);
        pieceInsetMesh.position.z = z;
        mesh.subtract(pieceInsetMesh);
        return pieceInsetMesh;
      };
    })(this);
    [pieceGeomBox.max.z, pieceGeomBox.min.z].forEach(subtractInset);
    return mesh;
  };

  UIThree.prototype.createMeshBlock = function(index, geom, material) {
    var mesh;
    if (material == null) {
      material = materials.empty;
    }
    mesh = new THREE.Mesh(geom, material);
    mesh.position.x = index.col * pieceWidth - offsetW;
    mesh.position.y = index.row * pieceHeight - offsetH;
    mesh.rotation.x = PIdiv2;
    return mesh;
  };

  UIThree.prototype.setupPiece = function(index) {
    var pieceMesh;
    pieceMesh = this.createPiece(index);
    if (!pieces[index.row]) {
      pieces[index.row] = [];
    }
    pieces[index.row][index.col] = pieceMesh;
    return this.grp.add(pieceMesh);
  };

  UIThree.prototype.setupGrid = function() {
    var blocks, gridAdd, gridGeom, gridGroup, gridWidth, legs, pieceSlotGeom;
    gridGroup = new THREE.Object3D;
    gridAdd = function(obj) {
      return gridGroup.add(obj);
    };
    gridGeom = new THREE.CubeGeometry(depth, depth, depth);
    pieceSlotGeom = new THREE.CubeGeometry(halfDepth, pieceDepth, depth);
    blocks = this.game.positionIndices().map((function(_this) {
      return function(index) {
        var blk, hole, holeGeom, slot;
        blk = _this.createMeshBlock(index, gridGeom, materials.grid);
        holeGeom = new THREE.CylinderGeometry(halfDepth, halfDepth, depth, cylinderSegments);
        hole = _this.createMeshBlock(index, holeGeom, materials.empty);
        blk.subtract(hole);
        if (index.row !== _this.game.getBoardSize().height - 1) {
          slot = _this.createMeshBlock(index, pieceSlotGeom, materials.wire);
          slot.rotation.x = PIdiv2;
          slot.rotation.z = PIdiv2;
          blk.subtract(slot);
        }
        return blk;
      };
    })(this));
    blocks.forEach(gridAdd);
    gridWidth = depth * this.boardSize.width;
    legs = this.createGridLegs(gridWidth);
    legs.forEach(function(leg) {
      return gridGroup.add(leg);
    });
    return gridGroup;
  };

  UIThree.prototype.createGridLegs = function(gridWidth) {
    var left, right;
    right = this.createGridLeg(gridWidth, 1);
    left = this.createGridLeg(gridWidth, -1);
    return [right, left];
  };

  UIThree.prototype.createGridLeg = function(gridWidth, sign) {
    var legGeom, legHeight, vert, vertMesh;
    legGeom = new THREE.Object3D;
    legHeight = height * 1.5;
    vert = new THREE.CubeGeometry(halfDepth, legHeight, depth * 1.5);
    vertMesh = new THREE.Mesh(vert, materials.leg);
    console.log("gridWidth = " + gridWidth);
    vertMesh.position.x = sign * (gridWidth / 2 + halfDepth / 2);
    vertMesh.position.y += legHeight / 8;
    legGeom.add(vertMesh);
    return legGeom;
  };

  UIThree.prototype.setupGroup = function() {
    this.grp = new THREE.Object3D;
    this.grp.rotation.x = Math.PI;
    return this.grp;
  };

  UIThree.prototype.init = function() {
    var directionalLight, h, textGeom, w;
    this.setupGroup();
    scene = new THREE.Scene;
    w = window.innerWidth;
    h = window.innerHeight;
    camera = new THREE.PerspectiveCamera(75, w / h, 1, 10000);
    camera.position.z = 1000;
    scene.add(camera);
    this.grp.add(this.setupGrid());
    scene.add(this.grp);
    this.setupPieces();
    textGeom = new THREE.TextGeometry("Win!", {
      font: "helvetiker",
      size: 100
    });
    textGeom.computeBoundingBox();
    console.log("Textgeom bounding box: " + textGeom.boundingBox.min.x + "  " + textGeom.boundingBox.max.x);
    this.textMesh = new THREE.Mesh(textGeom, materials.text);
    this.textMesh.position.z = 700;
    this.textMesh.position.x -= textGeom.boundingBox.max.x / 2;
    this.textMesh.position.y -= textGeom.boundingBox.max.y / 2;
    this.textMesh.visible = false;
    scene.add(this.textMesh);
    directionalLight = new THREE.DirectionalLight();
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);
    directionalLight = new THREE.DirectionalLight();
    directionalLight.position.set(-1, -1, -1).normalize();
    scene.add(directionalLight);
    renderer = new THREE.WebGLRenderer;
    renderer.setSize(w, h);
    return $(this.elementId).append(renderer.domElement);
  };

  UIThree.prototype.animate = function() {
    requestAnimationFrame(this.animate);
    return this.render();
  };

  winDisplayed = false;

  win = function() {
    if (!winDisplayed) {
      sound('cheer');
      return winDisplayed = true;
    }
  };

  direction = 1;

  UIThree.prototype.render = function() {
    this.game.positionIndices().forEach(this.renderIndex);
    if (this.game.isWin()) {
      win();
      this.textMesh.visible = true;
      this.textMesh.rotation.x += 0.01;
    } else {
      this.grp.rotation.y += direction * 0.005;
      if (direction > 0 && this.grp.rotation.y > PIdiv8) {
        direction = -1;
      } else if (direction < 0 && this.grp.rotation.y < -PIdiv8) {
        direction = 1;
      }
    }
    return renderer.render(scene, camera);
  };

  UIThree.prototype.renderIndex = function(index) {
    var marker, markers, piece;
    markers = this.getMarkers();
    piece = pieces[index.row][index.col];
    marker = this.game.markerAt(index);
    piece.material = this.getMaterialByMarker(marker);
    return piece.visible = marker !== markers.empty;
  };

  UIThree.prototype.getMarkers = function() {
    return this.game.getMarkers();
  };

  UIThree.prototype.getMaterialByMarker = function(marker) {
    var markers;
    markers = this.getMarkers();
    switch (marker) {
      case markers.empty:
        return materials.empty;
      case markers.a:
        return materials.a;
      case markers.b:
        return materials.b;
      default:
        throw 'There is no material defined for that marker';
    }
  };

  return UIThree;

})();

$(function() {
  var game, ui;
  game = new Game;
  ui = new UIThree('#game', game);
  return ui.start();
});

//# sourceMappingURL=data:application/json;base64,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QUFPLElBQUk7RUFDWCxFQUFBLEdBQVMsSUFBQSxPQUFBLENBQVEsT0FBUixFQUFpQixJQUFqQjtTQUNULEVBQUUsQ0FBQyxLQUFILENBQUE7QUFIQSxDQUFGIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIEJvYXJkXG4gIGNvbnN0cnVjdG9yOiAoQHNpemUgPSB7d2lkdGg6IDcsIGhlaWdodDogNn0pIC0+XG4gICAgQG1hcmtlcnMgPSBcbiAgICAgIGVtcHR5OiAnJ1xuICAgICAgYTogJ2EnXG4gICAgICBiOiAnYidcbiAgICBAcG9zc2libGVNYXJrZXJzID0gdmFsdWUgZm9yIF8sIHZhbHVlIG9mIEBtYXJrZXJzXG5cbiAgICBAbGVuZ3RoID0gQHNpemUud2lkdGggKiBAc2l6ZS5oZWlnaHRcblxuICAgICMgd2UgdGhyb3cgYXdheSB4IGFuZCB5IGhlcmUuIHdlIGRvbid0IHJlYWxseSBuZWVkIHRoZW1cbiAgICBAYm9hcmQgPSBbMS4uQHNpemUuaGVpZ2h0XS5tYXAgPT5cbiAgICAgIEBtYXJrZXJzLmVtcHR5IGZvciBfIGluIFsxLi5Ac2l6ZS53aWR0aF1cblxuICBpc0luQm91bmRzOiAoaW5kZXgpID0+XG4gICAgcm93ID0gaW5kZXgucm93XG4gICAgY29sID0gaW5kZXguY29sXG4gICAgbm90IChjb2wgPiBAc2l6ZS53aWR0aC0xIG9yIGNvbCA8IDAgb3Igcm93ID4gQHNpemUuaGVpZ2h0LTEgb3Igcm93IDwgMClcblxuICAjIFVwZGF0ZXMgdGhlIGJvYXJkIHBvc2l0aW9uXG4gIG1vdmU6IChtYXJrZXIsIHBvc2l0aW9uKSA9PlxuICAgIHRocm93ICdJbnZhbGlkIG1hcmtlcicgaWYgbm90IG1hcmtlciBpbiBAcG9zc2libGVNYXJrZXJzXG5cbiAgICByb3cgPSBwb3NpdGlvbi5yb3dcbiAgICBjb2wgPSBwb3NpdGlvbi5jb2xcbiAgICB0aHJvdyAnT3V0IG9mIGJvdW5kcycgaWYgbm90IEBpc0luQm91bmRzIHBvc2l0aW9uXG5cbiAgICBAYm9hcmRbcm93XVtjb2xdID0gbWFya2VyXG5cbiAgbWFya2VyQXQ6IChpbmRleCkgPT5cbiAgICBAYm9hcmRbaW5kZXgucm93XVtpbmRleC5jb2xdXG5cbiAgcG9zSXM6IChpbmRleCwgbWFya2VyKSA9PlxuICAgIG0gPSBAbWFya2VyQXQgaW5kZXhcbiAgICBtYXJrZXIgaXMgbVxuXG4gICMgUmV0dXJucyBhbiBhcnJheSBvZiBpbmRpY2VzIHdoaWNoIGNhbiBiZSB1c2VkIHRvIGl0ZXJhdGUgb3ZlciB0aGVcbiAgIyBwb3NpdGlvbnMuIFxuICAjIEByZXR1cm5zIHtBcnJheX0gVGhlIHJldHVybiBsb29rcyBsaWtlOiBgWyB7cm93OiAwLCBjb2w6IDB9LCB7cm93OiAwLFxuICAjICAgICAgICAgICAgICAgICAgY29sOiAxfSwgLi4uIF1gLlxuICBwb3NpdGlvbkluZGljZXM6ID0+XG4gICAgWzAuLkBzaXplLmhlaWdodC0xXS5yZWR1Y2UgKChtZW0sIHJvdykgPT5cbiAgICAgIHJvdyA9IFswLi5Ac2l6ZS53aWR0aC0xXS5tYXAgKGNvbCkgPT5cbiAgICAgICAgcm93OiByb3dcbiAgICAgICAgY29sOiBjb2xcbiAgICAgIG1lbS5jb25jYXQgcm93XG4gICAgICApLCBbXVxuXG4gICMgaGVscGVyIG1ldGhvZHMgZm9yIGlzRW1wdHkgYW5kIG1vdmVzUmVtYWluaW5nXG4gIHBvc2l0aW9uc0VtcHR5OiAoZnVuKSA9PlxuICAgIEBwb3NpdGlvbkluZGljZXMoKS5tYXAgKGkpID0+XG4gICAgICBAcG9zSXMgaSwgQG1hcmtlcnMuZW1wdHlcblxuICBnZXRFbXB0eVBvc2l0aW9uczogPT5cbiAgICBAcG9zaXRpb25JbmRpY2VzKCkuZmlsdGVyIChpKSA9PlxuICAgICAgQHBvc0lzIGksIEBtYXJrZXJzLmVtcHR5XG5cbiAgaGFzTW92ZXNSZW1haW5pbmc6ID0+XG4gICAgXy5hbnkgQHBvc2l0aW9uc0VtcHR5KCksIF8uaWRlbnRpdHlcblxuICBpc0VtcHR5OiA9PlxuICAgIF8uYWxsIEBwb3NpdGlvbnNFbXB0eSgpLCBfLmlkZW50aXR5XG5cblxuY2xhc3MgR2FtZVxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAYm9hcmQgPSBuZXcgQm9hcmRcbiAgICBAZGlyZWN0aW9ucyA9IFstMS4uMV0ucmVkdWNlICgobWVtLCByb3cpID0+XG4gICAgICByb3cgPSBbLTEuLjFdLm1hcCAoY29sKSA9PlxuICAgICAgICByb3c6IHJvd1xuICAgICAgICBjb2w6IGNvbFxuICAgICAgbWVtLmNvbmNhdCByb3dcbiAgICAgICksIFtdXG4gICAgIyBsb29rcyBsaWtlLCB1c2VkIGFzIGRlbHRhc1xuICAgICMgICAgIFtcbiAgICAjICAgICAgIHtyb3c6IC0xLCBjb2w6IC0xfSxcbiAgICAjICAgICAgIHtyb3c6IC0xLCBjb2w6IDB9LFxuICAgICMgICAgICAge3JvdzogLTEsIGNvbDogMX0sXG4gICAgIyAgICAgICAuLi5cbiAgICAjICAgICBdXG4gICAgQGRpcmVjdGlvbnMgPSBfLnJlamVjdCBAZGlyZWN0aW9ucywgKGRpcikgLT5cbiAgICAgIGRpci5yb3cgaXMgMCBhbmQgZGlyLmNvbCBpcyAwXG4gICAgQGN1cnJlbnRNYXJrZXIgPSBAYm9hcmQubWFya2Vycy5hXG5cbiAgZ2V0Qm9hcmQ6ID0+XG4gICAgQGJvYXJkXG5cbiAgIyBSZWN1cnNpdmUgY2hlY2sgZm9yIG1hcmtlcnMgaW4gYSByb3dcbiAgIyBAcGFyYW0ge09iamVjdH0gaW5kZXhcbiAgIyBAcGFyYW0ge1N0cmluZ30gbWFya2VyXG4gICMgQHBhcmFtIHtPYmplY3R9IGRlbHRhXG4gICMgQHBhcmFtIHtOdW1iZXJ9IHN0ZXBzXG4gICMgQHJldHVybnMge0Jvb2xlYW59IFJldHVybnMgdHJ1ZSBpZiB0aGUgbWFya2VyIGF0IHRoZSBwYXNzZWQgcG9zaXRpb25cbiAgIyAgICAgICAgICAgICAgICAgICAgbWF0Y2hlcyB0aGUgcGFzc2VkIG1hcmtlciBhbmQgbWFya2VycyBpbiB0aGUgc2FtZVxuICAjICAgICAgICAgICAgICAgICAgICBkaXJlY3Rpb24gZm9yIHRoZSBnaXZlbiBudW1iZXIgb2Ygc3RlcHMgX2Fsc29fXG4gICMgICAgICAgICAgICAgICAgICAgIG1hdGNoIHRoZSBwYXNzZWQgbWFya2VyLlxuICBjaGVja1Bvc2l0aW9uOiAoaW5kZXgsIG1hcmtlciwgZGVsdGEsIHN0ZXBzKSA9PlxuICAgIGJvYXJkID0gQGdldEJvYXJkKClcbiAgICBpZiBzdGVwcyBpcyAwXG4gICAgICB0cnVlXG4gICAgZWxzZSBpZiBib2FyZC5pc0luQm91bmRzKGluZGV4KSBhbmQgYm9hcmQucG9zSXMoaW5kZXgsIG1hcmtlcikgXG4gICAgICBuZXdJbmRleCA9IFxuICAgICAgICByb3c6IGluZGV4LnJvdyArIGRlbHRhLnJvd1xuICAgICAgICBjb2w6IGluZGV4LmNvbCArIGRlbHRhLmNvbFxuICAgICAgQGNoZWNrUG9zaXRpb24gbmV3SW5kZXgsIG1hcmtlciwgZGVsdGEsIHN0ZXBzLTFcbiAgICBlbHNlXG4gICAgICAjIE5vIG1hdGNoXG4gICAgICBmYWxzZVxuXG4gICMgRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZXJlIGlzIGFueSB3aW5uaW5nIGNvbWJpbmF0aW9uIG9mIG1hcmtlcnNcbiAgaXNXaW46ID0+XG4gICAgIyB3ZSdsbCBib2lsIHRoaXMgaW50byBhIHJlY3Vyc2l2ZSBjaGVjayB0byBtYWtlIHRoaW5ncyBzaW1wbGVyXG4gICAgYm9hcmQgPSBAZ2V0Qm9hcmQoKVxuICAgIGluZGljZXMgPSBib2FyZC5wb3NpdGlvbkluZGljZXMoKVxuICAgIHJlc3VsdHMgPSBpbmRpY2VzLm1hcCAoaSkgPT5cbiAgICAgIG1hcmtlciA9IGJvYXJkLm1hcmtlckF0IGlcbiAgICAgIGlmIG1hcmtlciBpcyBib2FyZC5tYXJrZXJzLmVtcHR5XG4gICAgICAgIGZhbHNlXG4gICAgICBlbHNlXG4gICAgICAgIGNoZWNrZWQgPSBAZGlyZWN0aW9ucy5tYXAgKGRlbHRhKSA9PlxuICAgICAgICAgIHJlc3VsdCA9IEBjaGVja1Bvc2l0aW9uIGksIG1hcmtlciwgZGVsdGEsIDRcbiAgICAgICAgICByZXN1bHRcbiAgICAgICAgIyBub3cgY2hlY2sgaWYgYW55IG9mIHRoZSByZXN1bHRzIHdlcmUgcG9zaXRpdmVcbiAgICAgICAgXy5hbnkgY2hlY2tlZFxuICAgIF8uYW55IHJlc3VsdHNcblxuICAjIEB0b2RvIE5vdCB3ZWxsIGltcGxlbWVudGVkXG4gIGlzV2luUG9zc2libGU6ID0+XG4gICAgbm90IEBib2FyZC5oYXNNb3Zlc1JlbWFpbmluZygpXG5cbiAgZ2V0Q3VycmVudE1hcmtlcjogPT5cbiAgICBAY3VycmVudE1hcmtlclxuXG4gIG1hcmtlckF0OiAoaW5kZXgpID0+XG4gICAgQGJvYXJkLm1hcmtlckF0IGluZGV4XG5cbiAgcG9zaXRpb25JbmRpY2VzOiA9PlxuICAgIEBib2FyZC5wb3NpdGlvbkluZGljZXMoKVxuXG4gICMgUmV0dXJucyB0aGUgZmlyc3QgZW1wdHkgcm93IGluIHRoZSBwYXNzZWQgY29sdW1uLiBOb3RlIHRoYXQgdGhlXG4gICMgYm90dG9tIHJvdyBoYXMgdGhlIGhpZ2hlc3Qgcm93IGluZGV4LlxuICBnZXRGaXJzdEVtcHR5Um93SW5Db2w6IChjb2x1bW4pID0+XG4gICAgdGhyb3cgJ091dCBvZiBib3VuZHMnIGlmIG5vdCBAYm9hcmQuaXNJbkJvdW5kcyB7cm93OiAwLCBjb2w6IGNvbHVtbn1cblxuICAgICMgVGhpcyBmdW5jdGlvbiBpbXBsZW1lbnRzIGEgcmVjdXJzaXZlIGNoZWNrXG4gICAgaGVscGVyID0gKHJvdykgPT5cbiAgICAgIGlmIHJvdyA8IDBcbiAgICAgICAgLTFcbiAgICAgIGVsc2VcbiAgICAgICAgbWFya2VyID0gQG1hcmtlckF0IFxuICAgICAgICAgIHJvdzogcm93XG4gICAgICAgICAgY29sOiBjb2x1bW5cbiAgICAgICAgaWYgbWFya2VyIGlzIEBib2FyZC5tYXJrZXJzLmVtcHR5XG4gICAgICAgICAgcm93XG4gICAgICAgIGVsc2VcbiAgICAgICAgICBoZWxwZXIgKHJvdy0xKVxuXG4gICAgaGVscGVyIChAYm9hcmQuc2l6ZS5oZWlnaHQtMSlcblxuICB0b2dnbGVNYXJrZXI6ID0+XG4gICAgQGN1cnJlbnRNYXJrZXIgPSBpZiBAY3VycmVudE1hcmtlciBpcyBAYm9hcmQubWFya2Vycy5hIHRoZW4gQGJvYXJkLm1hcmtlcnMuYiBlbHNlIEBib2FyZC5tYXJrZXJzLmFcblxuICB1cGRhdGVCb2FyZDogKGluZGV4KSA9PlxuICAgIEBib2FyZC5tb3ZlIEBjdXJyZW50TWFya2VyLCBpbmRleFxuICAgIEB0b2dnbGVNYXJrZXIoKVxuXG4gICMgQXBwbGllcyB0aGUgcGFzc2VkIG1vdmUgdG8gdGhlIGdhbWUuXG4gICMgQHBhcmFtIHtPYmplY3R9IG1vdmUgaXMgYSBNb3ZlIG9iamVjdFxuICAjIEByZXR1cm5zIHtNaXhlZH0gUmV0dXJucyBmYWxzZSBpZiB0aGUgbW92ZSBjb3VsZCBub3QgYmUgbWFkZSBiZWNhdXNlXG4gICMgICAgICAgICAgICAgICAgICBzb21lb25lIHdvbi4gT3RoZXJ3aXNlLCByZXR1cm5zIHRoZSBsYXN0IG1hcmtlclxuICAjICAgICAgICAgICAgICAgICAgdXNlZC5cbiAgbW92ZTogKG1vdmUpID0+XG4gICAgdGhyb3cgJ0Nhbm5vdCBtYWtlIGFub3RoZXIgbW92ZSBiZWNhdXNlIHRoZSBnYW1lIGlzIGFscmVhZHkgd29uLicgaWYgQGlzV2luKClcblxuICAgIGNvbCA9IG1vdmUuY29sXG4gICAgcm93ID0gQGdldEZpcnN0RW1wdHlSb3dJbkNvbCBjb2xcbiAgICBpZiByb3cgPj0gMFxuICAgICAgQHVwZGF0ZUJvYXJkIFxuICAgICAgICByb3c6IHJvd1xuICAgICAgICBjb2w6IGNvbFxuICAgIGVsc2VcbiAgICAgIGZhbHNlXG5cbiAgZ2V0Qm9hcmRTaXplOiA9PlxuICAgIEBib2FyZC5zaXplXG5cbiAgZ2V0TWFya2VyczogPT5cbiAgICBAYm9hcmQubWFya2Vyc1xuXG5jbGFzcyBNb3ZlXG4gIGNvbnN0cnVjdG9yOiAoQGNvbCkgLT5cblxuXG5jbGFzcyBVSVxuICBjb25zdHJ1Y3RvcjogKEBlbGVtZW50SWQsIEBnYW1lKSAtPlxuXG4gIGdlbmVyYXRlQm9hcmRWaWV3OiA9PlxuICAgIGJvYXJkID0gQGdhbWUuZ2V0Qm9hcmQoKVxuICAgIHN6ID0gYm9hcmQuc2l6ZVxuXG4gICAgdGJsID0gJCgnPHRhYmxlIGJvcmRlcj1cIjFcIj48L3RhYmxlPicpXG4gICAgWzAuLnN6LmhlaWdodC0xXS5mb3JFYWNoIChyb3cpIC0+XG5cbiAgICAgIHJvd0VsZW1lbnQgPSAkICc8dHI+PC90cj4nXG4gICAgICBbMC4uc3oud2lkdGgtMV0uZm9yRWFjaCAoY29sKSAtPlxuICAgICAgICBtYXJrZXIgPSBib2FyZC5tYXJrZXJBdCBcbiAgICAgICAgICByb3c6IHJvd1xuICAgICAgICAgIGNvbDogY29sXG4gICAgICAgIHJvd0VsZW1lbnQuYXBwZW5kICQoXCI8dGQ+I3ttYXJrZXJ9PC90ZD5cIilcblxuICAgICAgdGJsLmFwcGVuZCByb3dFbGVtZW50IFxuXG4gICAgdGJsXG5cbiAgZ2VuZXJhdGVNb3ZlVmlldzogPT5cbiAgICBsYmwgPSAkKCc8bGFiZWw+Q29sdW1uPzwvbGFiZWw+JylcbiAgICBpbnB1dCA9ICQoJzxpbnB1dCB0eXBlPVwibnVtYmVyXCIgLz4nKS5hcHBlbmRUbyhsYmwpXG4gICAgc3VibWl0ID0gJCgnPGJ1dHRvbiAvPicpLmh0bWwoJ1N1Ym1pdCcpLmNsaWNrIChlKSA9PlxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICBAcmVuZGVyKCkgaWYgQGdhbWUubW92ZShuZXcgTW92ZSBpbnB1dC52YWwoKS0xKVxuXG4gICAgJCgnPGRpdiBjbGFzcz1cIm1vdmVcIj48L2Rpdj4nKS5cbiAgICAgIGFwcGVuZChsYmwpLlxuICAgICAgYXBwZW5kKHN1Ym1pdClcblxuICBnZW5lcmF0ZVdpblZpZXc6ID0+XG4gICAgJCgnPGRpdj5Xb24hPC9kaXY+JylcblxuICByZW5kZXI6ID0+XG4gICAgYm9hcmQgPSBAZ2VuZXJhdGVCb2FyZFZpZXcoKVxuICAgIG1haW4gPSAkKEBlbGVtZW50SWQpLlxuICAgICAgZW1wdHkoKS5cbiAgICAgIGFwcGVuZChib2FyZClcblxuICAgIG1haW4uYXBwZW5kIGlmIEBnYW1lLmlzV2luKCkgdGhlbiBAZ2VuZXJhdGVXaW5WaWV3KCkgZWxzZSBAZ2VuZXJhdGVNb3ZlVmlld1xuXG4gICAgYm9hcmQuZmluZCgnaW5wdXQnKS5mb2N1cygpXG5cbmNsYXNzIFVJVGhyZWVcbiAgY2FtZXJhID0gc2NlbmUgPSByZW5kZXJlciA9IGdlb21ldHJ5ID0gbWF0ZXJpYWwgPSBncmlkTWVzaCA9IG51bGxcbiAgd2lkdGggPSBoZWlnaHQgPSAwXG4gIGRlcHRoID0gMTAwXG4gIGhhbGZEZXB0aCA9IGhhbGZXID0gaGFsZkggPSBvZmZzZXRXID0gb2Zmc2V0SCA9IDBcbiAgcGllY2VXaWR0aCA9IHBpZWNlSGVpZ2h0ID0gcGllY2VEZXB0aCA9IDEwMFxuICBwaWVjZUluc2V0RGVwdGggPSBwaWVjZUluc2V0UmFkaXVzID0gMFxuICBwaWVjZXMgPSBbXVxuICBjeWxpbmRlclNlZ21lbnRzID0gMjRcbiAgUElkaXYyID0gTWF0aC5QSSAvIDJcbiAgUElkaXY0ID0gTWF0aC5QSSAvIDRcbiAgUElkaXY4ID0gTWF0aC5QSSAvIDhcblxuICBzb3VuZCA9IChiYXNlbmFtZSkgLT5cbiAgICBhID0gbmV3IEF1ZGlvKFwiYXVkaW8vI3tiYXNlbmFtZX0ud2F2XCIpXG4gICAgYS5wbGF5KClcblxuICBjb25zdHJ1Y3RvcjogKEBlbGVtZW50SWQsIEBnYW1lKSAtPlxuICAgIEBib2FyZFNpemUgPSBAZ2FtZS5nZXRCb2FyZFNpemUoKVxuXG4gICAgd2lkdGggPSBwaWVjZVdpZHRoICogQGJvYXJkU2l6ZS53aWR0aFxuICAgIGhlaWdodCA9IHBpZWNlSGVpZ2h0ICogQGJvYXJkU2l6ZS5oZWlnaHRcbiAgICBoYWxmVyA9IHdpZHRoLzJcbiAgICBoYWxmSCA9IGhlaWdodC8yXG4gICAgaGFsZkRlcHRoID0gZGVwdGgvMlxuICAgIG9mZnNldFcgPSBoYWxmVyAtIGhhbGZEZXB0aFxuICAgIG9mZnNldEggPSBoYWxmSCAtIGhhbGZEZXB0aFxuXG4gICAgcGllY2VEZXB0aCA9IGRlcHRoLzEuNVxuICAgIHBpZWNlSW5zZXREZXB0aCA9IGRlcHRoLzRcbiAgICBwaWVjZUluc2V0UmFkaXVzID0gaGFsZkRlcHRoLzEuNVxuXG5cbiAgc3RhcnQ6ID0+XG4gICAgQGluaXQoKVxuICAgIEBhbmltYXRlKClcbiAgICBAc2V0dXBDb250cm9sKClcblxuICBtb3ZlOiAoY29sKSA9PlxuICAgIEBnYW1lLm1vdmUgbmV3IE1vdmUoY29sKVxuICAgIHNvdW5kICdkcm9wJ1xuXG4gIHNldHVwQ29udHJvbDogPT5cbiAgICBpbnN0cnVjdGlvbnMgPSAkKCc8cD5QcmVzcyB0aGUgbnVtYmVycyAxIHRocm91Z2ggNyB0byBwbGF5IGEgcGllY2UgaW4gdGhhdCBjb2x1bW48L3A+JylcbiAgICAkKCdib2R5JykucHJlcGVuZChpbnN0cnVjdGlvbnMpXG4gICAgYXNjaWkxID0gJzEnLmNoYXJDb2RlQXQoKVxuICAgICQoZG9jdW1lbnQpLmtleXByZXNzIChldikgPT5cbiAgICAgIGNvbnNvbGUubG9nIGV2LndoaWNoXG4gICAgICBAbW92ZShldi53aGljaC1hc2NpaTEpIGlmIGV2LndoaWNoID49IGFzY2lpMSBhbmQgZXYud2hpY2ggPD0gJzknLmNoYXJDb2RlQXQoKVxuXG4gIHNldHVwUGllY2VzOiA9PlxuICAgIEBnYW1lLnBvc2l0aW9uSW5kaWNlcygpLmZvckVhY2ggQHNldHVwUGllY2VcblxuICBuZXdNYXQgPSAoY29sb3IsIHdpcmVmcmFtZSA9IGZhbHNlKSAtPlxuICAgIG5ldyBUSFJFRS5NZXNoTGFtYmVydE1hdGVyaWFsXG4gICAgICBjb2xvcjogY29sb3JcbiAgICAgIHdpcmVmcmFtZTogd2lyZWZyYW1lXG5cbiAgbWF0ZXJpYWxzID1cbiAgICBlbXB0eTogbmV3TWF0KDB4OTk5OTk5LCB0cnVlKVxuICAgIGE6IG5ld01hdCAweGZmMDAwMFxuICAgIGI6IG5ld01hdCAweDAwMDAwMFxuICAgIGdyaWQ6IG5ld01hdCAweGZmZmYwMFxuICAgIHRleHQ6IG5ld01hdCAweEZGMDAwMFxuICAgIGxlZzogbmV3TWF0IDB4MDAwMGZmXG4gICAgd2lyZTogbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsXG4gICAgICBjb2xvcjogMHhhYWFhYWFcbiAgICAgIHdpcmVmcmFtZTogdHJ1ZVxuXG4gIGNyZWF0ZVBpZWNlOiAoaW5kZXgpID0+XG4gICAgcGllY2VHZW9tID0gbmV3IFRIUkVFLkN5bGluZGVyR2VvbWV0cnkgaGFsZkRlcHRoLCBoYWxmRGVwdGgsIHBpZWNlRGVwdGgsIGN5bGluZGVyU2VnbWVudHNcblxuICAgIG1lc2ggPSBAY3JlYXRlTWVzaEJsb2NrIGluZGV4LCBwaWVjZUdlb21cbiAgICBwaWVjZUdlb20uY29tcHV0ZUJvdW5kaW5nQm94KClcbiAgICBwaWVjZUdlb21Cb3ggPSBwaWVjZUdlb20uYm91bmRpbmdCb3hcblxuICAgICMgY3JlYXRlIGEgc29saWQgd2UgY2FuIHVzZSB0byBjcmVhdGUgYW4gaW5zZXQgb24gdGhlIHBpZWNlLCB0byBnaXZlIGl0IHNvbWUgZGVmaW5pdGlvblxuICAgIHBpZWNlSW5zZXRHZW9tID0gbmV3IFRIUkVFLkN5bGluZGVyR2VvbWV0cnkgcGllY2VJbnNldFJhZGl1cywgcGllY2VJbnNldFJhZGl1cywgcGllY2VEZXB0aCAtIHBpZWNlSW5zZXREZXB0aCwgY3lsaW5kZXJTZWdtZW50c1xuICAgIHN1YnRyYWN0SW5zZXQgPSAoeikgPT5cbiAgICAgIHBpZWNlSW5zZXRNZXNoID0gQGNyZWF0ZU1lc2hCbG9jayBpbmRleCwgcGllY2VJbnNldEdlb21cbiAgICAgIHBpZWNlSW5zZXRNZXNoLnBvc2l0aW9uLnogPSB6XG4gICAgICAjIHN1YnRyYWN0IHRoZSBpbnNldCB0byBnaXZlIGEgYmV2ZWxlZCBsb29rXG4gICAgICBtZXNoLnN1YnRyYWN0IHBpZWNlSW5zZXRNZXNoXG4gICAgICBwaWVjZUluc2V0TWVzaCBcblxuICAgIFtwaWVjZUdlb21Cb3gubWF4LnosIHBpZWNlR2VvbUJveC5taW4uel0uZm9yRWFjaCBzdWJ0cmFjdEluc2V0XG5cbiAgICBtZXNoXG5cblxuICBjcmVhdGVNZXNoQmxvY2s6IChpbmRleCwgZ2VvbSwgbWF0ZXJpYWwgPSBtYXRlcmlhbHMuZW1wdHkpID0+XG4gICAgbWVzaCA9IG5ldyBUSFJFRS5NZXNoIGdlb20sIG1hdGVyaWFsXG4gICAgbWVzaC5wb3NpdGlvbi54ID0gaW5kZXguY29sICogcGllY2VXaWR0aCAtIG9mZnNldFdcbiAgICBtZXNoLnBvc2l0aW9uLnkgPSBpbmRleC5yb3cgKiBwaWVjZUhlaWdodCAtIG9mZnNldEhcbiAgICBtZXNoLnJvdGF0aW9uLnggPSBQSWRpdjJcbiAgICBtZXNoXG5cbiAgc2V0dXBQaWVjZTogKGluZGV4KSA9PlxuICAgIHBpZWNlTWVzaCA9IEBjcmVhdGVQaWVjZSBpbmRleFxuICAgIHBpZWNlc1tpbmRleC5yb3ddID0gW10gdW5sZXNzICEhcGllY2VzW2luZGV4LnJvd11cbiAgICBwaWVjZXNbaW5kZXgucm93XVtpbmRleC5jb2xdID0gcGllY2VNZXNoXG5cbiAgICBAZ3JwLmFkZCBwaWVjZU1lc2hcblxuICBzZXR1cEdyaWQ6ID0+XG4gICAgIyB3aWxsIGNvbnRhaW4gdGhlIGdyaWQgb2JqZWN0c1xuICAgIGdyaWRHcm91cCA9IG5ldyBUSFJFRS5PYmplY3QzRFxuICAgIGdyaWRBZGQgPSAob2JqKSAtPlxuICAgICAgZ3JpZEdyb3VwLmFkZCBvYmpcblxuICAgIGdyaWRHZW9tID0gbmV3IFRIUkVFLkN1YmVHZW9tZXRyeSBkZXB0aCwgZGVwdGgsIGRlcHRoXG4gICAgcGllY2VTbG90R2VvbSA9IG5ldyBUSFJFRS5DdWJlR2VvbWV0cnkgaGFsZkRlcHRoLCBwaWVjZURlcHRoLCBkZXB0aFxuXG4gICAgYmxvY2tzID0gQGdhbWUucG9zaXRpb25JbmRpY2VzKCkubWFwIChpbmRleCkgPT5cbiAgICAgIGJsayA9IEBjcmVhdGVNZXNoQmxvY2sgaW5kZXgsIGdyaWRHZW9tLCBtYXRlcmlhbHMuZ3JpZFxuXG4gICAgICAjIGZpcnN0IHdlJ3JlIGdvaW5nIHRvIHdvcmsgb24gcmVtb3ZpbmcgdGhlIHBpZWNlIGhvbGVcbiAgICAgIGhvbGVHZW9tID0gbmV3IFRIUkVFLkN5bGluZGVyR2VvbWV0cnkgaGFsZkRlcHRoLCBoYWxmRGVwdGgsIGRlcHRoLCBjeWxpbmRlclNlZ21lbnRzXG4gICAgICBob2xlID0gQGNyZWF0ZU1lc2hCbG9jayBpbmRleCwgaG9sZUdlb20sIG1hdGVyaWFscy5lbXB0eVxuICAgICAgYmxrLnN1YnRyYWN0IGhvbGVcblxuICAgICAgIyBub3cgbGV0J3MgcmVtb3ZlIHRoZSBwb3J0aW9uIHRoYXQgYWxsb3dzIHRoZSBwaWVjZSB0byBmYWxsIHRocm91Z2ggdGhlIHRvcFxuICAgICAgaWYgaW5kZXgucm93ICE9IEBnYW1lLmdldEJvYXJkU2l6ZSgpLmhlaWdodC0xXG4gICAgICAgIHNsb3QgPSBAY3JlYXRlTWVzaEJsb2NrIGluZGV4LCBwaWVjZVNsb3RHZW9tLCBtYXRlcmlhbHMud2lyZVxuICAgICAgICBzbG90LnJvdGF0aW9uLnggPSBQSWRpdjJcbiAgICAgICAgc2xvdC5yb3RhdGlvbi56ID0gUElkaXYyXG4gICAgICAgIGJsay5zdWJ0cmFjdCBzbG90XG5cbiAgICAgIGJsa1xuXG4gICAgYmxvY2tzLmZvckVhY2ggZ3JpZEFkZFxuXG4gICAgZ3JpZFdpZHRoID0gZGVwdGggKiBAYm9hcmRTaXplLndpZHRoXG4gICAgbGVncyA9IEBjcmVhdGVHcmlkTGVncyBncmlkV2lkdGhcbiAgICBsZWdzLmZvckVhY2ggKGxlZykgLT5cbiAgICAgIGdyaWRHcm91cC5hZGQgbGVnXG5cbiAgICBncmlkR3JvdXBcblxuICBjcmVhdGVHcmlkTGVnczogKGdyaWRXaWR0aCkgPT5cbiAgICByaWdodCA9IEBjcmVhdGVHcmlkTGVnIGdyaWRXaWR0aCwgMVxuICAgIGxlZnQgPSBAY3JlYXRlR3JpZExlZyBncmlkV2lkdGgsIC0xXG4gICAgW3JpZ2h0LCBsZWZ0XVxuXG4gIGNyZWF0ZUdyaWRMZWc6IChncmlkV2lkdGgsIHNpZ24pID0+XG4gICAgbGVnR2VvbSA9IG5ldyBUSFJFRS5PYmplY3QzRFxuICAgIGxlZ0hlaWdodCA9IGhlaWdodCAqIDEuNVxuICAgIHZlcnQgPSBuZXcgVEhSRUUuQ3ViZUdlb21ldHJ5IGhhbGZEZXB0aCwgbGVnSGVpZ2h0LCBkZXB0aCoxLjVcbiAgICB2ZXJ0TWVzaCA9IG5ldyBUSFJFRS5NZXNoIHZlcnQsIG1hdGVyaWFscy5sZWdcblxuICAgIGNvbnNvbGUubG9nIFwiZ3JpZFdpZHRoID0gI3tncmlkV2lkdGh9XCJcbiAgICB2ZXJ0TWVzaC5wb3NpdGlvbi54ID0gc2lnbiAqIChncmlkV2lkdGgvMiArIGhhbGZEZXB0aC8yKVxuICAgIHZlcnRNZXNoLnBvc2l0aW9uLnkgKz0gbGVnSGVpZ2h0LzhcblxuICAgIGxlZ0dlb20uYWRkIHZlcnRNZXNoXG4gICAgbGVnR2VvbVxuXG5cbiAgc2V0dXBHcm91cDogPT5cbiAgICBAZ3JwID0gbmV3IFRIUkVFLk9iamVjdDNEXG4gICAgQGdycC5yb3RhdGlvbi54ID0gTWF0aC5QSSBcbiAgICBAZ3JwXG5cblxuICBpbml0OiA9PlxuICAgIEBzZXR1cEdyb3VwKClcblxuICAgIHNjZW5lID0gbmV3IFRIUkVFLlNjZW5lXG4gICAgdyA9IHdpbmRvdy5pbm5lcldpZHRoXG4gICAgaCA9IHdpbmRvdy5pbm5lckhlaWdodFxuICAgIGNhbWVyYSA9IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYSA3NSwgdy9oLCAxLCAxMDAwMFxuICAgIGNhbWVyYS5wb3NpdGlvbi56ID0gMTAwMFxuICAgIHNjZW5lLmFkZCBjYW1lcmFcblxuICAgIEBncnAuYWRkIEBzZXR1cEdyaWQoKVxuXG4gICAgc2NlbmUuYWRkIEBncnBcbiAgICBAc2V0dXBQaWVjZXMoKVxuXG5cbiAgICAjIFNldHVwIHRoZSB0ZXh0IGdlb21ldHJ5IHVzZWQgdG8gZGlzcGxheSBhIHdpbiBub3RpY2VcbiAgICB0ZXh0R2VvbSA9IG5ldyBUSFJFRS5UZXh0R2VvbWV0cnkgXCJXaW4hXCIsIFxuICAgICAgZm9udDogXCJoZWx2ZXRpa2VyXCJcbiAgICAgIHNpemU6IDEwMFxuICAgIHRleHRHZW9tLmNvbXB1dGVCb3VuZGluZ0JveCgpXG4gICAgY29uc29sZS5sb2cgXCJUZXh0Z2VvbSBib3VuZGluZyBib3g6ICN7dGV4dEdlb20uYm91bmRpbmdCb3gubWluLnh9ICAje3RleHRHZW9tLmJvdW5kaW5nQm94Lm1heC54fVwiXG5cbiAgICBAdGV4dE1lc2ggPSBuZXcgVEhSRUUuTWVzaCB0ZXh0R2VvbSwgbWF0ZXJpYWxzLnRleHRcbiAgICBAdGV4dE1lc2gucG9zaXRpb24ueiA9IDcwMFxuICAgIEB0ZXh0TWVzaC5wb3NpdGlvbi54IC09IHRleHRHZW9tLmJvdW5kaW5nQm94Lm1heC54LzJcbiAgICBAdGV4dE1lc2gucG9zaXRpb24ueSAtPSB0ZXh0R2VvbS5ib3VuZGluZ0JveC5tYXgueS8yXG4gICAgQHRleHRNZXNoLnZpc2libGUgPSBmYWxzZVxuICAgIHNjZW5lLmFkZCBAdGV4dE1lc2hcblxuICAgICNsaWdodGluZ1xuICAgIGRpcmVjdGlvbmFsTGlnaHQgPSBuZXcgVEhSRUUuRGlyZWN0aW9uYWxMaWdodCgpXG4gICAgZGlyZWN0aW9uYWxMaWdodC5wb3NpdGlvbi5zZXQoIDEsIDEsIDEpLm5vcm1hbGl6ZSgpXG4gICAgc2NlbmUuYWRkKCBkaXJlY3Rpb25hbExpZ2h0IClcblxuICAgIGRpcmVjdGlvbmFsTGlnaHQgPSBuZXcgVEhSRUUuRGlyZWN0aW9uYWxMaWdodCgpXG4gICAgZGlyZWN0aW9uYWxMaWdodC5wb3NpdGlvbi5zZXQoIC0xLCAtMSwgLTEpLm5vcm1hbGl6ZSgpXG4gICAgc2NlbmUuYWRkKCBkaXJlY3Rpb25hbExpZ2h0ICkgXG5cbiAgICByZW5kZXJlciA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlcmVyXG4gICAgcmVuZGVyZXIuc2V0U2l6ZSB3LCBoXG5cbiAgICAkKEBlbGVtZW50SWQpLmFwcGVuZCByZW5kZXJlci5kb21FbGVtZW50XG5cbiAgYW5pbWF0ZTogPT5cbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgQGFuaW1hdGVcbiAgICBAcmVuZGVyKClcblxuICB3aW5EaXNwbGF5ZWQgPSBmYWxzZVxuXG4gIHdpbiA9IC0+XG4gICAgaWYgbm90IHdpbkRpc3BsYXllZFxuICAgICAgc291bmQgJ2NoZWVyJ1xuICAgICAgd2luRGlzcGxheWVkID0gdHJ1ZVxuIFxuICBkaXJlY3Rpb24gPSAxXG4gIHJlbmRlcjogPT5cbiAgICBAZ2FtZS5wb3NpdGlvbkluZGljZXMoKS5mb3JFYWNoIEByZW5kZXJJbmRleFxuXG4gICAgaWYgQGdhbWUuaXNXaW4oKVxuICAgICAgd2luKClcbiAgICAgIEB0ZXh0TWVzaC52aXNpYmxlID0gdHJ1ZVxuICAgICAgQHRleHRNZXNoLnJvdGF0aW9uLnggKz0gMC4wMVxuICAgIGVsc2VcbiAgICAgIEBncnAucm90YXRpb24ueSArPSBkaXJlY3Rpb24gKiAwLjAwNVxuICAgICAgaWYgZGlyZWN0aW9uID4gMCBhbmQgQGdycC5yb3RhdGlvbi55ID4gUElkaXY4XG4gICAgICAgIGRpcmVjdGlvbiA9IC0xXG4gICAgICBlbHNlIGlmIGRpcmVjdGlvbiA8IDAgYW5kIEBncnAucm90YXRpb24ueSA8IC1QSWRpdjhcbiAgICAgICAgZGlyZWN0aW9uID0gMVxuXG5cbiAgICByZW5kZXJlci5yZW5kZXIgc2NlbmUsIGNhbWVyYVxuXG4gIHJlbmRlckluZGV4OiAoaW5kZXgpID0+XG4gICAgbWFya2VycyA9IEBnZXRNYXJrZXJzKClcbiAgICBwaWVjZSA9IHBpZWNlc1tpbmRleC5yb3ddW2luZGV4LmNvbF1cbiAgICBtYXJrZXIgPSBAZ2FtZS5tYXJrZXJBdChpbmRleClcbiAgICBwaWVjZS5tYXRlcmlhbCA9IEBnZXRNYXRlcmlhbEJ5TWFya2VyIG1hcmtlclxuICAgIHBpZWNlLnZpc2libGUgPSBtYXJrZXIgIT0gbWFya2Vycy5lbXB0eSBcblxuICBnZXRNYXJrZXJzOiA9PlxuICAgIEBnYW1lLmdldE1hcmtlcnMoKVxuXG4gIGdldE1hdGVyaWFsQnlNYXJrZXI6IChtYXJrZXIpID0+XG4gICAgbWFya2VycyA9IEBnZXRNYXJrZXJzKClcbiAgICBzd2l0Y2ggbWFya2VyXG4gICAgICB3aGVuIG1hcmtlcnMuZW1wdHkgdGhlbiBtYXRlcmlhbHMuZW1wdHlcbiAgICAgIHdoZW4gbWFya2Vycy5hIHRoZW4gbWF0ZXJpYWxzLmFcbiAgICAgIHdoZW4gbWFya2Vycy5iIHRoZW4gbWF0ZXJpYWxzLmJcbiAgICAgIGVsc2UgdGhyb3cgJ1RoZXJlIGlzIG5vIG1hdGVyaWFsIGRlZmluZWQgZm9yIHRoYXQgbWFya2VyJ1xuXG5cbiQgLT5cbiAgZ2FtZSA9IG5ldyBHYW1lXG4gIHVpID0gbmV3IFVJVGhyZWUgJyNnYW1lJywgZ2FtZVxuICB1aS5zdGFydCgpXG5cbiJdfQ==
