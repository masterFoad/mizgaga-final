// import * as  THREE from './threejs'
//
// /**
//  * Polyhedrons which support subdivision.
//  *
//  * Vertices have 'smooth' normals,
//  * to make a sharp edge choose a material that uses face normals instead.
//  *
//  * @author timothypratley@gmail.com
//  * @author daniel.deady@knectar.com
//  * @param radius
//  * @param detail Final number of triangles = 4^detail * X
//  */
//
// THREE.TetrahedronGeometry = function (radius, detail) {
//     const vs = [[+1, +1, +1],
//             [-1, -1, +1],
//             [-1, +1, -1],
//             [+1, -1, -1]],
//         fs = [[2, 1, 0],
//             [0, 3, 2],
//             [1, 3, 0],
//             [2, 3, 1]];
//
//     THREE.PolyhedronGeometry.call(this, vs, fs, radius, detail);
// };
// THREE.TetrahedronGeometry.prototype = new THREE.Geometry();
// THREE.TetrahedronGeometry.prototype.constructor = THREE.TetrahedronGeometry;
//
// THREE.OctahedronGeometry = function (radius, detail) {
//     const vs = [[+1, 0, 0],
//             [-1, 0, 0], // left
//             [0, +1, 0], // up
//             [0, -1, 0], // down
//             [0, 0, +1], // front
//             [0, 0, -1]], // back
//         fs = [[0, 2, 4],
//             [0, 4, 3],
//             [0, 3, 5],
//             [0, 5, 2],
//             [1, 2, 5],
//             [1, 5, 3],
//             [1, 3, 4],
//             [1, 4, 2]];
//
//     THREE.PolyhedronGeometry.call(this, vs, fs, radius, detail);
// };
// THREE.OctahedronGeometry.prototype = new THREE.Geometry();
// THREE.OctahedronGeometry.prototype.constructor = THREE.OctahedronGeometry;
//
// THREE.IcosahedronGeometry = function (radius, detail) {
//     const t = (1 + Math.sqrt(5)) / 2,
//         // create 12 vertices of a Icosahedron
//         vs = [[-1, t, 0],
//             [1, t, 0],
//             [-1, -t, 0],
//             [1, -t, 0],
//
//             [0, -1, t],
//             [0, 1, t],
//             [0, -1, -t],
//             [0, 1, -t],
//
//             [t, 0, -1],
//             [t, 0, 1],
//             [-t, 0, -1],
//             [-t, 0, 1]],
//         fs = [
//             // 5 faces around point 0
//             [0, 11, 5],
//             [0, 5, 1],
//             [0, 1, 7],
//             [0, 7, 10],
//             [0, 10, 11],
//
//             // 5 adjacent faces
//             [1, 5, 9],
//             [5, 11, 4],
//             [11, 10, 2],
//             [10, 7, 6],
//             [7, 1, 8],
//
//             // 5 faces around point 3
//             [3, 9, 4],
//             [3, 4, 2],
//             [3, 2, 6],
//             [3, 6, 8],
//             [3, 8, 9],
//
//             // 5 adjacent faces
//             [4, 9, 5],
//             [2, 4, 11],
//             [6, 2, 10],
//             [8, 6, 7],
//             [9, 8, 1]];
//
//     THREE.PolyhedronGeometry.call(this, vs, fs, radius, detail);
// };
// THREE.IcosahedronGeometry.prototype = new THREE.Geometry();
// THREE.IcosahedronGeometry.prototype.constructor = THREE.IcosahedronGeometry;
//
//
// THREE.PolyhedronGeometry = function (vs, fs, radius, detail) {
//
//     THREE.Geometry.call(this);
//
//     radius = radius || 1;
//     detail = detail || 0;
//
//     let that = this,
//         ii;
//
//     for (ii = 0; ii < vs.length; ii++) {
//         prepare(new THREE.Vector3(vs[ii][0], vs[ii][1], vs[ii][2]));
//     }
//     const midpoints = [], p = this.vertices;
//
//     // careful to output faces counter-clockwise, that is required for meshes
//     for (ii = 0; ii < fs.length; ii++) {
//         make(p[fs[ii][0]], p[fs[ii][1]], p[fs[ii][2]], detail);
//     }
//
//     this.mergeVertices();
//
//     /**
//      * Project vector onto sphere's surface
//      */
//     function prepare(vector) {
//
//         const vertex = new THREE.Vertex(vector.clone().normalize().multiplyScalar(radius));
//         vertex.index = that.vertices.push(vertex) - 1;
//
//         // Texture coords are equivalent to map coords, calculate angle and convert to fraction of a circle.
//         const u = azimuth(vector) / 2 / Math.PI + 0.5;
//         const v = inclination(vector) / Math.PI + 0.5;
//         vertex.uv = new THREE.UV(u, v);
//
//         return vertex;
//
//     }
//
//     /**
//      * Approximate a curved face with recursively sub-divided triangles.
//      */
//     function make(v1, v2, v3, detail) {
//
//         if (detail < 1) {
//
//             const face = new THREE.Face3(v1.index, v2.index, v3.index, [v1.position, v2.position, v3.position]);
//             face.centroid.addSelf(v1.position).addSelf(v2.position).addSelf(v3.position).divideScalar(3);
//             face.normal = face.centroid.clone().normalize();
//             that.faces.push(face);
//
//             const azi = azimuth(face.centroid);
//             that.faceVertexUvs[0].push([
//                 correctUV(v1.uv, v1.position, azi),
//                 correctUV(v2.uv, v2.position, azi),
//                 correctUV(v3.uv, v3.position, azi)
//             ]);
//
//         }
//         else {
//
//             detail -= 1;
//             // split triangle into 4 smaller triangles
//             make(v1, midpoint(v1, v2), midpoint(v1, v3), detail); // top quadrant
//             make(midpoint(v1, v2), v2, midpoint(v2, v3), detail); // left quadrant
//             make(midpoint(v1, v3), midpoint(v2, v3), v3, detail); // right quadrant
//             make(midpoint(v1, v2), midpoint(v2, v3), midpoint(v1, v3), detail); // center quadrant
//
//         }
//
//     }
//
//     function midpoint(v1, v2) {
//
//         if (!midpoints[v1.index]) midpoints[v1.index] = [];
//         if (!midpoints[v2.index]) midpoints[v2.index] = [];
//         let mid = midpoints[v1.index][v2.index];
//         if (mid === undefined) {
//             // generate mean point and project to surface with prepare()
//             midpoints[v1.index][v2.index] = midpoints[v2.index][v1.index] = mid = prepare(
//                 new THREE.Vector3().add(v1.position, v2.position).divideScalar(2)
//             );
//         }
//         return mid;
//
//     }
//
//     /**
//      * Angle around the Y axis, counter-clockwise when looking from above.
//      */
//     function azimuth(vector) {
//
//         return Math.atan2(vector.z, -vector.x);
//
//     }
//
//     /**
//      * Angle above the XZ plane.
//      */
//     function inclination(vector) {
//
//         return Math.atan2(-vector.y, Math.sqrt((vector.x * vector.x) + (vector.z * vector.z)));
//
//     }
//
//     /**
//      * Texture fixing helper. Spheres have some odd behaviours.
//      */
//     function correctUV(uv, vector, azimuth) {
//
//         if ((azimuth < 0) && (uv.u === 1)) uv = new THREE.UV(uv.u - 1, uv.v);
//         if ((vector.x === 0) && (vector.z === 0)) uv = new THREE.UV(azimuth / 2 / Math.PI + 0.5, uv.v);
//         return uv;
//
//     }
//
//     this.boundingSphere = { radius: radius };
//
// };
//
// THREE.PolyhedronGeometry.prototype = new THREE.Geometry();
// THREE.PolyhedronGeometry.prototype.constructor = THREE.PolyhedronGeometry;
