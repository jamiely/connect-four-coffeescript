'use strict';
(function() {
	var CSG;
	
	if ( parseInt( THREE.REVISION, 10 ) < 49 ) throw 'ThreeCSG: three.js must be revision 49 or higher';
	
	THREE.GeometryUtils.triangulateQuads = function ( geometry ) {

		for ( var i = geometry.faces.length - 1; i >= 0; i -- ) {

			var face = geometry.faces[ i ];

			if ( face instanceof THREE.Face4 ) {

				var a = face.a;
				var b = face.b;
				var c = face.c;
				var d = face.d;

				var triA = new THREE.Face3( a, b, d );
				var triB = new THREE.Face3( b, c, d );

				triA.materialIndex = triB.materialIndex = face.materialIndex;

				triA.color.copy( face.color );
				triB.color.copy( face.color );

				if ( face.vertexColors.length === 4 ) {

					var cA = face.vertexColors[ 0 ];
					var cB = face.vertexColors[ 1 ];
					var cC = face.vertexColors[ 2 ];
					var cD = face.vertexColors[ 3 ];

					triA.vertexColors[ 0 ] = cA.clone();
					triA.vertexColors[ 1 ] = cB.clone();
					triA.vertexColors[ 2 ] = cD.clone();

					triB.vertexColors[ 0 ] = cB.clone();
					triB.vertexColors[ 1 ] = cC.clone();
					triB.vertexColors[ 2 ] = cD.clone();

				}

				geometry.faces.splice( i, 1, triA, triB );

				for ( var j = 0; j < geometry.faceVertexUvs.length; j ++ ) {

					if ( geometry.faceVertexUvs[ j ].length ) {

						var faceVertexUvs = geometry.faceVertexUvs[ j ][ i ];

						var uvA = faceVertexUvs[ 0 ];
						var uvB = faceVertexUvs[ 1 ];
						var uvC = faceVertexUvs[ 2 ];
						var uvD = faceVertexUvs[ 3 ];

						var uvsTriA = [ uvA.clone(), uvB.clone(), uvD.clone() ];
						var uvsTriB = [ uvB.clone(), uvC.clone(), uvD.clone() ];

						geometry.faceVertexUvs[ j ].splice( i, 1, uvsTriA, uvsTriB );

					}

				}

				for ( var j = 0; j < geometry.faceUvs.length; j ++ ) {

					if ( geometry.faceUvs[ j ].length ) {

						var faceUv = geometry.faceUvs[ j ][ i ];

						geometry.faceUvs[ j ].splice( i, 1, faceUv, faceUv );

					}

				}

			}

		}

		geometry.computeCentroids();
		geometry.computeFaceNormals();
		geometry.computeVertexNormals();

		if ( geometry.hasTangents ) geometry.computeTangents();

	};
	
	
	/* Extend core Three.js objects */
	THREE.Vector3.prototype.lerpVertex = function(a, t) {
		return this.addSelf(
			a.clone().subSelf( this ).multiplyScalar( t )
		);
	};
	
	THREE.Vector3.prototype.cloneVertex = function() {
		var vertex = this.clone();
		if ( this.normal ) {
			vertex.normal = this.normal.clone();
		}
		return vertex;
	};
	
	THREE.Vector3.prototype.flipVertex = function() {
		if ( this.normal ) {
			this.normal.negate();
		}
	};
	
	THREE.Vector3.prototype.interpolateVertex = function( other, t ) {
		var vertex = this.clone().lerpVertex( other, t );
		if ( this.normal ) {
			vertex.normal = this.normal.clone().lerpVertex( other.normal, t );
		}
		return vertex;
	};
	
	THREE.Face3.prototype.csgClone = function() {
		var face = this.clone();
		
		if ( this.vertices ) {
			face.vertices = [
				this.vertices[0].cloneVertex(),
				this.vertices[1].cloneVertex(),
				this.vertices[2].cloneVertex()
			];
		}
		
		return face;
	};
	
	THREE.Face3.prototype.csgFlip = function() {
		this.normal.negate();
		
		var t = this.a;
		this.a = this.c;
		this.c = t;
		
		t = this.vertices[0];
		this.vertices[0] = this.vertices[2];
		this.vertices[2] = t;
		
		if ( this.vertexNormals.length ) {
			this.vertexNormals[0].negate();
			this.vertexNormals[1].negate();
			this.vertexNormals[2].negate();
		}
		
		if ( this.vertexTangents.length ) {
			this.vertexTangents[0].negate();
			this.vertexTangents[1].negate();
			this.vertexTangents[2].negate();
		}
	};
	
	
	/* CSG */
	CSG = function( polygons ) {
		this.polygons = polygons || [];
	};
	
	CSG.fromPolygons = function( polygons ) {
		return new CSG( polygons );
	};
	
	CSG.prototype.clone = function() {
		return new CSG( this.polygons.map( function(p) { return p.clone(); } ) );
	};
	
	
	/* CSG.Plane */
	CSG.Plane = function( normal, w ) {
		this.normal = normal;
		this.w = w;
	};
	
	// `CSG.Plane.EPSILON` is the tolerance used by `splitPolygon()` to decide if a
	// point is on the plane.
	CSG.Plane.EPSILON = 1e-5;
	
	CSG.Plane.prototype.clone = function() {
		return new CSG.Plane( this.normal.clone() , this.w );
	};

	CSG.Plane.prototype.flip = function() {
		this.normal.negate();
		this.w = -this.w;
	};
	
	// Split `polygon` by this plane if needed, then put the polygon or polygon
	// fragments in the appropriate lists. Coplanar polygons go into either
	// `coplanarFront` or `coplanarBack` depending on their orientation with
	// respect to this plane. Polygons in front or in back of this plane go into
	// either `front` or `back`.
	CSG.Plane.prototype.splitPolygon = function( polygon, coplanarFront, coplanarBack, front, back ) {
		var COPLANAR = 0,
			FRONT = 1,
			BACK = 2,
			SPANNING = 3;
		
		// Classify each point as well as the entire polygon into one of the above
		// four classes.
		var i, t, type, face,
			polygonType = 0,
			types = [];
		
		for (i = 0; i < polygon.vertices.length; i++) {
			t = this.normal.dot( polygon.vertices[i] ) - this.w;
			type = (t < -CSG.Plane.EPSILON) ? BACK : (t > CSG.Plane.EPSILON) ? FRONT : COPLANAR;
			polygonType |= type;
			types.push( type );
		}
		
		// Put the polygon in the correct list, splitting it when necessary.
		switch ( polygonType ) {
			case COPLANAR:
				(this.normal.dot( polygon.normal ) > 0 ? coplanarFront : coplanarBack).push( polygon );
				break;
				
			case FRONT:
				front.push( polygon );
				break;
				
			case BACK:
				back.push( polygon );
				break;
				
			case SPANNING:
				var i, j, ti, tj, vi, vj,
					t, v,
					f = [],
					b = [];
				
				for ( i = 0; i < polygon.vertices.length; i++ ) {
					
					j = (i + 1) % polygon.vertices.length;
					ti = types[i]
					tj = types[j];
					vi = polygon.vertices[i];
					vj = polygon.vertices[j];
					
					if ( ti != BACK ) f.push( vi );
					if ( ti != FRONT ) b.push( ti != BACK ? vi.cloneVertex() : vi.cloneVertex() );
					if ( (ti | tj) == SPANNING ) {
						t = ( this.w - this.normal.dot( vi ) ) / this.normal.dot( vj.cloneVertex().subSelf( vi ) );
						v = vi.interpolateVertex( vj, t );
						f.push( v.cloneVertex() );
						b.push( v.cloneVertex() );
					}
				}
				
				if (f.length >= 3) {
					for ( i = 2; i < f.length; i++ ) {
						face = new THREE.Face3( 0, 0, 0, polygon.normal.clone() );
						face.vertices = [ f[0], f[i-1], f[i] ];
						front.push( face );
					}
				}
				
				if (b.length >= 3) {
					for ( i = 2; i < b.length; i++ ) {
						face = new THREE.Face3( 0, 0, 0, polygon.normal.clone() );
						face.vertices = [ b[0], b[i-1], b[i] ];
						back.push( face );
					}
				}
				
				break;
		}
		
	};
	
	
	/* CSG.Node */
	CSG.Node = function( polygons ) {
		this.plane = null;
		this.front = null;
		this.back = null;
		this.polygons = [];
		if ( polygons ) this.build( polygons );
	};
	
	CSG.Node.prototype.clone = function() {
		var node = new CSG.Node();
		node.plane = this.plane && this.plane.clone();
		node.front = this.front && this.front.clone();
		node.back = this.back && this.back.clone();
		node.polygons = this.polygons.map( function(p) { return p.csgClone(); } );
		return node;
	};
	
	// Convert solid space to empty space and empty space to solid space.
	CSG.Node.prototype.invert = function() {
		var i, temp;
		
		for ( i = 0; i < this.polygons.length; i++ ) {
		  this.polygons[i].csgFlip();
		}
		
		this.plane.flip();
		if ( this.front ) this.front.invert();
		if ( this.back ) this.back.invert();
		
		temp = this.front;
		this.front = this.back;
		this.back = temp;
	};
	
	// Recursively remove all polygons in `polygons` that are inside this BSP tree.
	CSG.Node.prototype.clipPolygons = function( polygons ) {
		var front, back, i;
		
		if ( !this.plane ) return polygons.slice();
		
		front = [], back = [];
		
		for ( i = 0; i < polygons.length; i++ ) {
			this.plane.splitPolygon( polygons[i], front, back, front, back );
		}
		
		if ( this.front ) front = this.front.clipPolygons( front );
		if ( this.back ) {
			back = this.back.clipPolygons( back );
		} else {
			back = [];
		}
		
		return front.concat( back );
	};
	
	// Remove all polygons in this BSP tree that are inside the other BSP tree `bsp`.
	CSG.Node.prototype.clipTo = function( bsp ) {
		this.polygons = bsp.clipPolygons( this.polygons );
		if ( this.front ) this.front.clipTo( bsp );
		if ( this.back ) this.back.clipTo( bsp );
	};
	
	// Return a list of all polygons in this BSP tree.
	CSG.Node.prototype.allPolygons = function() {
		var polygons = this.polygons.slice();
		if ( this.front ) polygons = polygons.concat( this.front.allPolygons() );
		if ( this.back ) polygons = polygons.concat( this.back.allPolygons() );
		return polygons;
	};
	
	// Return a new CSG solid representing space in either this solid or in the
	// solid `csg`. Neither this solid nor the solid `csg` are modified.
	// 
	//     A.union(B)
	// 
	//     +-------+            +-------+
	//     |       |            |       |
	//     |   A   |            |       |
	//     |    +--+----+   =   |       +----+
	//     +----+--+    |       +----+       |
	//          |   B   |            |       |
	//          |       |            |       |
	//          +-------+            +-------+
	// 
	CSG.Node.prototype.union = function( csg ) {
		var a = this.clone();
		var b = csg.clone();
		a.clipTo( b );
		b.clipTo( a );
		b.invert();
		b.clipTo( a );
		b.invert();
		a.build( b.allPolygons() );
		return a;
	};
	
	// Return a new CSG solid representing space in this solid but not in the
	// solid `csg`. Neither this solid nor the solid `csg` are modified.
	// 
	//     A.subtract(B)
	// 
	//     +-------+            +-------+
	//     |       |            |       |
	//     |   A   |            |       |
	//     |    +--+----+   =   |    +--+
	//     +----+--+    |       +----+
	//          |   B   |
	//          |       |
	//          +-------+
	// 
	CSG.Node.prototype.subtract = function( csg ) {
		var a = this.clone();
		var b = csg.clone();
		a.invert();
		a.clipTo( b );
		b.clipTo( a );
		b.invert();
		b.clipTo( a );
		b.invert();
		a.build( b.allPolygons() );
		a.invert();
		return a;
	};
	
	// Return a new CSG solid representing space both this solid and in the
	// solid `csg`. Neither this solid nor the solid `csg` are modified.
	// 
	//     A.intersect(B)
	// 
	//     +-------+
	//     |       |
	//     |   A   |
	//     |    +--+----+   =   +--+
	//     +----+--+    |       +--+
	//          |   B   |
	//          |       |
	//          +-------+
	// 
	CSG.Node.prototype.intersect = function( csg ) {
		var a = this.clone();
		var b = csg.clone();
		a.invert();
		b.clipTo( a );
		b.invert();
		a.clipTo( b );
		b.clipTo( a );
		a.build( b.allPolygons() );
		a.invert();
		return a;
	};
	
	// Build a BSP tree out of `polygons`. When called on an existing tree, the
	// new polygons are filtered down to the bottom of the tree and become new
	// nodes there. Each set of polygons is partitioned using the first polygon
	// (no heuristic is used to pick a good split).
	CSG.Node.prototype.build = function( faces ) {
		
		var i, face, geometry,
			front = [], back = [];
		
		if (!faces.length) return;
		
		if (!this.plane) {
			var n = faces[0].vertices[1].cloneVertex().subSelf(
				faces[0].vertices[0]
			).crossSelf(
				faces[0].vertices[2].cloneVertex().subSelf( faces[0].vertices[0] )
			).normalize();
			
			this.plane = new CSG.Plane(
				n,
				n.clone().dot( faces[0].vertices[0] )
			);
		}
		
		for ( i = 0; i < faces.length; i++ ) {
			this.plane.splitPolygon( faces[i], this.polygons, this.polygons, front, back );
		}
		
		if ( front.length ) {
			if ( !this.front ) this.front = new CSG.Node();
			this.front.build( front );
		}
		
		if ( back.length ) {
			if ( !this.back ) this.back = new CSG.Node();
			this.back.build( back );
		}
		
	};
	
	CSG.Node.prepGeometry = function( source, transform_matrix ) {
		
		/* TODO: Apply mesh rotation to the normals */
		
		var geometry, face, i,
			v1, v2, v3;
		
		if ( source instanceof THREE.Mesh ) {
			geometry = source.geometry;
			source.updateMatrix();
			transform_matrix = transform_matrix || new THREE.Matrix4().multiply( source.matrixWorld, source.matrix );
		} else if ( source instanceof THREE.Geometry ) {
			geometry = source;
			transform_matrix = transform_matrix || new THREE.Matrix4().identity();
		} else {
			return;
		}
		
		THREE.GeometryUtils.triangulateQuads( geometry );
		
		for ( i = 0; i < geometry.faces.length; i++ ) {
			face = geometry.faces[i];
			
			v1 = geometry.vertices[face.a].cloneVertex();
			transform_matrix.multiplyVector3( v1 );
			v2 = geometry.vertices[face.b].cloneVertex();
			transform_matrix.multiplyVector3( v2 );
			v3 = geometry.vertices[face.c].cloneVertex();
			transform_matrix.multiplyVector3( v3 );
			
			face.vertices = [ v1, v2, v3 ];
		}
		
		return geometry.faces;
	};
	
	CSG.Node.prototype.toGeometry = (function() {
		var getVertex = function( vertex, vertex_dictionary ) {
			if ( vertex.idx !== undefined ) return vertex;
			
			if ( vertex_dictionary.count === undefined ) vertex_dictionary.count = 0;
			
			var vertex_identifier = vertex.x + '_' + vertex.y + '_' + vertex.z;
			
			if ( vertex_dictionary[ vertex_identifier ] !== undefined ) {
				return vertex_dictionary[ vertex_identifier ];
			} else {
				vertex = vertex.clone();
				vertex.idx = vertex_dictionary.count++;
				vertex_dictionary[ vertex_identifier ] = vertex;
			}
			
			return vertex;
		};
		
		return function( untransform ) {
			var i, face,
				geometry = new THREE.Geometry(),
				polygons = this.allPolygons(),
				vertex_dictionary = {},
				a, b, c;
			
			untransform = untransform || new THREE.Matrix4().identity();
			
			for ( i = 0; i < polygons.length; i++ ) {
				// @todo, avoid overlapping vertices
				
				a = getVertex( polygons[i].vertices[0], vertex_dictionary );
				b = getVertex( polygons[i].vertices[1], vertex_dictionary );
				c = getVertex( polygons[i].vertices[2], vertex_dictionary );
				
				if ( a.idx >= geometry.vertices.length ) {
					geometry.vertices.push( a );
					untransform.multiplyVector3( geometry.vertices[geometry.vertices.length - 1] );
				}
				
				if ( b.idx >= geometry.vertices.length ) {
					geometry.vertices.push( b );
					untransform.multiplyVector3( geometry.vertices[geometry.vertices.length - 1] );
				}
				
				if ( c.idx >= geometry.vertices.length ) {
					geometry.vertices.push( c );
					untransform.multiplyVector3( geometry.vertices[geometry.vertices.length - 1] );
				}
				
				face = polygons[i];
				face.a = a.idx;
				face.b = b.idx;
				face.c = c.idx;
				
				geometry.faces.push( face );
				
				geometry.faceVertexUvs[0].push( new THREE.UV( ), new THREE.UV( ), new THREE.UV( ) );
			}
			
			
			geometry.computeBoundingSphere();
			geometry.computeBoundingBox();
			
			return geometry;
		};
	})();
	
	/* Add CSG capabilities to THREE.Mesh */
	THREE.Mesh.prototype._buildBSPTree = function() {
		
		this._bsptree = new CSG.Node( CSG.Node.prepGeometry( this ) );
		
		return this._bsptree;
	};
	
	THREE.Mesh.prototype.subtract = function( target ) {
		if ( !this._bsptree ) {
			this._buildBSPTree();
		}
		
		if ( !target._bsptree ) {
			target._buildBSPTree();
		}
		
		this._bsptree = this._bsptree.subtract( target._bsptree );
		this.geometry = this._bsptree.toGeometry( new THREE.Matrix4().getInverse( new THREE.Matrix4().multiply( this.matrixWorld, this.matrix ) ) );
	};
	
	THREE.Mesh.prototype.intersect = function( target ) {
		if ( !this._bsptree ) {
			this._buildBSPTree();
		}
		
		if ( !target._bsptree ) {
			target._buildBSPTree();
		}
		
		this._bsptree = this._bsptree.intersect( target._bsptree );
		this.geometry = this._bsptree.toGeometry( new THREE.Matrix4().getInverse( new THREE.Matrix4().multiply( this.matrixWorld, this.matrix ) ) );
	};
	
	THREE.Mesh.prototype.union = function( target ) {
		if ( !this._bsptree ) {
			this._buildBSPTree();
		}
		
		if ( !target._bsptree ) {
			target._buildBSPTree();
		}
		
		this._bsptree = this._bsptree.union( target._bsptree );
		this.geometry = this._bsptree.toGeometry( new THREE.Matrix4().getInverse( new THREE.Matrix4().multiply( this.matrixWorld, this.matrix ) ) );
	};
})();