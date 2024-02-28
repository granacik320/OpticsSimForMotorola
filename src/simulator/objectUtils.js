const objectUtils = {
    /**
     * Creates point object
     * @method point
     * @param x
     * @param y
     * @returns {{x, y, type: string}}
     */
    point: (x, y) => { return { type: 'point', x, y }},

    /**
     * Creates ray object
     * @method ray
     * @param p1
     * @param p2
     * @param dir
     * @returns {{p1, p2, type: string, dir}}
     */
    ray: (p1, p2, dir) => { return { type: 'ray', p1, p2, dir}},

    /**
     * Creates line object
     * @method line
     * @param p1
     * @param p2
     * @returns {{p1, p2, type: string}}
     */
    line: (p1, p2) => { return { type: 'line', p1, p2 }},

    /**
     * Creates circle object
     * @method circle
     * @param p1
     * @param p2
     * @returns {{p1, p2, type: string}}
     */
    circle: (p1, p2) => { return { type: 'circle', p1, p2 }},

    /**
     * Creates cluster object
     * @method cluster
     * @param ray
     * @returns {{path: *[], type: string}}
     */
    cluster: (ray) => { return { type: 'cluster', path: [ray] }},


    /**
     * Calculates squared length
     * @method squaredLength
     * @param p1
     * @param p2
     * @returns {number}
     */
    squaredLength: (p1, p2) => {
        return Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)
    },

    /**
     * Calculates length
     * @method length
     * @param p1
     * @param p2
     * @returns {number}
     */
    length: (p1, p2) => {
        return Math.sqrt(objectUtils.squaredLength(p1, p2))
    },

    /**
     * Calculates center
     * @method center
     * @param p1
     * @param p2
     * @returns {{x, y, type: string}}
     */
    center: (p1, p2) => {
        return objectUtils.point((p1.x + p2.x) / 2, (p1.y + p2.y) / 2)
    },

    /**
     * Calculates intersection
     * @method intersection
     * @param obj
     * @param obj2
     * @returns {{x, y, type: string}|{p1: {x, y, type: string}, p2: {x, y, type: string}}}
     */
    intersection: function (obj, obj2) {
        if (obj.type === 'line' && obj2.type === 'ray') {
            return this.intersection_ray_line(obj, obj2);
        } else if (obj.type === 'circle') {
            return this.intersection_line_circle(obj, obj2);
        }else if (obj.type === 'line' && obj2.type === 'line') {
            return this.intersection_2line(obj, obj2);
        }
    },

    /**
     * Calculates intersection
     * @method intersection_ray_line
     * @param line
     * @param ray
     * @returns {{x, y, type: string}|null}
     */
    intersection_ray_line: (line, ray) => {
        const x4 = ray.p1.x + ray.dir.x
        const y4 = ray.p1.y + ray.dir.y

        const den = (line.p1.x - line.p2.x) * (ray.p1.y - y4) - (line.p1.y - line.p2.y) * (ray.p1.x - x4)

        if (den === 0) return null;

        const t = ((line.p1.x - ray.p1.x) * (ray.p1.y - y4) - (line.p1.y - ray.p1.y) * (ray.p1.x - x4)) / den
        const u = -((line.p1.x - line.p2.x) * (line.p1.y - ray.p1.y) - (line.p1.y - line.p2.y) * (line.p1.x - ray.p1.x)) / den

        if (t > 0 && t < 1 && u > 0) {
            return objectUtils.point(line.p1.x + t * (line.p2.x - line.p1.x), line.p1.y + t * (line.p2.y - line.p1.y))
        }else{
            return null;
        }
    },

    /**
     * Calculates intersection
     * @method intersection_2line
     * @param line
     * @param line2
     * @returns {{x, y, type: string}|null}
     */
    intersection_2line: (line, line2) => {

        const den = (line.p1.x - line.p2.x) * (line2.p1.y - line2.p2.y) - (line.p1.y - line.p2.y) * (line2.p1.x - line2.p2.x)

        if (den === 0) return null;

        const t = ((line.p1.x - line2.p1.x) * (line2.p1.y - line2.p2.y) - (line.p1.y - line2.p1.y) * (line2.p1.x - line2.p2.x)) / den

        return objectUtils.point(line.p1.x + t * (line.p2.x - line.p1.x), line.p1.y + t * (line.p2.y - line.p1.y))
    },

    /**
     * Calculates intersection
     * @method intersection_line_circle
     * @param line
     * @param ray
     * @returns {{p1: {x, y, type: string}, p2: {x, y, type: string}}|null}
     */
    intersection_line_circle: (line, ray) => {
        const xa = ray.dir.x
        const ya = ray.dir.y
        const cx = line.p1.x;
        const cy = line.p1.y;
        const r_sq = objectUtils.squaredLength(line.p1,line.p2)

        const l = Math.sqrt(xa * xa + ya * ya);
        const ux = xa / l;
        const uy = ya / l;

        const cu = ((cx - ray.p1.x) * ux + (cy - ray.p1.y) * uy);
        const px = ray.p1.x + cu * ux;
        const py = ray.p1.y + cu * uy;

        const d = Math.sqrt(r_sq - (px - cx) * (px - cx) - (py - cy) * (py - cy));

        const p1 = objectUtils.point(px - ux * d, py - uy * d)
        const p2 = objectUtils.point(px + ux * d, py + uy * d)

        if(d){
            return {
                p1: p1,
                p2: p2,
            }
        }

        return null;
    },

    /**
     * Returns a Boolean value depending on point being on ray
     * @method is_on_ray
     * @param p
     * @param ray
     * @param gap
     * @returns {boolean}
     */
    is_on_ray: (p, ray, gap = 0) => {
        return (p.x - ray.p1.x) * ray.dir.x + (p.y - ray.p1.y) * ray.dir.y >= gap;
    },

    /**
     * Returns a Boolean value depending on point being on segment
     * @method is_on_line
     * @param p1
     * @param line
     * @returns {boolean}
     */
    is_on_line: (p1, line) => {
        if(p1 && line.p1 && line.p2) {
            return (p1.x - line.p1.x) * (line.p2.x - line.p1.x) + (p1.y - line.p1.y) * (line.p2.y - line.p1.y) >= 0 && (p1.x - line.p2.x) * (line.p1.x - line.p2.x) + (p1.y - line.p2.y) * (line.p1.y - line.p2.y) >= 0;
        }
    },

    /**
     * Returns a perpendicular bisector of a line
     * @method perpendicular_bisector
     * @param line
     * @returns {{p1, p2, type: string}}
     */
    perpendicular_bisector: function(line) {
        return objectUtils.line(
            objectUtils.point(
                (-line.p1.y + line.p2.y + line.p1.x + line.p2.x) * 0.5,
                (line.p1.x - line.p2.x + line.p1.y + line.p2.y) * 0.5
            ),
            objectUtils.point(
                (line.p1.y - line.p2.y + line.p1.x + line.p2.x) * 0.5,
                (-line.p1.x + line.p2.x + line.p1.y + line.p2.y) * 0.5
            )
        );
    },

    /**
     * Returns a normalized line with specified length
     * @method normalize
     * @param length
     * @param p1
     * @param p2
     * @returns {{x, y, type: string}}
     */
    normalize(length, p1, p2) {
        const dir = objectUtils.point(p2.x - p1.x, p2.y - p1.y)
        const wsp = length / objectUtils.length(p1, p2)

        return objectUtils.point(dir.x * wsp, dir.y * wsp)
    },

    /**
     * Returns a direction from angle
     * @method getDirFromAngle
     * @param angle
     * @returns {{x, y, type: string}}
     */
    getDirFromAngle(angle) {
        const radians = angle * (Math.PI / 180);

        return objectUtils.point(Math.cos(radians), Math.sin(radians));
    },


    /**
     * Returns a Boolean value depending on point being in object with path
     * @method testInPath
     * @param obj
     * @param p
     * @returns {boolean}
     */
    testInPath: (obj, p) => {
        const pointElements = [...obj.path]

        let cnt = 0;
        pointElements.push(pointElements[0])

        for (let i = 0; i < pointElements.length - 1; i++) {
            const [x1, y1] = [pointElements[i].p.x, pointElements[i].p.y];
            const [x2, y2] = [pointElements[i + 1].p.x, pointElements[i + 1].p.y];

            if ((p.y < y1) !== (p.y < y2) && p.x < x1 + ((p.y - y1) / (y2 - y1)) * (x2 - x1)) {
                cnt += 1;
            }
        }

        return cnt % 2 === 1;
    },
}

export default objectUtils;