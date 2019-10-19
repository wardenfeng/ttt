namespace CANNON
{
    export class Narrowphase
    {
        /**
         * Internal storage of pooled contact points.
         */
        contactPointPool: ContactEquation[];
        frictionEquationPool: FrictionEquation[];
        result: ContactEquation[];
        frictionResult: FrictionEquation[];
        world: World;
        currentContactMaterial: any;
        enableFrictionReduction: boolean;

        /**
         * 
         * @param world 
         */
        constructor(world: World)
        {
            this.contactPointPool = [];

            this.frictionEquationPool = [];

            this.result = [];
            this.frictionResult = [];

            this.world = world;
            this.currentContactMaterial = null;

            this.enableFrictionReduction = false;
        }

        /**
         * Make a contact object, by using the internal pool or creating a new one.
         * 
         * @param bi 
         * @param bj 
         * @param si 
         * @param sj 
         * @param overrideShapeA 
         * @param overrideShapeB 
         */
        createContactEquation(bi: Body, bj: Body, si: Shape, sj: Shape, overrideShapeA: Shape, overrideShapeB: Shape)
        {
            var c: ContactEquation;
            if (this.contactPointPool.length)
            {
                c = this.contactPointPool.pop();
                c.bi = bi;
                c.bj = bj;
            } else
            {
                c = new ContactEquation(bi, bj);
            }

            c.enabled = bi.collisionResponse && bj.collisionResponse && si.collisionResponse && sj.collisionResponse;

            var cm = this.currentContactMaterial;

            c.restitution = cm.restitution;

            c.setSpookParams(
                cm.contactEquationStiffness,
                cm.contactEquationRelaxation,
                this.world.dt
            );

            var matA = si.material || bi.material;
            var matB = sj.material || bj.material;
            if (matA && matB && matA.restitution >= 0 && matB.restitution >= 0)
            {
                c.restitution = matA.restitution * matB.restitution;
            }

            c.si = overrideShapeA || si;
            c.sj = overrideShapeB || sj;

            return c;
        };

        createFrictionEquationsFromContact(contactEquation: any, outArray: FrictionEquation[])
        {
            var bodyA = contactEquation.bi;
            var bodyB = contactEquation.bj;
            var shapeA = contactEquation.si;
            var shapeB = contactEquation.sj;

            var world = this.world;
            var cm = this.currentContactMaterial;

            // If friction or restitution were specified in the material, use them
            var friction = cm.friction;
            var matA = shapeA.material || bodyA.material;
            var matB = shapeB.material || bodyB.material;
            if (matA && matB && matA.friction >= 0 && matB.friction >= 0)
            {
                friction = matA.friction * matB.friction;
            }

            if (friction > 0)
            {
                // Create 2 tangent equations
                var mug = friction * world.gravity.length;
                var reducedMass = (bodyA.invMass + bodyB.invMass);
                if (reducedMass > 0)
                {
                    reducedMass = 1 / reducedMass;
                }
                var pool = this.frictionEquationPool;
                var c1: FrictionEquation = pool.length ? pool.pop() : new FrictionEquation(bodyA, bodyB, mug * reducedMass);
                var c2: FrictionEquation = pool.length ? pool.pop() : new FrictionEquation(bodyA, bodyB, mug * reducedMass);

                c1.bi = c2.bi = bodyA;
                c1.bj = c2.bj = bodyB;
                c1.minForce = c2.minForce = -mug * reducedMass;
                c1.maxForce = c2.maxForce = mug * reducedMass;

                // Copy over the relative vectors
                c1.ri.copy(contactEquation.ri);
                c1.rj.copy(contactEquation.rj);
                c2.ri.copy(contactEquation.ri);
                c2.rj.copy(contactEquation.rj);

                // Construct tangents
                contactEquation.ni.tangents(c1.t, c2.t);

                // Set spook params
                c1.setSpookParams(cm.frictionEquationStiffness, cm.frictionEquationRelaxation, world.dt);
                c2.setSpookParams(cm.frictionEquationStiffness, cm.frictionEquationRelaxation, world.dt);

                c1.enabled = c2.enabled = contactEquation.enabled;

                outArray.push(c1, c2);

                return true;
            }

            return false;
        }

        // Take the average N latest contact point on the plane.
        createFrictionFromAverage(numContacts: number)
        {
            // The last contactEquation
            var c = this.result[this.result.length - 1];

            // Create the result: two "average" friction equations
            if (!this.createFrictionEquationsFromContact(c, this.frictionResult) || numContacts === 1)
            {
                return;
            }

            var f1 = this.frictionResult[this.frictionResult.length - 2];
            var f2 = this.frictionResult[this.frictionResult.length - 1];


            var averageNormal = new feng3d.Vector3();
            var averageContactPointA = new feng3d.Vector3();
            var averageContactPointB = new feng3d.Vector3();

            var bodyA = c.bi;
            var bodyB = c.bj;
            for (var i = 0; i !== numContacts; i++)
            {
                c = this.result[this.result.length - 1 - i];
                if (c.bi !== bodyA)
                {
                    averageNormal.addTo(c.ni, averageNormal);
                    averageContactPointA.addTo(c.ri, averageContactPointA);
                    averageContactPointB.addTo(c.rj, averageContactPointB);
                } else
                {
                    averageNormal.subTo(c.ni, averageNormal);
                    averageContactPointA.addTo(c.rj, averageContactPointA);
                    averageContactPointB.addTo(c.ri, averageContactPointB);
                }
            }

            var invNumContacts = 1 / numContacts;
            averageContactPointA.scaleNumberTo(invNumContacts, f1.ri);
            averageContactPointB.scaleNumberTo(invNumContacts, f1.rj);
            f2.ri.copy(f1.ri); // Should be the same
            f2.rj.copy(f1.rj);
            averageNormal.normalize();
            averageNormal.tangents(f1.t, f2.t);
            // return eq;
        }

        /**
         * Generate all contacts between a list of body pairs
         * @method getContacts
         * @param {array} p1 Array of body indices
         * @param {array} p2 Array of body indices
         * @param {World} world
         * @param {array} result Array to store generated contacts
         * @param {array} oldcontacts Optional. Array of reusable contact objects
         */
        getContacts(p1: Body[], p2: Body[], world: World, result: ContactEquation[], oldcontacts: ContactEquation[], frictionResult: FrictionEquation[], frictionPool: FrictionEquation[])
        {
            // Save old contact objects
            this.contactPointPool = oldcontacts;
            this.frictionEquationPool = frictionPool;
            this.result = result;
            this.frictionResult = frictionResult;

            var qi = new feng3d.Quaternion();
            var qj = new feng3d.Quaternion();
            var xi = new feng3d.Vector3();
            var xj = new feng3d.Vector3();

            for (var k = 0, N = p1.length; k !== N; k++)
            {
                // Get current collision bodies
                var bi = p1[k],
                    bj = p2[k];

                // Get contact material
                var bodyContactMaterial = null;
                if (bi.material && bj.material)
                {
                    bodyContactMaterial = world.getContactMaterial(bi.material, bj.material) || null;
                }

                var justTest = (
                    (
                        (bi.type & Body.KINEMATIC) && (bj.type & Body.STATIC)
                    ) || (
                        (bi.type & Body.STATIC) && (bj.type & Body.KINEMATIC)
                    ) || (
                        (bi.type & Body.KINEMATIC) && (bj.type & Body.KINEMATIC)
                    )
                );

                for (var i = 0; i < bi.shapes.length; i++)
                {
                    bi.quaternion.multTo(bi.shapeOrientations[i], qi);
                    bi.quaternion.rotatePoint(bi.shapeOffsets[i], xi);
                    xi.addTo(bi.position, xi);
                    var si = bi.shapes[i];

                    for (var j = 0; j < bj.shapes.length; j++)
                    {

                        // Compute world transform of shapes
                        bj.quaternion.multTo(bj.shapeOrientations[j], qj);
                        bj.quaternion.rotatePoint(bj.shapeOffsets[j], xj);
                        xj.addTo(bj.position, xj);
                        var sj = bj.shapes[j];

                        if (!((si.collisionFilterMask & sj.collisionFilterGroup) && (sj.collisionFilterMask & si.collisionFilterGroup)))
                        {
                            continue;
                        }

                        if (xi.distance(xj) > si.boundingSphereRadius + sj.boundingSphereRadius)
                        {
                            continue;
                        }

                        // Get collision material
                        var shapeContactMaterial = null;
                        if (si.material && sj.material)
                        {
                            shapeContactMaterial = world.getContactMaterial(si.material, sj.material) || null;
                        }

                        this.currentContactMaterial = shapeContactMaterial || bodyContactMaterial || world.defaultContactMaterial;

                        // Get contacts
                        var resolver = this[si.type | sj.type];
                        if (resolver)
                        {
                            var retval = false;
                            if (si.type < sj.type)
                            {
                                retval = resolver.call(this, si, sj, new Transform(xi, qi), new Transform(xj, qj), bi, bj, si, sj, justTest);
                            } else
                            {
                                retval = resolver.call(this, sj, si, new Transform(xj, qj), new Transform(xi, qi), bj, bi, si, sj, justTest);
                            }

                            if (retval && justTest)
                            {
                                // Register overlap
                                world.shapeOverlapKeeper.set(si.id, sj.id);
                                world.bodyOverlapKeeper.set(bi.id, bj.id);
                            }
                        }
                    }
                }
            }
        }

        boxBox(si: Box, sj: Box, transformi: Transform, transformj: Transform, bi: Body, bj: Body, rsi: Shape, rsj: Shape, justTest: boolean)
        {
            si.material = si.material;
            sj.material = sj.material;
            si.collisionResponse = si.collisionResponse;
            sj.collisionResponse = sj.collisionResponse;
            return this.convexConvex(si, sj, transformi, transformj, bi, bj, si, sj, justTest);
        }

        boxConvex(si: Box, sj: ConvexPolyhedron, transformi: Transform, transformj: Transform, bi: Body, bj: Body, rsi: Shape, rsj: Shape, justTest: boolean)
        {
            si.material = si.material;
            si.collisionResponse = si.collisionResponse;
            return this.convexConvex(si, sj, transformi, transformj, bi, bj, si, sj, justTest);
        }

        boxParticle(si: Box, sj: Particle, transformi: Transform, transformj: Transform, bi: Body, bj: Body, rsi: Shape, rsj: Shape, justTest: boolean)
        {
            si.material = si.material;
            si.collisionResponse = si.collisionResponse;
            return this.convexParticle(si, sj, transformi, transformj, bi, bj, si, sj, justTest);
        }

        sphereSphere(si: Sphere, sj: Sphere, xi: feng3d.Vector3, xj: feng3d.Vector3, qi: feng3d.Quaternion, qj: feng3d.Quaternion, bi: Body, bj: Body, rsi: Shape, rsj: Shape, justTest: boolean)
        {
            if (justTest)
            {
                return xi.distanceSquared(xj) < Math.pow(si.radius + sj.radius, 2);
            }

            // We will have only one contact in this case
            var r = this.createContactEquation(bi, bj, si, sj, rsi, rsj);

            // Contact normal
            xj.subTo(xi, r.ni);
            r.ni.normalize();

            // Contact point locations
            r.ri.copy(r.ni);
            r.rj.copy(r.ni);
            r.ri.scaleNumberTo(si.radius, r.ri);
            r.rj.scaleNumberTo(-sj.radius, r.rj);

            r.ri.addTo(xi, r.ri);
            r.ri.subTo(bi.position, r.ri);

            r.rj.addTo(xj, r.rj);
            r.rj.subTo(bj.position, r.rj);

            this.result.push(r);

            this.createFrictionEquationsFromContact(r, this.frictionResult);
        };

        /**
         * @method planeTrimesh
         * @param  {Shape}      si
         * @param  {Shape}      sj
         * @param  {Vector3}       xi
         * @param  {Vector3}       xj
         * @param  {Quaternion} qi
         * @param  {Quaternion} qj
         * @param  {Body}       bi
         * @param  {Body}       bj
         */
        planeTrimesh(
            planeShape: Plane,
            trimeshShape: Trimesh,
            planeTransform: Transform,
            trimeshTransform: Transform,
            planeBody: Body,
            trimeshBody: Body,
            rsi: Shape,
            rsj: Shape,
            justTest: boolean
        )
        {
            // Make contacts!
            var v = new feng3d.Vector3();
            var planePos = planeTransform.position;

            var relpos = new feng3d.Vector3();
            var projected = new feng3d.Vector3();

            var normal = new feng3d.Vector3(0, 1, 0);
            planeTransform.quaternion.rotatePoint(normal, normal); // Turn normal according to plane

            for (var i = 0; i < trimeshShape.vertices.length / 3; i++)
            {
                // Get world vertex from trimesh
                trimeshShape.getVertex(i, v);

                // Safe up
                var v2 = new feng3d.Vector3();
                v2.copy(v);
                trimeshTransform.pointToWorldFrame(v2, v);

                // Check plane side
                v.subTo(planePos, relpos);
                var dot = normal.dot(relpos);

                if (dot <= 0.0)
                {
                    if (justTest)
                    {
                        return true;
                    }

                    var r = this.createContactEquation(planeBody, trimeshBody, planeShape, trimeshShape, rsi, rsj);

                    r.ni.copy(normal); // Contact normal is the plane normal

                    // Get vertex position projected on plane
                    normal.scaleNumberTo(relpos.dot(normal), projected);
                    v.subTo(projected, projected);

                    // ri is the projected world position minus plane position
                    r.ri.copy(projected);
                    r.ri.subTo(planeBody.position, r.ri);

                    r.rj.copy(v);
                    r.rj.subTo(trimeshBody.position, r.rj);

                    // Store result
                    this.result.push(r);
                    this.createFrictionEquationsFromContact(r, this.frictionResult);
                }
            }
        }

        sphereTrimesh(
            sphereShape: Sphere,
            trimeshShape: Trimesh,
            sphereTransform: Transform,
            trimeshTransform: Transform,
            sphereBody: Body,
            trimeshBody: Body,
            rsi: Shape,
            rsj: Shape,
            justTest: boolean
        )
        {
            var spherePos = sphereTransform.position;
            //
            var edgeVertexA = new feng3d.Vector3();
            var edgeVertexB = new feng3d.Vector3();
            var edgeVector = new feng3d.Vector3();
            var edgeVectorUnit = new feng3d.Vector3();
            var localSpherePos = new feng3d.Vector3();
            var tmp = new feng3d.Vector3();
            var localSphereAABB = new feng3d.AABB();
            var v2 = new feng3d.Vector3();
            var relpos = new feng3d.Vector3();
            var triangles: number[] = [];

            // Convert sphere position to local in the trimesh
            trimeshTransform.pointToLocalFrame(spherePos, localSpherePos);

            // Get the aabb of the sphere locally in the trimesh
            var sphereRadius = sphereShape.radius;
            localSphereAABB.min.init(
                localSpherePos.x - sphereRadius,
                localSpherePos.y - sphereRadius,
                localSpherePos.z - sphereRadius
            );
            localSphereAABB.max.init(
                localSpherePos.x + sphereRadius,
                localSpherePos.y + sphereRadius,
                localSpherePos.z + sphereRadius
            );

            trimeshShape.getTrianglesInAABB(localSphereAABB, triangles);

            // Vertices
            var v = new feng3d.Vector3();
            var radiusSquared = sphereShape.radius * sphereShape.radius;
            for (var i = 0; i < triangles.length; i++)
            {
                for (var j = 0; j < 3; j++)
                {

                    trimeshShape.getVertex(trimeshShape.indices[triangles[i] * 3 + j], v);

                    // Check vertex overlap in sphere
                    v.subTo(localSpherePos, relpos);

                    if (relpos.lengthSquared <= radiusSquared)
                    {
                        // Safe up
                        v2.copy(v);
                        trimeshTransform.pointToWorldFrame(v2, v);

                        v.subTo(spherePos, relpos);

                        if (justTest)
                        {
                            return true;
                        }

                        var r = this.createContactEquation(sphereBody, trimeshBody, sphereShape, trimeshShape, rsi, rsj);
                        r.ni.copy(relpos);
                        r.ni.normalize();

                        // ri is the vector from sphere center to the sphere surface
                        r.ri.copy(r.ni);
                        r.ri.scaleNumberTo(sphereShape.radius, r.ri);
                        r.ri.addTo(spherePos, r.ri);
                        r.ri.subTo(sphereBody.position, r.ri);

                        r.rj.copy(v);
                        r.rj.subTo(trimeshBody.position, r.rj);

                        // Store result
                        this.result.push(r);
                        this.createFrictionEquationsFromContact(r, this.frictionResult);
                    }
                }
            }

            // Check all edges
            for (var i = 0; i < triangles.length; i++)
            {
                for (var j = 0; j < 3; j++)
                {

                    trimeshShape.getVertex(trimeshShape.indices[triangles[i] * 3 + j], edgeVertexA);
                    trimeshShape.getVertex(trimeshShape.indices[triangles[i] * 3 + ((j + 1) % 3)], edgeVertexB);
                    edgeVertexB.subTo(edgeVertexA, edgeVector);

                    // Project sphere position to the edge
                    localSpherePos.subTo(edgeVertexB, tmp);
                    var positionAlongEdgeB = tmp.dot(edgeVector);

                    localSpherePos.subTo(edgeVertexA, tmp);
                    var positionAlongEdgeA = tmp.dot(edgeVector);

                    if (positionAlongEdgeA > 0 && positionAlongEdgeB < 0)
                    {
                        // Now check the orthogonal distance from edge to sphere center
                        localSpherePos.subTo(edgeVertexA, tmp);

                        edgeVectorUnit.copy(edgeVector);
                        edgeVectorUnit.normalize();
                        positionAlongEdgeA = tmp.dot(edgeVectorUnit);

                        edgeVectorUnit.scaleNumberTo(positionAlongEdgeA, tmp);
                        tmp.addTo(edgeVertexA, tmp);

                        // tmp is now the sphere center position projected to the edge, defined locally in the trimesh frame
                        var dist = tmp.distance(localSpherePos);
                        if (dist < sphereShape.radius)
                        {
                            if (justTest)
                            {
                                return true;
                            }

                            var r = this.createContactEquation(sphereBody, trimeshBody, sphereShape, trimeshShape, rsi, rsj);

                            tmp.subTo(localSpherePos, r.ni);
                            r.ni.normalize();
                            r.ni.scaleNumberTo(sphereShape.radius, r.ri);

                            trimeshTransform.pointToWorldFrame(tmp, tmp);
                            tmp.subTo(trimeshBody.position, r.rj);

                            trimeshTransform.vectorToWorldFrame(r.ni, r.ni);
                            trimeshTransform.vectorToWorldFrame(r.ri, r.ri);

                            this.result.push(r);
                            this.createFrictionEquationsFromContact(r, this.frictionResult);
                        }
                    }
                }
            }

            // Triangle faces
            var va = new feng3d.Vector3();
            var vb = new feng3d.Vector3();
            var vc = new feng3d.Vector3();

            var normal = new feng3d.Vector3();
            for (var i = 0, N = triangles.length; i !== N; i++)
            {
                trimeshShape.getTriangleVertices(triangles[i], va, vb, vc);
                trimeshShape.getNormal(triangles[i], normal);
                localSpherePos.subTo(va, tmp);
                var dist = tmp.dot(normal);
                normal.scaleNumberTo(dist, tmp);
                localSpherePos.subTo(tmp, tmp);

                // tmp is now the sphere position projected to the triangle plane
                dist = tmp.distance(localSpherePos);
                if (Ray.pointInTriangle(tmp, va, vb, vc) && dist < sphereShape.radius)
                {
                    if (justTest)
                    {
                        return true;
                    }
                    var r = this.createContactEquation(sphereBody, trimeshBody, sphereShape, trimeshShape, rsi, rsj);

                    tmp.subTo(localSpherePos, r.ni);
                    r.ni.normalize();
                    r.ni.scaleNumberTo(sphereShape.radius, r.ri);

                    trimeshTransform.pointToWorldFrame(tmp, tmp);
                    tmp.subTo(trimeshBody.position, r.rj);

                    trimeshTransform.vectorToWorldFrame(r.ni, r.ni);
                    trimeshTransform.vectorToWorldFrame(r.ri, r.ri);

                    this.result.push(r);
                    this.createFrictionEquationsFromContact(r, this.frictionResult);
                }
            }

            triangles.length = 0;
        }

        spherePlane(si: Sphere, sj: Plane, transformi: Transform, transformj: Transform, bi: Body, bj: Body, rsi: Shape, rsj: Shape, justTest: boolean)
        {
            var xi = transformi.position, xj = transformj.position, qi = transformi.quaternion, qj = transformj.quaternion;

            // We will have one contact in this case
            var r = this.createContactEquation(bi, bj, si, sj, rsi, rsj);

            // Contact normal
            r.ni.init(0, 1, 0);
            qj.rotatePoint(r.ni, r.ni);
            r.ni.negateTo(r.ni); // body i is the sphere, flip normal
            r.ni.normalize(); // Needed?

            // Vector from sphere center to contact point
            r.ni.scaleNumberTo(si.radius, r.ri);

            // Project down sphere on plane
            var point_on_plane_to_sphere = xi.subTo(xj);
            var plane_to_sphere_ortho = r.ni.scaleNumberTo(r.ni.dot(point_on_plane_to_sphere));
            point_on_plane_to_sphere.subTo(plane_to_sphere_ortho, r.rj); // The sphere position projected to plane

            if (-point_on_plane_to_sphere.dot(r.ni) <= si.radius)
            {
                if (justTest)
                {
                    return true;
                }
                // Make it relative to the body
                var ri = r.ri;
                var rj = r.rj;
                ri.addTo(xi, ri);
                ri.subTo(bi.position, ri);
                rj.addTo(xj, rj);
                rj.subTo(bj.position, rj);

                this.result.push(r);
                this.createFrictionEquationsFromContact(r, this.frictionResult);
            }
        }

        sphereBox(si: Sphere, sj: Box, transformi: Transform, transformj: Transform, bi: Body, bj: Body, rsi: Shape, rsj: Shape, justTest: boolean)
        {
            var xi = transformi.position, xj = transformj.position, qi = transformi.quaternion, qj = transformj.quaternion;

            // we refer to the box as body j
            var sides = [new feng3d.Vector3(), new feng3d.Vector3(), new feng3d.Vector3(), new feng3d.Vector3(), new feng3d.Vector3(), new feng3d.Vector3()];
            var box_to_sphere = xi.subTo(xj);
            sj.getSideNormals(sides, qj);
            var R = si.radius;

            // Check side (plane) intersections
            var found = false;

            // Store the resulting side penetration info
            var side_ns = new feng3d.Vector3();
            var side_ns1 = new feng3d.Vector3();
            var side_ns2 = new feng3d.Vector3();

            var side_h: null | number = null;
            var side_penetrations = 0;
            var side_dot1 = 0;
            var side_dot2 = 0;
            var side_distance: null | number = null;
            for (var idx = 0, nsides = sides.length; idx !== nsides && found === false; idx++)
            {
                // Get the plane side normal (ns)
                var ns = new feng3d.Vector3();
                ns.copy(sides[idx]);

                var h = ns.length;
                ns.normalize();

                // The normal/distance dot product tells which side of the plane we are
                var dot = box_to_sphere.dot(ns);

                if (dot < h + R && dot > 0)
                {
                    // Intersects plane. Now check the other two dimensions
                    var ns1 = new feng3d.Vector3();
                    var ns2 = new feng3d.Vector3();
                    ns1.copy(sides[(idx + 1) % 3]);
                    ns2.copy(sides[(idx + 2) % 3]);
                    var h1 = ns1.length;
                    var h2 = ns2.length;
                    ns1.normalize();
                    ns2.normalize();
                    var dot1 = box_to_sphere.dot(ns1);
                    var dot2 = box_to_sphere.dot(ns2);
                    if (dot1 < h1 && dot1 > -h1 && dot2 < h2 && dot2 > -h2)
                    {
                        var dist = Math.abs(dot - h - R);
                        if (side_distance === null || dist < side_distance)
                        {
                            side_distance = dist;
                            side_dot1 = dot1;
                            side_dot2 = dot2;
                            side_h = h;
                            side_ns.copy(ns);
                            side_ns1.copy(ns1);
                            side_ns2.copy(ns2);
                            side_penetrations++;

                            if (justTest)
                            {
                                return true;
                            }
                        }
                    }
                }
            }
            if (side_penetrations)
            {
                found = true;
                var r = this.createContactEquation(bi, bj, si, sj, rsi, rsj);
                side_ns.scaleNumberTo(-R, r.ri); // Sphere r
                r.ni.copy(side_ns);
                r.ni.negateTo(r.ni); // Normal should be out of sphere
                side_ns.scaleNumberTo(side_h, side_ns);
                side_ns1.scaleNumberTo(side_dot1, side_ns1);
                side_ns.addTo(side_ns1, side_ns);
                side_ns2.scaleNumberTo(side_dot2, side_ns2);
                side_ns.addTo(side_ns2, r.rj);

                // Make relative to bodies
                r.ri.addTo(xi, r.ri);
                r.ri.subTo(bi.position, r.ri);
                r.rj.addTo(xj, r.rj);
                r.rj.subTo(bj.position, r.rj);

                this.result.push(r);
                this.createFrictionEquationsFromContact(r, this.frictionResult);
            }

            // Check corners
            var rj = new feng3d.Vector3();
            var sphere_to_corner = new feng3d.Vector3();
            for (var j = 0; j !== 2 && !found; j++)
            {
                for (var k = 0; k !== 2 && !found; k++)
                {
                    for (var l = 0; l !== 2 && !found; l++)
                    {
                        rj.init(0, 0, 0);
                        if (j)
                        {
                            rj.addTo(sides[0], rj);
                        } else
                        {
                            rj.subTo(sides[0], rj);
                        }
                        if (k)
                        {
                            rj.addTo(sides[1], rj);
                        } else
                        {
                            rj.subTo(sides[1], rj);
                        }
                        if (l)
                        {
                            rj.addTo(sides[2], rj);
                        } else
                        {
                            rj.subTo(sides[2], rj);
                        }

                        // World position of corner
                        xj.addTo(rj, sphere_to_corner);
                        sphere_to_corner.subTo(xi, sphere_to_corner);

                        if (sphere_to_corner.lengthSquared < R * R)
                        {
                            if (justTest)
                            {
                                return true;
                            }
                            found = true;
                            var r = this.createContactEquation(bi, bj, si, sj, rsi, rsj);
                            r.ri.copy(sphere_to_corner);
                            r.ri.normalize();
                            r.ni.copy(r.ri);
                            r.ri.scaleNumberTo(R, r.ri);
                            r.rj.copy(rj);

                            // Make relative to bodies
                            r.ri.addTo(xi, r.ri);
                            r.ri.subTo(bi.position, r.ri);
                            r.rj.addTo(xj, r.rj);
                            r.rj.subTo(bj.position, r.rj);

                            this.result.push(r);
                            this.createFrictionEquationsFromContact(r, this.frictionResult);
                        }
                    }
                }
            }

            // Check edges
            var edgeTangent = new feng3d.Vector3();
            var edgeCenter = new feng3d.Vector3();
            var r_vec3 = new feng3d.Vector3(); // r = edge center to sphere center
            var orthogonal = new feng3d.Vector3();
            var dist1 = new feng3d.Vector3();
            var Nsides = sides.length;
            for (var j = 0; j !== Nsides && !found; j++)
            {
                for (var k = 0; k !== Nsides && !found; k++)
                {
                    if (j % 3 !== k % 3)
                    {
                        // Get edge tangent
                        sides[k].crossTo(sides[j], edgeTangent);
                        edgeTangent.normalize();
                        sides[j].addTo(sides[k], edgeCenter);
                        r_vec3.copy(xi);
                        r_vec3.subTo(edgeCenter, r_vec3);
                        r_vec3.subTo(xj, r_vec3);
                        var orthonorm = r_vec3.dot(edgeTangent); // distance from edge center to sphere center in the tangent direction
                        edgeTangent.scaleNumberTo(orthonorm, orthogonal); // Vector from edge center to sphere center in the tangent direction

                        // Find the third side orthogonal to this one
                        var l = 0;
                        while (l === j % 3 || l === k % 3)
                        {
                            l++;
                        }

                        // vec from edge center to sphere projected to the plane orthogonal to the edge tangent
                        dist1.copy(xi);
                        dist1.subTo(orthogonal, dist1);
                        dist1.subTo(edgeCenter, dist1);
                        dist1.subTo(xj, dist1);

                        // Distances in tangent direction and distance in the plane orthogonal to it
                        var tdist = Math.abs(orthonorm);
                        var ndist = dist1.length;

                        if (tdist < sides[l].length && ndist < R)
                        {
                            if (justTest)
                            {
                                return true;
                            }
                            found = true;
                            var res = this.createContactEquation(bi, bj, si, sj, rsi, rsj);
                            edgeCenter.addTo(orthogonal, res.rj); // box rj
                            res.rj.copy(res.rj);
                            dist1.negateTo(res.ni);
                            res.ni.normalize();

                            res.ri.copy(res.rj);
                            res.ri.addTo(xj, res.ri);
                            res.ri.subTo(xi, res.ri);
                            res.ri.normalize();
                            res.ri.scaleNumberTo(R, res.ri);

                            // Make relative to bodies
                            res.ri.addTo(xi, res.ri);
                            res.ri.subTo(bi.position, res.ri);
                            res.rj.addTo(xj, res.rj);
                            res.rj.subTo(bj.position, res.rj);

                            this.result.push(res);
                            this.createFrictionEquationsFromContact(res, this.frictionResult);
                        }
                    }
                }
            }
        }

        sphereConvex(si: Sphere, sj: ConvexPolyhedron, transformi: Transform, transformj: Transform, bi: Body, bj: Body, rsi: Shape, rsj: Shape, justTest: boolean)
        {
            var xi = transformi.position, xj = transformj.position, qj = transformj.quaternion;

            var normals = sj.faceNormals;
            var faces = sj.faces;
            var verts = sj.vertices;
            var R = si.radius;

            // Check corners
            for (var i = 0; i !== verts.length; i++)
            {
                var v = <feng3d.Vector3>verts[i];

                // World position of corner
                var worldCorner = new feng3d.Vector3();
                qj.rotatePoint(v, worldCorner);
                xj.addTo(worldCorner, worldCorner);
                var sphere_to_corner = new feng3d.Vector3();
                worldCorner.subTo(xi, sphere_to_corner);
                if (sphere_to_corner.lengthSquared < R * R)
                {
                    if (justTest)
                    {
                        return true;
                    }
                    found = true;
                    var r = this.createContactEquation(bi, bj, si, sj, rsi, rsj);
                    r.ri.copy(sphere_to_corner);
                    r.ri.normalize();
                    r.ni.copy(r.ri);
                    r.ri.scaleNumberTo(R, r.ri);
                    worldCorner.subTo(xj, r.rj);

                    // Should be relative to the body.
                    r.ri.addTo(xi, r.ri);
                    r.ri.subTo(bi.position, r.ri);

                    // Should be relative to the body.
                    r.rj.addTo(xj, r.rj);
                    r.rj.subTo(bj.position, r.rj);

                    this.result.push(r);
                    this.createFrictionEquationsFromContact(r, this.frictionResult);
                    return;
                }
            }

            // Check side (plane) intersections
            var found = false;
            for (var i = 0, nfaces = faces.length; i !== nfaces && found === false; i++)
            {
                var normal = normals[i];
                var face = faces[i];

                // Get world-transformed normal of the face
                var worldNormal = new feng3d.Vector3();
                qj.rotatePoint(normal, worldNormal);

                // Get a world vertex from the face
                var worldPoint = new feng3d.Vector3();
                qj.rotatePoint(<feng3d.Vector3>verts[face[0]], worldPoint);
                worldPoint.addTo(xj, worldPoint);

                // Get a point on the sphere, closest to the face normal
                var worldSpherePointClosestToPlane = new feng3d.Vector3();
                worldNormal.scaleNumberTo(-R, worldSpherePointClosestToPlane);
                xi.addTo(worldSpherePointClosestToPlane, worldSpherePointClosestToPlane);

                // Vector from a face point to the closest point on the sphere
                var penetrationVec = new feng3d.Vector3();
                worldSpherePointClosestToPlane.subTo(worldPoint, penetrationVec);

                // The penetration. Negative value means overlap.
                var penetration = penetrationVec.dot(worldNormal);

                var worldPointToSphere = new feng3d.Vector3();
                xi.subTo(worldPoint, worldPointToSphere);

                if (penetration < 0 && worldPointToSphere.dot(worldNormal) > 0)
                {
                    // Intersects plane. Now check if the sphere is inside the face polygon
                    var faceVerts = []; // Face vertices, in world coords
                    for (var j = 0, Nverts = face.length; j !== Nverts; j++)
                    {
                        var worldVertex = new feng3d.Vector3();
                        qj.rotatePoint(<feng3d.Vector3>verts[face[j]], worldVertex);
                        xj.addTo(worldVertex, worldVertex);
                        faceVerts.push(worldVertex);
                    }

                    if (pointInPolygon(faceVerts, worldNormal, xi))
                    { // Is the sphere center in the face polygon?
                        if (justTest)
                        {
                            return true;
                        }
                        found = true;
                        var r = this.createContactEquation(bi, bj, si, sj, rsi, rsj);

                        worldNormal.scaleNumberTo(-R, r.ri); // Contact offset, from sphere center to contact
                        worldNormal.negateTo(r.ni); // Normal pointing out of sphere

                        var penetrationVec2 = new feng3d.Vector3();
                        worldNormal.scaleNumberTo(-penetration, penetrationVec2);
                        var penetrationSpherePoint = new feng3d.Vector3();
                        worldNormal.scaleNumberTo(-R, penetrationSpherePoint);

                        //xi.subTo(xj).addTo(penetrationSpherePoint).addTo(penetrationVec2 , r.rj);
                        xi.subTo(xj, r.rj);
                        r.rj.addTo(penetrationSpherePoint, r.rj);
                        r.rj.addTo(penetrationVec2, r.rj);

                        // Should be relative to the body.
                        r.rj.addTo(xj, r.rj);
                        r.rj.subTo(bj.position, r.rj);

                        // Should be relative to the body.
                        r.ri.addTo(xi, r.ri);
                        r.ri.subTo(bi.position, r.ri);

                        this.result.push(r);
                        this.createFrictionEquationsFromContact(r, this.frictionResult);

                        return; // We only expect *one* face contact
                    } else
                    {
                        // Edge?
                        for (var j = 0; j !== face.length; j++)
                        {

                            // Get two world transformed vertices
                            var v1 = new feng3d.Vector3();
                            var v2 = new feng3d.Vector3();
                            qj.rotatePoint(<feng3d.Vector3>verts[face[(j + 1) % face.length]], v1);
                            qj.rotatePoint(<feng3d.Vector3>verts[face[(j + 2) % face.length]], v2);
                            xj.addTo(v1, v1);
                            xj.addTo(v2, v2);

                            // Construct edge vector
                            var edge = new feng3d.Vector3();
                            v2.subTo(v1, edge);

                            // Construct the same vector, but normalized
                            var edgeUnit = new feng3d.Vector3();
                            edge.unit(edgeUnit);

                            // p is xi projected onto the edge
                            var p = new feng3d.Vector3();
                            var v1_to_xi = new feng3d.Vector3();
                            xi.subTo(v1, v1_to_xi);
                            var dot = v1_to_xi.dot(edgeUnit);
                            edgeUnit.scaleNumberTo(dot, p);
                            p.addTo(v1, p);

                            // Compute a vector from p to the center of the sphere
                            var xi_to_p = new feng3d.Vector3();
                            p.subTo(xi, xi_to_p);

                            // Collision if the edge-sphere distance is less than the radius
                            // AND if p is in between v1 and v2
                            if (dot > 0 && dot * dot < edge.lengthSquared && xi_to_p.lengthSquared < R * R)
                            { // Collision if the edge-sphere distance is less than the radius
                                // Edge contact!
                                if (justTest)
                                {
                                    return true;
                                }
                                var r = this.createContactEquation(bi, bj, si, sj, rsi, rsj);
                                p.subTo(xj, r.rj);

                                p.subTo(xi, r.ni);
                                r.ni.normalize();

                                r.ni.scaleNumberTo(R, r.ri);

                                // Should be relative to the body.
                                r.rj.addTo(xj, r.rj);
                                r.rj.subTo(bj.position, r.rj);

                                // Should be relative to the body.
                                r.ri.addTo(xi, r.ri);
                                r.ri.subTo(bi.position, r.ri);

                                this.result.push(r);
                                this.createFrictionEquationsFromContact(r, this.frictionResult);
                                return;
                            }
                        }
                    }
                }
            }
        }

        planeBox(si: Plane, sj: Box, transformi: Transform, transformj: Transform, bi: Body, bj: Body, rsi: Shape, rsj: Shape, justTest: boolean)
        {
            sj.material = sj.material;
            sj.collisionResponse = sj.collisionResponse;
            sj.id = sj.id;
            return this.planeConvex(si, sj, transformi, transformj, bi, bj, si, sj, justTest);
        }

        planeConvex(
            planeShape: Plane,
            convexShape: ConvexPolyhedron,
            planeTransform: Transform,
            convexTransform: Transform,
            planeBody: Body,
            convexBody: Body,
            si: Shape,
            sj: Shape,
            justTest: boolean
        )
        {
            var planePosition = planeTransform.position,
                convexPosition = convexTransform.position,
                planeQuat = planeTransform.quaternion,
                convexQuat = convexTransform.quaternion;

            // Simply return the points behind the plane.
            var worldVertex = new feng3d.Vector3(),
                worldNormal = new feng3d.Vector3(0, 1, 0);
            planeQuat.rotatePoint(worldNormal, worldNormal); // Turn normal according to plane orientation

            var numContacts = 0;
            var relpos = new feng3d.Vector3();
            for (var i = 0; i !== convexShape.vertices.length; i++)
            {
                // Get world convex vertex
                worldVertex.copy(convexShape.vertices[i]);
                convexQuat.rotatePoint(worldVertex, worldVertex);
                convexPosition.addTo(worldVertex, worldVertex);
                worldVertex.subTo(planePosition, relpos);

                var dot = worldNormal.dot(relpos);
                if (dot <= 0.0)
                {
                    if (justTest)
                    {
                        return true;
                    }

                    var r = this.createContactEquation(planeBody, convexBody, planeShape, convexShape, si, sj);

                    // Get vertex position projected on plane
                    var projected = new feng3d.Vector3();
                    worldNormal.scaleNumberTo(worldNormal.dot(relpos), projected);
                    worldVertex.subTo(projected, projected);
                    projected.subTo(planePosition, r.ri); // From plane to vertex projected on plane

                    r.ni.copy(worldNormal); // Contact normal is the plane normal out from plane

                    // rj is now just the vector from the convex center to the vertex
                    worldVertex.subTo(convexPosition, r.rj);

                    // Make it relative to the body
                    r.ri.addTo(planePosition, r.ri);
                    r.ri.subTo(planeBody.position, r.ri);
                    r.rj.addTo(convexPosition, r.rj);
                    r.rj.subTo(convexBody.position, r.rj);

                    this.result.push(r);
                    numContacts++;
                    if (!this.enableFrictionReduction)
                    {
                        this.createFrictionEquationsFromContact(r, this.frictionResult);
                    }
                }
            }

            if (this.enableFrictionReduction && numContacts)
            {
                this.createFrictionFromAverage(numContacts);
            }
        }

        convexConvex(si: ConvexPolyhedron, sj: ConvexPolyhedron, transformi: Transform, transformj: Transform, bi: Body, bj: Body, rsi: Shape, rsj: Shape, justTest: boolean, faceListA?: any[], faceListB?: any[])
        {
            var xi = transformi.position, xj = transformj.position, qi = transformi.quaternion, qj = transformj.quaternion;
            var sepAxis = new feng3d.Vector3();

            if (xi.distance(xj) > si.boundingSphereRadius + sj.boundingSphereRadius)
            {
                return;
            }

            if (si.findSeparatingAxis(sj, transformi, transformj, sepAxis, faceListA, faceListB))
            {
                var res: { point: feng3d.Vector3; normal: feng3d.Vector3; depth: number; }[] = [];
                var q = new feng3d.Vector3();
                si.clipAgainstHull(xi, qi, sj, xj, qj, sepAxis, -100, 100, res);
                var numContacts = 0;
                for (var j = 0; j !== res.length; j++)
                {
                    if (justTest)
                    {
                        return true;
                    }
                    var r = this.createContactEquation(bi, bj, si, sj, rsi, rsj),
                        ri = r.ri,
                        rj = r.rj;
                    sepAxis.negateTo(r.ni);
                    res[j].normal.negateTo(q);
                    q.multiplyNumberTo(res[j].depth, q);
                    res[j].point.addTo(q, ri);
                    rj.copy(res[j].point);

                    // Contact points are in world coordinates. Transform back to relative
                    ri.subTo(xi, ri);
                    rj.subTo(xj, rj);

                    // Make relative to bodies
                    ri.addTo(xi, ri);
                    ri.subTo(bi.position, ri);
                    rj.addTo(xj, rj);
                    rj.subTo(bj.position, rj);

                    this.result.push(r);
                    numContacts++;
                    if (!this.enableFrictionReduction)
                    {
                        this.createFrictionEquationsFromContact(r, this.frictionResult);
                    }
                }
                if (this.enableFrictionReduction && numContacts)
                {
                    this.createFrictionFromAverage(numContacts);
                }
            }
        }

        planeParticle(sj: Plane, si: Particle, xj: feng3d.Vector3, xi: feng3d.Vector3, qj: feng3d.Quaternion, qi: feng3d.Quaternion, bj: Body, bi: Body, rsi: Shape, rsj: Shape, justTest: boolean)
        {
            var normal = new feng3d.Vector3();
            normal.init(0, 1, 0);
            bj.quaternion.rotatePoint(normal, normal); // Turn normal according to plane orientation
            var relpos = new feng3d.Vector3();
            xi.subTo(bj.position, relpos);
            var dot = normal.dot(relpos);
            if (dot <= 0.0)
            {
                if (justTest)
                {
                    return true;
                }

                var r = this.createContactEquation(bi, bj, si, sj, rsi, rsj);
                r.ni.copy(normal); // Contact normal is the plane normal
                r.ni.negateTo(r.ni);
                r.ri.init(0, 0, 0); // Center of particle

                // Get particle position projected on plane
                var projected = new feng3d.Vector3();
                normal.scaleNumberTo(normal.dot(xi), projected);
                xi.subTo(projected, projected);
                //projected.addTo(bj.position,projected);

                // rj is now the projected world position minus plane position
                r.rj.copy(projected);
                this.result.push(r);
                this.createFrictionEquationsFromContact(r, this.frictionResult);
            }
        }

        sphereParticle(sj: Shape, si: Shape, xj: feng3d.Vector3, xi: feng3d.Vector3, qj: feng3d.Quaternion, qi: feng3d.Quaternion, bj: Body, bi: Body, rsi: Shape, rsj: Shape, justTest: boolean)
        {
            // The normal is the unit vector from sphere center to particle center
            var normal = new feng3d.Vector3(0, 1, 0);
            xi.subTo(xj, normal);
            var lengthSquared = normal.lengthSquared;

            if (lengthSquared <= sj.radius * sj.radius)
            {
                if (justTest)
                {
                    return true;
                }
                var r = this.createContactEquation(bi, bj, si, sj, rsi, rsj);
                normal.normalize();
                r.rj.copy(normal);
                r.rj.scaleNumberTo(sj.radius, r.rj);
                r.ni.copy(normal); // Contact normal
                r.ni.negateTo(r.ni);
                r.ri.init(0, 0, 0); // Center of particle
                this.result.push(r);
                this.createFrictionEquationsFromContact(r, this.frictionResult);
            }
        }

        convexParticle(sj: ConvexPolyhedron, si: Particle, transformi: Transform, transformj: Transform, bj: Body, bi: Body, rsi: Shape, rsj: Shape, justTest: boolean)
        {
            var xj = transformi.position, xi = transformj.position, qj = transformi.quaternion, qi = transformj.quaternion;

            var penetratedFaceIndex = -1;
            var penetratedFaceNormal = new feng3d.Vector3();
            var worldPenetrationVec = new feng3d.Vector3();
            var minPenetration = null;

            // Convert particle position xi to local coords in the convex
            var local = new feng3d.Vector3();
            local.copy(xi);
            local.subTo(xj, local); // Convert position to relative the convex origin
            var cqj = qj.inverseTo();
            cqj.rotatePoint(local, local);

            if (sj.pointIsInside(local))
            {
                if (sj.worldVerticesNeedsUpdate)
                {
                    sj.computeWorldVertices(xj, qj);
                }
                if (sj.worldFaceNormalsNeedsUpdate)
                {
                    sj.computeWorldFaceNormals(qj);
                }

                // For each world polygon in the polyhedra
                for (var i = 0, nfaces = sj.faces.length; i !== nfaces; i++)
                {
                    // Construct world face vertices
                    var verts = [sj.worldVertices[sj.faces[i][0]]];
                    var normal = sj.worldFaceNormals[i];

                    // Check how much the particle penetrates the polygon plane.
                    var convexParticle_vertexToParticle = xi.subTo(verts[0]);
                    var penetration = -normal.dot(convexParticle_vertexToParticle);
                    if (minPenetration === null || Math.abs(penetration) < Math.abs(minPenetration))
                    {
                        if (justTest)
                        {
                            return true;
                        }

                        minPenetration = penetration;
                        penetratedFaceIndex = i;
                        penetratedFaceNormal.copy(normal);
                    }
                }

                if (penetratedFaceIndex !== -1)
                {
                    // Setup contact
                    var r = this.createContactEquation(bi, bj, si, sj, rsi, rsj);
                    penetratedFaceNormal.multiplyTo(minPenetration, worldPenetrationVec);

                    // rj is the particle position projected to the face
                    worldPenetrationVec.addTo(xi, worldPenetrationVec);
                    worldPenetrationVec.subTo(xj, worldPenetrationVec);
                    r.rj.copy(worldPenetrationVec);

                    penetratedFaceNormal.negateTo(r.ni); // Contact normal
                    r.ri.init(0, 0, 0); // Center of particle

                    var ri = r.ri,
                        rj = r.rj;

                    // Make relative to bodies
                    ri.addTo(xi, ri);
                    ri.subTo(bi.position, ri);
                    rj.addTo(xj, rj);
                    rj.subTo(bj.position, rj);

                    this.result.push(r);
                    this.createFrictionEquationsFromContact(r, this.frictionResult);
                } else
                {
                    console.warn("Point found inside convex, but did not find penetrating face!");
                }
            }
        }

        boxHeightfield(si: Box, sj: Heightfield, transformi: Transform, transformj: Transform, bi: Body, bj: Body, rsi: Shape, rsj: Shape, justTest: boolean)
        {
            si.material = si.material;
            si.collisionResponse = si.collisionResponse;
            return this.convexHeightfield(si, sj, transformi, transformj, bi, bj, si, sj, justTest);
        }

        convexHeightfield(
            convexShape: ConvexPolyhedron,
            hfShape: Heightfield,
            convexTransform: Transform,
            hfTransform: Transform,
            convexBody: Body,
            hfBody: Body,
            rsi: Shape,
            rsj: Shape,
            justTest: boolean
        )
        {
            var convexPos = convexTransform.position;
            var hfQuat = hfTransform.quaternion

            var data = hfShape.data,
                w = hfShape.elementSize,
                radius = convexShape.boundingSphereRadius,
                worldPillarOffset = new feng3d.Vector3(),
                faceList = [0];

            // Get sphere position to heightfield local!
            var localConvexPos = new feng3d.Vector3();
            hfTransform.pointToLocalFrame(convexPos, localConvexPos);

            // Get the index of the data points to test against
            var iMinX = Math.floor((localConvexPos.x - radius) / w) - 1,
                iMaxX = Math.ceil((localConvexPos.x + radius) / w) + 1,
                iMinY = Math.floor((localConvexPos.y - radius) / w) - 1,
                iMaxY = Math.ceil((localConvexPos.y + radius) / w) + 1;

            // Bail out if we are out of the terrain
            if (iMaxX < 0 || iMaxY < 0 || iMinX > data.length || iMinY > data[0].length)
            {
                return;
            }

            // Clamp index to edges
            if (iMinX < 0) { iMinX = 0; }
            if (iMaxX < 0) { iMaxX = 0; }
            if (iMinY < 0) { iMinY = 0; }
            if (iMaxY < 0) { iMaxY = 0; }
            if (iMinX >= data.length) { iMinX = data.length - 1; }
            if (iMaxX >= data.length) { iMaxX = data.length - 1; }
            if (iMaxY >= data[0].length) { iMaxY = data[0].length - 1; }
            if (iMinY >= data[0].length) { iMinY = data[0].length - 1; }

            var minMax = [];
            hfShape.getRectMinMax(iMinX, iMinY, iMaxX, iMaxY, minMax);
            var min = minMax[0];
            var max = minMax[1];

            // Bail out if we're cant touch the bounding height box
            if (localConvexPos.z - radius > max || localConvexPos.z + radius < min)
            {
                return;
            }

            for (var i = iMinX; i < iMaxX; i++)
            {
                for (var j = iMinY; j < iMaxY; j++)
                {

                    var intersecting = false;

                    // Lower triangle
                    hfShape.getConvexTrianglePillar(i, j, false);
                    hfTransform.pointToWorldFrame(hfShape.pillarOffset, worldPillarOffset);
                    if (convexPos.distance(worldPillarOffset) < hfShape.pillarConvex.boundingSphereRadius + convexShape.boundingSphereRadius)
                    {
                        intersecting = this.convexConvex(convexShape, hfShape.pillarConvex, convexTransform, new Transform(worldPillarOffset, hfQuat), convexBody, hfBody, null, null, justTest, faceList, null);
                    }

                    if (justTest && intersecting)
                    {
                        return true;
                    }

                    // Upper triangle
                    hfShape.getConvexTrianglePillar(i, j, true);
                    hfTransform.pointToWorldFrame(hfShape.pillarOffset, worldPillarOffset);
                    if (convexPos.distance(worldPillarOffset) < hfShape.pillarConvex.boundingSphereRadius + convexShape.boundingSphereRadius)
                    {
                        intersecting = this.convexConvex(convexShape, hfShape.pillarConvex, convexTransform, new Transform(worldPillarOffset, hfQuat), convexBody, hfBody, null, null, justTest, faceList, null);
                    }

                    if (justTest && intersecting)
                    {
                        return true;
                    }
                }
            }
        }

        sphereHeightfield(
            sphereShape: Sphere,
            hfShape: Heightfield,
            sphereTransform: Transform,
            hfTransform: Transform,
            sphereBody: Body,
            hfBody: Body,
            rsi: Shape,
            rsj: Shape,
            justTest: boolean
        )
        {
            var data = hfShape.data,
                radius = sphereShape.radius,
                w = hfShape.elementSize,
                worldPillarOffset = new feng3d.Vector3();
            var spherePos = sphereTransform.position;
            var hfQuat = hfTransform.quaternion;

            // Get sphere position to heightfield local!
            var localSpherePos = new feng3d.Vector3();
            hfTransform.pointToLocalFrame(spherePos, localSpherePos);

            // Get the index of the data points to test against
            var iMinX = Math.floor((localSpherePos.x - radius) / w) - 1,
                iMaxX = Math.ceil((localSpherePos.x + radius) / w) + 1,
                iMinY = Math.floor((localSpherePos.y - radius) / w) - 1,
                iMaxY = Math.ceil((localSpherePos.y + radius) / w) + 1;

            // Bail out if we are out of the terrain
            if (iMaxX < 0 || iMaxY < 0 || iMinX > data.length || iMaxY > data[0].length)
            {
                return;
            }

            // Clamp index to edges
            if (iMinX < 0) { iMinX = 0; }
            if (iMaxX < 0) { iMaxX = 0; }
            if (iMinY < 0) { iMinY = 0; }
            if (iMaxY < 0) { iMaxY = 0; }
            if (iMinX >= data.length) { iMinX = data.length - 1; }
            if (iMaxX >= data.length) { iMaxX = data.length - 1; }
            if (iMaxY >= data[0].length) { iMaxY = data[0].length - 1; }
            if (iMinY >= data[0].length) { iMinY = data[0].length - 1; }

            var minMax = [];
            hfShape.getRectMinMax(iMinX, iMinY, iMaxX, iMaxY, minMax);
            var min = minMax[0];
            var max = minMax[1];

            // Bail out if we're cant touch the bounding height box
            if (localSpherePos.z - radius > max || localSpherePos.z + radius < min)
            {
                return;
            }

            var result = this.result;
            for (var i = iMinX; i < iMaxX; i++)
            {
                for (var j = iMinY; j < iMaxY; j++)
                {

                    var numContactsBefore = result.length;

                    var intersecting = false;

                    // Lower triangle
                    hfShape.getConvexTrianglePillar(i, j, false);
                    hfTransform.pointToWorldFrame(hfShape.pillarOffset, worldPillarOffset);
                    if (spherePos.distance(worldPillarOffset) < hfShape.pillarConvex.boundingSphereRadius + sphereShape.boundingSphereRadius)
                    {
                        intersecting = this.sphereConvex(sphereShape, hfShape.pillarConvex, sphereTransform, new Transform(worldPillarOffset, hfQuat), sphereBody, hfBody, sphereShape, hfShape, justTest);
                    }

                    if (justTest && intersecting)
                    {
                        return true;
                    }

                    // Upper triangle
                    hfShape.getConvexTrianglePillar(i, j, true);
                    hfTransform.pointToWorldFrame(hfShape.pillarOffset, worldPillarOffset);
                    if (spherePos.distance(worldPillarOffset) < hfShape.pillarConvex.boundingSphereRadius + sphereShape.boundingSphereRadius)
                    {
                        intersecting = this.sphereConvex(sphereShape, hfShape.pillarConvex, sphereTransform, new Transform(worldPillarOffset, hfQuat), sphereBody, hfBody, sphereShape, hfShape, justTest);
                    }

                    if (justTest && intersecting)
                    {
                        return true;
                    }

                    var numContacts = result.length - numContactsBefore;

                    if (numContacts > 2)
                    {
                        return;
                    }
                }
            }
        }
    }

    // See http://bulletphysics.com/Bullet/BulletFull/SphereTriangleDetector_8cpp_source.html
    function pointInPolygon(verts: feng3d.Vector3[], normal: feng3d.Vector3, p: feng3d.Vector3)
    {
        var positiveResult = null;
        var N = verts.length;
        var edge = new feng3d.Vector3();
        var edge_x_normal = new feng3d.Vector3();
        var vertex_to_p = new feng3d.Vector3();

        for (var i = 0; i !== N; i++)
        {
            var v = verts[i];

            // Get edge to the next vertex
            verts[(i + 1) % (N)].subTo(v, edge);

            // Get cross product between polygon normal and the edge
            edge.crossTo(normal, edge_x_normal);

            // Get vector between point and current vertex
            p.subTo(v, vertex_to_p);

            // This dot product determines which side of the edge the point is
            var r = edge_x_normal.dot(vertex_to_p);

            // If all such dot products have same sign, we are inside the polygon.
            if (positiveResult === null || (r > 0 && positiveResult === true) || (r <= 0 && positiveResult === false))
            {
                if (positiveResult === null)
                {
                    positiveResult = r > 0;
                }
                continue;
            } else
            {
                return false; // Encountered some other sign. Exit.
            }
        }

        // If we got here, all dot products were of the same sign.
        return true;
    }

    Narrowphase.prototype[ShapeType.BOX | ShapeType.BOX] = Narrowphase.prototype.boxBox;
    Narrowphase.prototype[ShapeType.BOX | ShapeType.CONVEXPOLYHEDRON] = Narrowphase.prototype.boxConvex;
    Narrowphase.prototype[ShapeType.BOX | ShapeType.PARTICLE] = Narrowphase.prototype.boxParticle;
    Narrowphase.prototype[ShapeType.SPHERE] = Narrowphase.prototype.sphereSphere;
    Narrowphase.prototype[ShapeType.PLANE | ShapeType.TRIMESH] = Narrowphase.prototype.planeTrimesh;
    Narrowphase.prototype[ShapeType.SPHERE | ShapeType.TRIMESH] = Narrowphase.prototype.sphereTrimesh;

    Narrowphase.prototype[ShapeType.SPHERE | ShapeType.PLANE] = Narrowphase.prototype.spherePlane;

    Narrowphase.prototype[ShapeType.SPHERE | ShapeType.BOX] = Narrowphase.prototype.sphereBox;
    Narrowphase.prototype[ShapeType.SPHERE | ShapeType.CONVEXPOLYHEDRON] = Narrowphase.prototype.sphereConvex;

    Narrowphase.prototype[ShapeType.PLANE | ShapeType.BOX] = Narrowphase.prototype.planeBox;

    Narrowphase.prototype[ShapeType.PLANE | ShapeType.CONVEXPOLYHEDRON] = Narrowphase.prototype.planeConvex;

    Narrowphase.prototype[ShapeType.CONVEXPOLYHEDRON] = Narrowphase.prototype.convexConvex;

    Narrowphase.prototype[ShapeType.PLANE | ShapeType.PARTICLE] = Narrowphase.prototype.planeParticle;

    Narrowphase.prototype[ShapeType.PARTICLE | ShapeType.SPHERE] = Narrowphase.prototype.sphereParticle;

    Narrowphase.prototype[ShapeType.PARTICLE | ShapeType.CONVEXPOLYHEDRON] = Narrowphase.prototype.convexParticle;

    Narrowphase.prototype[ShapeType.BOX | ShapeType.HEIGHTFIELD] = Narrowphase.prototype.boxHeightfield;
    Narrowphase.prototype[ShapeType.SPHERE | ShapeType.HEIGHTFIELD] = Narrowphase.prototype.sphereHeightfield;

    Narrowphase.prototype[ShapeType.CONVEXPOLYHEDRON | ShapeType.HEIGHTFIELD] = Narrowphase.prototype.convexHeightfield;


}