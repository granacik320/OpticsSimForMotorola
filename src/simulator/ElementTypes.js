import objectUtils from "./objectUtils";

const elementsTypes = {}

elementsTypes['layoutDot'] = {
    draw: (ctx, pos, scale, testing = false) => {
        ctx.fillStyle = 'rgb(0,175,227)';
        ctx.beginPath();
        ctx.rect(pos.x - 5 / scale, pos.y - 5 / scale, 10 / scale, 10 / scale);

        if(testing){
            ctx.font = "18px serif";
            ctx.fillText(`${pos.x}, ${pos.y}`, pos.x, pos.y);
        }

        ctx.fill();
    }
}

elementsTypes['lineBased'] = {
    move: (obj, mouse, offset) => {
        const w = obj.p2.x - obj.p1.x;
        const h = obj.p2.y - obj.p1.y;

        obj.p1.x = mouse.x - offset.x;
        obj.p1.y = mouse.y - offset.y;

        obj.p2.x = mouse.x - offset.x + w;
        obj.p2.y = mouse.y - offset.y + h;
    },

    draw: (ctx, obj, scale = 1) =>  {
        ctx.strokeStyle = 'rgb(255,255,255)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(obj.p1.x, obj.p1.y);
        ctx.lineTo(obj.p2.x, obj.p2.y);
        ctx.stroke();

        if(obj.selected){
            elementsTypes['layoutDot'].draw(ctx, obj.p1, scale);
            elementsTypes['layoutDot'].draw(ctx, obj.p2, scale);
        }
    },

    resize: (obj, mouse, corner) => {
        if(corner === 'l'){
            obj.p1.x = mouse.x;
            obj.p1.y = mouse.y;
        }else{
            obj.p2.x = mouse.x;
            obj.p2.y = mouse.y;
        }
    },

    testClick: (obj, mouse, scale) => {
        const a = objectUtils.point(obj.p1.x, obj.p1.y);
        const b = objectUtils.point(obj.p2.x, obj.p2.y);
        const c = mouse;

        return elementsTypes['lineBased'].getNearestPoint(obj, mouse, scale) || Math.abs(objectUtils.length(a, b) - (objectUtils.length(a, c) + objectUtils.length(b, c))) < 1;
    },

    getNearestPoint: (obj, mouse, scale) => {
        const delta = 5 / scale;
        const { x, y } = mouse;

        if (obj.p1.x - delta < x && x < obj.p1.x + delta &&  obj.p1.y - delta < y && y < obj.p1.y + delta){
            return 'l'
        }else if (obj.p2.x - delta < x && x < obj.p2.x + delta &&  obj.p2.y - delta < y && y < obj.p2.y + delta){
            return 'r'
        }
    },

    rayIntersection: (obj, ray) => {
        return objectUtils.intersection(objectUtils.line(obj.p1, obj.p2), ray)
    },

    shot: (obj, ray, intersection) => {
        const rx = ray.p1.x - intersection.x;
        const ry = ray.p1.y - intersection.y;
        const mx = obj.p2.x - obj.p1.x;
        const my = obj.p2.y - obj.p1.y;

        const p2 = objectUtils.point(intersection.x + rx * (my * my - mx * mx) - 2 * ry * mx * my, intersection.y + ry * (mx * mx - my * my) - 2 * rx * mx * my);
        const ray2 = objectUtils.ray(intersection, p2, p2);
        ray2.brightness_p = ray.brightness_p;
        ray2.brightness_s = ray.brightness_s;
        ray2.wavelength = ray.wavelength;

        return [ray2]
    }
}

elementsTypes['mirrorline'] = {
    create: (mouse) => {
        return {type: 'mirrorline', p1: mouse, p2: mouse}
    },

    draw: elementsTypes['lineBased'].draw,

    move: elementsTypes['lineBased'].move,

    resize: elementsTypes['lineBased'].resize,

    testClick: elementsTypes['lineBased'].testClick,

    rayIntersection: elementsTypes['lineBased'].rayIntersection,

    shot: elementsTypes["lineBased"].shot
}

elementsTypes['voidline'] = {
    create: (mouse) => {
        return {type: 'voidline', p1: mouse, p2: mouse}
    },

    draw: (ctx, obj, scale = 1) =>  {
        ctx.strokeStyle = 'rgba(242, 133, 111, 1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(obj.p1.x, obj.p1.y);
        ctx.lineTo(obj.p2.x, obj.p2.y);
        ctx.stroke();

        if(obj.selected){
            elementsTypes['layoutDot'].draw(ctx, obj.p1, scale);
            elementsTypes['layoutDot'].draw(ctx, obj.p2, scale);
        }
    },

    move: elementsTypes['lineBased'].move,

    resize: elementsTypes['lineBased'].resize,

    testClick: elementsTypes['lineBased'].testClick,

    rayIntersection: elementsTypes['lineBased'].rayIntersection,
}

elementsTypes['rectangle'] = {
    create: (mouse) => {
        return {type: 'rectangle', p1: mouse, p2: mouse, properties: ["refractiveIndex", "cauchyCoeffient"], refractiveIndex: 1.5}
    },

    draw: (ctx, obj, scale = 1) => {
        obj.internalReflections = 0;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.rect(obj.p1.x, obj.p1.y, obj.p2.x - obj.p1.x, obj.p2.y - obj.p1.y);
        ctx.fill();

        if(obj.selected){
            elementsTypes['layoutDot'].draw(ctx, objectUtils.point(obj.p1.x, obj.p1.y), scale);
            elementsTypes['layoutDot'].draw(ctx, objectUtils.point(obj.p2.x, obj.p2.y), scale);
            elementsTypes['layoutDot'].draw(ctx, objectUtils.point(obj.p1.x, obj.p2.y), scale);
            elementsTypes['layoutDot'].draw(ctx, objectUtils.point(obj.p2.x, obj.p1.y), scale);
        }
    },

    move: elementsTypes['lineBased'].move,

    resize: (obj, mouse, corner) => {
        if(corner === 'lt'){
            obj.p1.x = mouse.x;
            obj.p1.y = mouse.y;
        }else if (corner === 'rb'){
            obj.p2.x = mouse.x;
            obj.p2.y = mouse.y;
        }else if (corner === 'lb') {
            obj.p1.x = mouse.x;
            obj.p2.y = mouse.y;
        }else{
            obj.p2.x = mouse.x;
            obj.p1.y = mouse.y;
        }
    },

    testClick: (obj, mouse, scale) => {
        return elementsTypes['rectangle'].getNearestPoint(obj, mouse, scale) || ( mouse.x >= Math.min(obj.p1.x, obj.p2.x) && mouse.x <= Math.max(obj.p1.x, obj.p2.x) && mouse.y >= Math.min(obj.p1.y, obj.p2.y) && mouse.y <= Math.max(obj.p1.y, obj.p2.y));
    },

    getNearestPoint: (obj, mouse, scale) => {
        const delta = 5 / scale;
        const { x, y } = mouse;

        if (obj.p1.x - delta < x && x < obj.p1.x + delta &&  obj.p1.y - delta < y && y < obj.p1.y + delta){
            return 'lt'
        }else if (obj.p2.x - delta < x && x < obj.p2.x + delta &&  obj.p2.y - delta < y && y < obj.p2.y + delta){
            return 'rb'
        }else if (obj.p1.x - delta < x && x < obj.p1.x + delta &&  obj.p2.y - delta < y && y < obj.p2.y + delta){
            return 'lb'
        }else if (obj.p2.x - delta < x && x < obj.p2.x + delta &&  obj.p1.y - delta < y && y < obj.p1.y + delta){
            return 'rt'
        }
    },

    rayIntersection: (obj, ray) => {
        const DC = objectUtils.line(obj.p1, objectUtils.point(obj.p2.x, obj.p1.y));
        const CB = objectUtils.line(objectUtils.point(obj.p2.x, obj.p1.y), obj.p2);
        const BA = objectUtils.line(obj.p2, objectUtils.point(obj.p1.x, obj.p2.y));
        const AD = objectUtils.line(objectUtils.point(obj.p1.x, obj.p2.y), obj.p1);

        const DCIntersection = objectUtils.intersection(DC, ray);
        const CBIntersection = objectUtils.intersection(CB, ray);
        const BAIntersection = objectUtils.intersection(BA, ray);
        const ADIntersection = objectUtils.intersection(AD, ray);

        const DCdist = DCIntersection ? objectUtils.squaredLength(ray.p1, DCIntersection) : Infinity;
        const CBdist = CBIntersection ? objectUtils.squaredLength(ray.p1, CBIntersection) : Infinity;
        const BAdist = BAIntersection ? objectUtils.squaredLength(ray.p1, BAIntersection) : Infinity;
        const ADdist = ADIntersection ? objectUtils.squaredLength(ray.p1, ADIntersection) : Infinity;

        const minDis = Math.min(DCdist, CBdist, BAdist, ADdist)

        switch (minDis) {
            case DCdist:
                return DCIntersection
            case CBdist:
                return CBIntersection
            case BAdist:
                return BAIntersection
            case ADdist:
                return ADIntersection
            default:
                return null
        }
    },

    shot: (obj, ray, intersection) => {
        return elementsTypes['polygon'].shot({...obj, path: [{p: obj.p1}, {p: objectUtils.point(obj.p2.x, obj.p1.y)}, {p: obj.p2}, {p: objectUtils.point(obj.p1.x, obj.p2.y)}]}, ray, intersection)
    }
}

elementsTypes['circle'] = {
    create: (mouse) => {
        return {type: 'circle', p1: mouse, p2: mouse, properties: ["refractiveIndex", "cauchyCoeffient"], refractiveIndex: 1.5}
    },

    draw: (ctx, obj, scale = 1) =>  {
        obj.internalReflections = 0;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(obj.p1.x, obj.p1.y, Math.sqrt(Math.pow(obj.p2.x - obj.p1.x, 2) + Math.pow(obj.p2.y - obj.p1.y, 2)), 0, 2 * Math.PI);
        ctx.fill();

        if(obj.selected){
            elementsTypes['layoutDot'].draw(ctx, obj.p1, scale);
            elementsTypes['layoutDot'].draw(ctx, obj.p2, scale);
        }
    },

    move: elementsTypes['lineBased'].move,

    resize: (obj, mouse, corner) => {
        if(corner === 'r'){
            obj.p2.x = mouse.x;
            obj.p2.y = mouse.y;
        }
    },

    testClick(obj, mouse, scale){
        return elementsTypes['circle'].getNearestPoint(obj, mouse, scale) || (objectUtils.length(obj.p1, mouse) <= objectUtils.length(obj.p1, obj.p2));
    },

    getNearestPoint(obj, mouse, scale){
        const delta = 5 / scale;
        const { x, y } = mouse;

        if (obj.p2.x - delta < x && x < obj.p2.x + delta &&  obj.p2.y - delta < y && y < obj.p2.y + delta) return 'r'
    },

    rayIntersection(obj, ray) {
        const rayIntersection = objectUtils.intersection(objectUtils.circle(obj.p1, obj.p2), ray);

        if(rayIntersection){
            const p1Exists = objectUtils.is_on_ray(rayIntersection.p1, ray, 10);
            const p2Exists = objectUtils.is_on_ray(rayIntersection.p2, ray, 10);

            const p1Dist = objectUtils.squaredLength(ray.p1, rayIntersection.p1);
            const p2Dist = objectUtils.squaredLength(ray.p1, rayIntersection.p2);

            if(p1Exists && (!p2Exists || p1Dist < p2Dist)) return rayIntersection.p1
            if(p2Exists && (!p1Exists || p1Dist > p2Dist)) return rayIntersection.p2
        }

        return null
    },

    shot: function(obj, ray, intersection) {
        const micrometer = 0.000001;
        obj.cauchyCoeffient ||= 0.004;

        const midpoint = objectUtils.center(ray.p1, intersection);
        const d = objectUtils.squaredLength(obj.p1, obj.p2) - objectUtils.squaredLength(obj.p1, midpoint);

        if (d === 0) {
            console.log('Error: shotType is not defined');
            return;
        }

        let n1 = obj.refractiveIndex + (obj.cauchyCoeffient || 0.004) / (ray.wavelength * ray.wavelength * micrometer);
        let normal = {x: obj.p1.x - intersection.x, y: obj.p1.y - intersection.y};

        if (d < 0) {
            n1 = 1 / n1;
            normal = objectUtils.point(intersection.x - obj.p1.x, intersection.y - obj.p1.y);
        }
        return elementsTypes['refractor'].refract(ray, intersection, normal, n1, obj);
    },
}

elementsTypes['voidcircle'] = {
    create: (mouse) => {
        return {type: 'voidcircle', p1: mouse, p2: mouse}
    },

    draw: (ctx, obj, scale = 1) =>  {
        ctx.strokeStyle = 'rgba(242, 133, 111, 1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(obj.p1.x, obj.p1.y, Math.sqrt(Math.pow(obj.p2.x - obj.p1.x, 2) + Math.pow(obj.p2.y - obj.p1.y, 2)), 0, 2 * Math.PI);
        ctx.stroke();


        if(obj.selected){
            elementsTypes['layoutDot'].draw(ctx, obj.p1, scale);
            elementsTypes['layoutDot'].draw(ctx, obj.p2, scale);
        }
    },

    move: elementsTypes['lineBased'].move,

    resize: (obj, mouse, corner) => {
        if(corner === 'r'){
            obj.p2.x = mouse.x;
            obj.p2.y = mouse.y;
        }
    },

    testClick(obj, mouse, scale){
        return elementsTypes['circle'].getNearestPoint(obj, mouse, scale) || (objectUtils.length(obj.p1, mouse) <= objectUtils.length(obj.p1, obj.p2));
    },

    rayIntersection: elementsTypes['circle'].rayIntersection,
}

elementsTypes['polygon'] = {
    create: (mouse) => {
        return {type: 'polygon', path: [{p: mouse, arc: false}, {p: mouse, arc: false}], creating: true, properties: ["refractiveIndex", "cauchyCoeffient"], refractiveIndex: 1.5}
    },

    draw: (ctx, obj, scale = 1, drawPoints = true) =>  {
        obj.internalReflections = 0;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.strokeStyle = 'rgb(255,255,255)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(obj.path[0].p.x, obj.path[0].p.y);

        for(let i = 1; i < obj.path.length; i++){
            if(obj.path[i].arc){
                const l1 = objectUtils.perpendicular_bisector(objectUtils.line(obj.path[i-1].p, obj.path[i].p));
                const l2 = objectUtils.perpendicular_bisector(objectUtils.line(obj.path[i+1].p, obj.path[i].p));

                const center = objectUtils.intersection(l1, l2);

                if(center){
                    const radius = objectUtils.length(center, obj.path[i].p);

                    const a1 = Math.atan2(obj.path[i-1].p.y - center.y, obj.path[i-1].p.x - center.x);
                    const a2 = Math.atan2(obj.path[i+1].p.y - center.y, obj.path[i+1].p.x - center.x);
                    const a3 = Math.atan2(obj.path[i].p.y - center.y, obj.path[i].p.x - center.x);

                    ctx.arc(center.x, center.y, radius, a1, a2, (a2 < a3 && a3 < a1) || (a1 < a2 && a2 < a3) || (a3 < a1 && a1 < a2));
                }
            }else{
                ctx.lineTo(obj.path[i].p.x, obj.path[i].p.y);
            }
        }

        obj.creating ? ctx.stroke() : ctx.fill();


        if(obj.selected && drawPoints){
            obj.path.forEach( point => {
                elementsTypes['layoutDot'].draw(ctx, point.p, scale);
            })
        }
    },

    move: (obj, mouse, offset) => {
        for(let i = 1; i < obj.path.length; i++){
            const w = obj.path[i].p.x - obj.path[0].p.x;
            const h = obj.path[i].p.y - obj.path[0].p.y;

            obj.path[i].p.x = mouse.x - offset.x + w;
            obj.path[i].p.y = mouse.y - offset.y + h;
        }

        obj.path[0].p.x = mouse.x - offset.x;
        obj.path[0].p.y = mouse.y - offset.y;
    },

    resize: (obj, mouse, corner) => {
        obj.path[corner].p.x = mouse.x;
        obj.path[corner].p.y = mouse.y;
    },

    testClick: (obj, mouse, scale) => {

        return elementsTypes['polygon'].getNearestPoint(obj, mouse, scale) || objectUtils.testInPath(obj, mouse);
    },

    getNearestPoint: (obj, mouse, scale) => {
        const delta = 5 / scale;
        const { x, y } = mouse;

        for(let i = 0; i < obj.path.length; i++){
            if (obj.path[i].p.x - delta < x && x < obj.path[i].p.x + delta &&  obj.path[i].p.y - delta < y && y < obj.path[i].p.y + delta){
                return i.toString()
            }
        }

        return null;
    },

    rayIntersection: (obj, ray) => {
        let intersecLenSq = Infinity;
        let sp = null;

        for(let i = 0; i < obj.path.length; i++){
            let intersecLenSqTemp;
            let spTemp;

            if(!obj.path[i].arc && !obj.path[(i + 1) % obj.path.length].arc) {
                const rpTemp = objectUtils.intersection_2line(objectUtils.line(ray.p1, objectUtils.point(ray.p1.x + ray.dir.x, ray.p1.y + ray.dir.y)), objectUtils.line(obj.path[i % obj.path.length].p, obj.path[(i + 1) % obj.path.length].p));

                if (objectUtils.is_on_line(rpTemp, objectUtils.line(obj.path[i % obj.path.length].p, obj.path[(i + 1) % obj.path.length].p)) && objectUtils.is_on_ray(rpTemp, ray) && objectUtils.squaredLength(ray.p1, rpTemp) > 1e-12) {
                    spTemp = rpTemp;
                    intersecLenSqTemp = objectUtils.squaredLength(ray.p1, rpTemp);
                }

            } else if(!obj.path[(i + 1) % obj.path.length].arc && obj.path[i].arc) {

                const p1 = obj.path[i % obj.path.length].p; // arc
                const p2 = obj.path[(i - 1) % obj.path.length].p; // start point
                const p3 = obj.path[(i + 1) % obj.path.length].p; // end

                const l1 = objectUtils.perpendicular_bisector(objectUtils.line(p3, p1));
                const l2 = objectUtils.perpendicular_bisector(objectUtils.line(p2, p1));

                const center = objectUtils.intersection(l1, l2);

                if(center){
                    const rpTemp = objectUtils.intersection_line_circle(objectUtils.circle(center, p2), objectUtils.ray(ray.p1, objectUtils.point(ray.p1.x + ray.dir.x, ray.p1.y + ray.dir.y), ray.dir))

                    if(rpTemp) {
                        const lineLen1 = objectUtils.squaredLength(ray.p1, rpTemp.p1);
                        const isOnLine1 = !objectUtils.is_on_line(objectUtils.intersection(objectUtils.line(p3,p2), objectUtils.line(p1, rpTemp.p1)), objectUtils.line(p1, rpTemp.p1))
                        const p1Exists = isOnLine1 && objectUtils.is_on_ray(rpTemp.p1, ray, 10) && lineLen1 > 1e-12

                        const lineLen2 = objectUtils.squaredLength(ray.p1, rpTemp.p2);
                        const isOnLine2 = !objectUtils.is_on_line(objectUtils.intersection(objectUtils.line(p3,p2), objectUtils.line(p1, rpTemp.p2)), objectUtils.line(p1, rpTemp.p2))
                        const p2Exists = isOnLine2 && objectUtils.is_on_ray(rpTemp.p2, ray, 10) && lineLen2 > 1e-12


                        if(p1Exists && (!p2Exists || lineLen1 < lineLen2) && lineLen1 > 1e-12) {
                            intersecLenSqTemp = lineLen1;
                            spTemp = rpTemp.p1;
                        }

                        if(p2Exists && (!p1Exists || lineLen1 > lineLen2) && lineLen2 > 1e-12) {
                            intersecLenSqTemp = lineLen2;
                            spTemp = rpTemp.p2;
                        }
                    }
                }
            }

            if (spTemp && intersecLenSqTemp < intersecLenSq) {
                intersecLenSq = intersecLenSqTemp;
                sp = spTemp;
            }
        }
        return sp;
    },

    shot: (obj, ray, intersection) => {
        const micrometer = 0.000001;
        obj.cauchyCoeffient ||= 0.004;
        const isInside = objectUtils.testInPath(obj, ray.p1);
        let n1 = (obj.refractiveIndex + obj.cauchyCoeffient / (ray.wavelength ** 2 * micrometer));
        let intersecLenSq = Infinity;
        let sp = null;
        const normal = objectUtils.point(0, 0);

        if(!isInside){
            n1 = 1 / n1;
        }

        for (let i = 0; i < obj.path.length; i++)
        {
            let intersecLenSqTemp;
            let spTemp;
            const normalTemp = {};

            if(!obj.path[i].arc && !obj.path[(i + 1) % obj.path.length].arc) {
                const rpTemp = objectUtils.intersection_2line(objectUtils.line(ray.p1, ray.p2), objectUtils.line(obj.path[i % obj.path.length].p, obj.path[(i + 1) % obj.path.length].p));

                if (objectUtils.is_on_line(rpTemp, objectUtils.line(obj.path[i % obj.path.length].p, obj.path[(i + 1) % obj.path.length].p)) && objectUtils.is_on_ray(rpTemp, ray) && objectUtils.squaredLength(ray.p1, rpTemp) > 1e-6)
                {
                    spTemp = rpTemp;
                    intersecLenSqTemp = objectUtils.squaredLength(ray.p1, rpTemp);

                    const rdots = (ray.p2.x - ray.p1.x) * (obj.path[(i + 1) % obj.path.length].p.x - obj.path[i % obj.path.length].p.x) + (ray.p2.y - ray.p1.y) * (obj.path[(i + 1) % obj.path.length].p.y - obj.path[i % obj.path.length].p.y);
                    const ssq = (obj.path[(i + 1) % obj.path.length].p.x - obj.path[i % obj.path.length].p.x) * (obj.path[(i + 1) % obj.path.length].p.x - obj.path[i % obj.path.length].p.x) + (obj.path[(i + 1) % obj.path.length].p.y - obj.path[i % obj.path.length].p.y) * (obj.path[(i + 1) % obj.path.length].p.y - obj.path[i % obj.path.length].p.y);

                    normalTemp.x = rdots * (obj.path[(i + 1) % obj.path.length].p.x - obj.path[i % obj.path.length].p.x) - ssq * (ray.p2.x - ray.p1.x);
                    normalTemp.y = rdots * (obj.path[(i + 1) % obj.path.length].p.y - obj.path[i % obj.path.length].p.y) - ssq * (ray.p2.y - ray.p1.y);
                }
            }else if(!obj.path[(i + 1) % obj.path.length].arc && obj.path[i].arc) {
                const p1 = obj.path[i % obj.path.length].p; // arc
                const p2 = obj.path[(i - 1) % obj.path.length].p; // start point
                const p3 = obj.path[(i + 1) % obj.path.length].p; // end

                const l1 = objectUtils.perpendicular_bisector(objectUtils.line(p3, p1));
                const l2 = objectUtils.perpendicular_bisector(objectUtils.line(p2, p1));

                const center = objectUtils.intersection(l1, l2);

                if(center){
                    const rpTemp = objectUtils.intersection_line_circle(objectUtils.circle(center, p2), ray);
                    
                    if(rpTemp){
                        const lineLen1 = objectUtils.squaredLength(ray.p1, rpTemp.p1);
                        const isOnLine1 = !objectUtils.is_on_line(objectUtils.intersection(objectUtils.line(p3,p2), objectUtils.line(p1, rpTemp.p1)), objectUtils.line(p1, rpTemp.p1));
                        const p1Exists = isOnLine1 && objectUtils.is_on_ray(rpTemp.p1, ray, 10) && lineLen1 > 1e-12;
                        const isOnRay1 = objectUtils.is_on_ray(rpTemp.p1, ray, 10);
    
                        const lineLen2 = objectUtils.squaredLength(ray.p1, rpTemp.p2);
                        const isOnLine2 = !objectUtils.is_on_line(objectUtils.intersection(objectUtils.line(p3,p2), objectUtils.line(p1, rpTemp.p2)), objectUtils.line(p1, rpTemp.p2));
                        const p2Exists = isOnLine2 && objectUtils.is_on_ray(rpTemp.p2, ray, 10) && lineLen2 > 1e-12;
                        const isOnRay2 = objectUtils.is_on_ray(rpTemp.p2, ray, 10);
    
    
                        if(p1Exists && (!p2Exists || lineLen1 < lineLen2) && lineLen1 > 1e-12) {
                            intersecLenSqTemp = lineLen1;
                            spTemp = rpTemp.p1;
    
                            if(isOnRay2 && lineLen1 < lineLen2) {
                                normalTemp.x = spTemp.x - center.x;
                                normalTemp.y = spTemp.y - center.y;
                            }else{
                                normalTemp.x = center.x - spTemp.x;
                                normalTemp.y = center.y - spTemp.y;
                            }
                        }
    
                        if(p2Exists && (!p1Exists || lineLen1 > lineLen2) && lineLen2 > 1e-12) {
                            intersecLenSqTemp = lineLen2;
                            spTemp = rpTemp.p2;
    
                            if(isOnRay1 && lineLen2 < lineLen1) {
                                normalTemp.x = spTemp.x - center.x;
                                normalTemp.y = spTemp.y - center.y;
                            }else{
                                normalTemp.x = center.x - spTemp.x;
                                normalTemp.y = center.y - spTemp.y;
                            }
                        }
                    }
                }
            }

            if(spTemp && intersecLenSqTemp < intersecLenSq && !(sp && objectUtils.squaredLength(intersecLenSqTemp, sp) < 1e-12)) {
                normal.x = normalTemp.x;
                normal.y = normalTemp.y;
                intersecLenSq = intersecLenSqTemp;
                sp = spTemp;
            }
        }

        return elementsTypes['refractor'].refract(ray, intersection, normal, n1, obj);
    },
}

elementsTypes['laser'] = {
    create: (mouse) => {
        const p1 = mouse;
        const p2 = objectUtils.point(mouse.x + 100, mouse.y);
        const dir = objectUtils.point(1, 0);
        const properties = ["light"];

        return {type: 'laser', p1, p2, dir, properties, wavelength: 380, brightness: 1}
    },

    draw: (ctx, obj, scale = 1) =>  {
        ctx.strokeStyle = 'rgb(255,255,255)';
        ctx.lineWidth = 16;

        const normalized = objectUtils.normalize(60, obj.p1, obj.p2);

        obj.p2.x = obj.p1.x + normalized.x;
        obj.p2.y = obj.p1.y + normalized.y;

        const dir = objectUtils.point(obj.p2.x - obj.p1.x, obj.p2.y - obj.p1.y);
        obj.dir.x = dir.x;
        obj.dir.y = dir.y;

        ctx.beginPath();
        ctx.moveTo(obj.p1.x, obj.p1.y);
        ctx.lineTo(obj.p2.x, obj.p2.y);
        ctx.stroke();

        if(obj.selected){
            elementsTypes['layoutDot'].draw(ctx, obj.p2, scale);
        }
    },

    move: (obj, mouse, offset) => {
        obj.p1.x = mouse.x - offset.x;
        obj.p1.y = mouse.y - offset.y;

        obj.p2.x = mouse.x - offset.x + obj.dir.x;
        obj.p2.y = mouse.y - offset.y + obj.dir.y;
    },

    resize: (obj, mouse, corner) => {
        if(corner === 'r'){
            obj.p2.x = mouse.x;
            obj.p2.y = mouse.y;

            const normalized = objectUtils.normalize(60, obj.p1, obj.p2);

            obj.p2.x = obj.p1.x + normalized.x;
            obj.p2.y = obj.p1.y + normalized.y;

            const dir = objectUtils.point(obj.p2.x - obj.p1.x, obj.p2.y - obj.p1.y);
            obj.dir.x = dir.x;
            obj.dir.y = dir.y;
        }
    },

    testClick: elementsTypes['lineBased'].testClick,

    triggerCluster: (obj) => {
        const ray = objectUtils.ray(obj.p2, obj.p2, obj.dir);
        ray.wavelength = obj.wavelength;
        ray.brightness_p = obj.brightness * 0.5;
        ray.brightness_s = obj.brightness * 0.5;

        const cluster = objectUtils.cluster(ray);
        cluster.parent = obj.name;

        return [cluster]
    }
}

elementsTypes['bundle'] = {
    create: (mouse) => {
        const dir = objectUtils.point(1, 0);
        const properties = ["light"];

        return {type: 'bundle', p1: mouse, p2: mouse, dir, properties, wavelength: 380, brightness: 1}
    },

    draw: elementsTypes['lineBased'].draw,

    move: elementsTypes['lineBased'].move,

    resize: elementsTypes['lineBased'].resize,

    testClick: elementsTypes['lineBased'].testClick,

    triggerCluster: (obj) => {
        const clusters = []

        const length = objectUtils.length(obj.p1, obj.p2);
        const n = length / 10;

        for (let i = 1; i < n; i++) {

            const ray = {
                type: 'ray',
                _p1: obj.p1,
                p2: obj.p1,
                _dir: objectUtils.point(-(obj.p1.y - obj.p2.y), obj.p1.x - obj.p2.x),

                get dir() {
                  return objectUtils.point(-(obj.p1.y - obj.p2.y), obj.p1.x - obj.p2.x);
                },

                set dir(dir) {
                    this._dir = dir;
                },

                get p1() {
                    const sx = (obj.p2.x - obj.p1.x) / n;
                    const sy = (obj.p2.y - obj.p1.y) / n;
                    return objectUtils.point(this._p1.x + i * sx, this._p1.y + i * sy);
                },

                set p1(p1) {
                    this._p1 = p1;
                }
            }

            ray.wavelength = obj.wavelength;
            ray.brightness_p = obj.brightness * 0.5;
            ray.brightness_s = obj.brightness * 0.5;

            const cluster = objectUtils.cluster(ray);
            cluster.parent = obj.name;

            clusters.push(cluster);
        }

        return clusters
    },
}

elementsTypes['threesixty'] = {
    create(mouse){
        const properties = ["soloLight"];

        return {type: 'threesixty', p1: mouse, properties, wavelength: 700, brightness: 1}
    },

    draw: (ctx, obj, scale = 1) =>  {
        ctx.fillStyle = 'rgb(255,255,255)';

        ctx.beginPath();
        ctx.arc(obj.p1.x, obj.p1.y, 10, 0, 2 * Math.PI);
        ctx.fill();

        if(obj.selected){
            elementsTypes['layoutDot'].draw(ctx, obj.p1, scale);
        }
    },

    move: (obj, mouse, offset) => {
        obj.p1.x = mouse.x - offset.x;
        obj.p1.y = mouse.y - offset.y;
    },

    testClick: (obj, mouse) => {
        return objectUtils.length(obj.p1, mouse) <= 10;
    },

    triggerCluster: (obj) => {
        const clusters = []

        for (let i = 0; i < 360; i+= 0.1) {
            const dir = objectUtils.getDirFromAngle(i);
            const ray = objectUtils.ray(obj.p1, obj.p1, dir);

            ray.brightness_p = obj.brightness * 0.5;
            ray.brightness_s = obj.brightness * 0.5;
            ray.wavelength = obj.wavelength;

            const cluster = objectUtils.cluster(ray);
            cluster.parent = obj.name;

            clusters.push(cluster);
        }

        return clusters
    }
}

elementsTypes['arc'] = {
    create: (mouse) => {
        return {type: 'arc', path: [{p: mouse}, {p: mouse}]}
    },

    draw: (ctx, obj, scale = 1) =>  {
        if(obj.path.length > 2) {

            const l1 = objectUtils.perpendicular_bisector(objectUtils.line(obj.path[0].p, obj.path[2].p));
            const l2 = objectUtils.perpendicular_bisector(objectUtils.line(obj.path[1].p, obj.path[2].p));

            const center = objectUtils.intersection(l1, l2);

            if(center){
                const radius = objectUtils.length(center, obj.path[2].p);

                const a1 = Math.atan2(obj.path[0].p.y - center.y, obj.path[0].p.x - center.x);
                const a2 = Math.atan2(obj.path[1].p.y - center.y, obj.path[1].p.x - center.x);
                const a3 = Math.atan2(obj.path[2].p.y - center.y, obj.path[2].p.x - center.x);

                ctx.strokeStyle = 'rgb(255,255,255)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(center.x, center.y, radius, a1, a2, (a2 < a3 && a3 < a1) || (a1 < a2 && a2 < a3) || (a3 < a1 && a1 < a2));
                ctx.stroke();
            }else{
                ctx.strokeStyle = 'rgb(255,255,255)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(obj.path[0].p.x, obj.path[0].p.y);
                ctx.lineTo(obj.path[1].p.x, obj.path[1].p.y);
                ctx.stroke();
            }
        }else{
            ctx.strokeStyle = 'rgb(255,255,255)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(obj.path[0].p.x, obj.path[0].p.y);
            ctx.lineTo(obj.path[1].p.x, obj.path[1].p.y);
            ctx.stroke();
        }
        if(obj.selected){
            obj.path.forEach( point => {
                elementsTypes['layoutDot'].draw(ctx, point.p, scale);
            })
        }
        
    },

    resize: elementsTypes['polygon'].resize,

    move: elementsTypes['polygon'].move,

    testClick: elementsTypes['polygon'].testClick,

    getNearestPoint: elementsTypes['polygon'].getNearestPoint,

    rayIntersection: (obj, ray) => {
        if(obj.path.length > 2){
            const l1 = objectUtils.perpendicular_bisector(objectUtils.line(obj.path[0].p, obj.path[2].p));
            const l2 = objectUtils.perpendicular_bisector(objectUtils.line(obj.path[1].p, obj.path[2].p));

            const center = objectUtils.intersection(l1, l2);

            if(center){
                const circle = objectUtils.circle(center, obj.path[2].p);

                const rayIntersection = objectUtils.intersection(circle, ray);

                if(rayIntersection){
                    const isOnLine1 = !objectUtils.is_on_line(objectUtils.intersection(objectUtils.line(obj.path[0].p, obj.path[1].p), objectUtils.line(obj.path[2].p, rayIntersection.p1)), objectUtils.line(obj.path[2].p, rayIntersection.p1));
                    const p1Exists = isOnLine1 && objectUtils.is_on_ray(rayIntersection.p1, ray) && objectUtils.squaredLength(ray.p1, rayIntersection.p1) > 1e-12;
                    const isOnLine2 = !objectUtils.is_on_line(objectUtils.intersection(objectUtils.line(obj.path[0].p, obj.path[1].p), objectUtils.line(obj.path[2].p, rayIntersection.p2)), objectUtils.line(obj.path[2].p, rayIntersection.p2));
                    const p2Exists = isOnLine2 && objectUtils.is_on_ray(rayIntersection.p2, ray) && objectUtils.squaredLength(ray.p1, rayIntersection.p2) > 1e-12;

                    const p1Dist = objectUtils.squaredLength(ray.p1, rayIntersection.p1);
                    const p2Dist = objectUtils.squaredLength(ray.p1, rayIntersection.p2);

                    if(p1Exists && (!p2Exists || p1Dist < p2Dist)) return rayIntersection.p1;
                    if(p2Exists && (!p1Exists || p1Dist > p2Dist)) return rayIntersection.p2;
                }
            }else{
                const line = objectUtils.line(obj.path[0].p, obj.path[1].p);
                return objectUtils.intersection(line, ray);
            }
        }else{
            const line = objectUtils.line(obj.path[0].p, obj.path[1].p);
            return objectUtils.intersection(line, ray);
        }
    },

    shot: (obj, ray, intersection) => {
        if(obj.path.length > 2){
            const rx = ray.p1.x - intersection.x;
            const ry = ray.p1.y - intersection.y;

            const l1 = objectUtils.perpendicular_bisector(objectUtils.line(obj.path[0].p, obj.path[2].p));
            const l2 = objectUtils.perpendicular_bisector(objectUtils.line(obj.path[1].p, obj.path[2].p));

            const center = objectUtils.intersection(l1, l2);

            if(center){
                const cx = center.x - intersection.x;
                const cy = center.y - intersection.y;
                const c_sq = cx ** 2 + cy ** 2;
                const r_dot_c = rx * cx + ry * cy;
                const p2 = objectUtils.point(intersection.x - c_sq * rx + 2 * r_dot_c * cx, intersection.y - c_sq * ry + 2 * r_dot_c * cy);
                const ray2 = objectUtils.ray(intersection, p2, p2);

                ray2.brightness_p = ray.brightness_p;
                ray2.brightness_s = ray.brightness_s;
                ray2.wavelength = ray.wavelength;

                return [ray2]
            }else{
                const line = objectUtils.line(obj.path[0].p, obj.path[1].p);
                return elementsTypes["lineBased"].shot(line, ray, intersection);
            }
        }else{
            const line = objectUtils.line(obj.path[0].p, obj.path[1].p);
            return elementsTypes["lineBased"].shot(line, ray, intersection);
        }

    }
}

elementsTypes['refractor'] = {
    refract: function(ray, s_point, normal, n1, obj)   {

        const rays= [];
        const normalLength = Math.sqrt(normal.x ** 2 + normal.y ** 2);
        const normalX = normal.x / normalLength;
        const normalY = normal.y / normalLength;

        const rayLength = Math.sqrt((ray.p2.x - ray.p1.x) ** 2 + (ray.p2.y - ray.p1.y) ** 2);

        const rayX = (ray.p2.x - ray.p1.x) / rayLength;
        const rayY = (ray.p2.y - ray.p1.y) / rayLength;

        const cos1 = -normalX * rayX - normalY * rayY;
        const sqCos2 = 1 - n1 ** 2 * (1 - cos1 ** 2);

        if (sqCos2 >= 0) {
            const cos2 = Math.sqrt(sqCos2);

            const R_s = Math.pow((n1 * cos1 - cos2) / (n1 * cos1 + cos2), 2);
            const R_p = Math.pow((n1 * cos2 - cos1) / (n1 * cos2 + cos1), 2);

            const ray2p2 = objectUtils.point(s_point.x + rayX + 2 * cos1 * normalX, s_point.y + rayY + 2 * cos1 * normalY);
            const ray2dir = objectUtils.point(ray2p2.x - s_point.x, ray2p2.y - s_point.y);
            const ray2 = objectUtils.ray(s_point, ray2p2, ray2dir);

            ray2.brightness_s = ray.brightness_s * R_s;
            ray2.brightness_p = ray.brightness_p * R_p;
            ray2.wavelength = ray.wavelength;

            if (ray2.brightness_s + ray2.brightness_p > 0.01) {
                rays.push(ray2);
            }

            const ray3p2 = objectUtils.point(s_point.x + n1 * rayX + (n1 * cos1 - cos2) * normalX, s_point.y + n1 * rayY + (n1 * cos1 - cos2) * normalY);
            const ray3dir = objectUtils.point(ray3p2.x - s_point.x, ray3p2.y - s_point.y);
            const ray3 = objectUtils.ray(s_point, ray3p2, ray3dir);

            ray3.brightness_s = ray.brightness_s * (1 - R_s);
            ray3.brightness_p = ray.brightness_p * (1 - R_p);
            ray3.wavelength = ray.wavelength;

            rays.push(ray3)

        }else if(obj.internalReflections < 1e+2){
            obj.internalReflections++;
            const ray2p2 = objectUtils.point(s_point.x + rayX + 2 * cos1 * normalX, s_point.y + rayY + 2 * cos1 * normalY);
            const ray2dir = objectUtils.point(ray2p2.x - s_point.x, ray2p2.y - s_point.y);
            const ray2 = objectUtils.ray(s_point, ray2p2, ray2dir);

            ray2.brightness_s = ray.brightness_s;
            ray2.brightness_p = ray.brightness_p;

            ray2.wavelength = ray.wavelength;

            return [ray2];
        }
        return rays;
    }
}

elementsTypes['lens'] = {
    create: (mouse) => {
        const p2 = objectUtils.point(mouse.x, mouse.y + 100);
        return {type: 'lens', path: [], p1: mouse, p2, creating: false, properties: ["refractiveIndex", "cauchyCoeffient", "lens"], refractiveIndex: 1.5, curved: 40, width: 30}
    },

    draw: (ctx, obj, scale = 1) =>  {
        const p1 = objectUtils.point(-(obj.p1.y - obj.p2.y), obj.p1.x - obj.p2.x);
        p1.x += obj.p1.x;
        p1.y += obj.p1.y;
        const p1Dir = objectUtils.normalize(obj.width, obj.p1, p1);
        const p1Normalized = objectUtils.point(obj.p1.x + p1Dir.x, obj.p1.y + p1Dir.y);

        const p2 = objectUtils.point(-(obj.p2.y - obj.p1.y), obj.p2.x - obj.p1.x);
        p2.x += obj.p2.x;
        p2.y += obj.p2.y;
        const p2Dir = objectUtils.normalize(-obj.width, obj.p2, p2);
        const p2Normalized = objectUtils.point(obj.p2.x + p2Dir.x, obj.p2.y + p2Dir.y) ;

        const center = objectUtils.center(p1Normalized, p2Normalized);
        const centerLens = objectUtils.point(-(center.y - p2Normalized.y) + center.x, center.x - p2Normalized.x + center.y);
        const centerDir = objectUtils.normalize(obj.curved, center, centerLens);
        const centerNormalized =  objectUtils.point(center.x + centerDir.x, center.y + centerDir.y);

        obj.p3 = p2Normalized;
        obj.p4 = centerNormalized;
        obj.p5 = p1Normalized;

        for (let i = 0; i < 5; i++) {
            obj.path[i] = {p: obj[`p${i +1}`], arc: i === 3}
        }

        if(obj.selected){
            elementsTypes['layoutDot'].draw(ctx, obj.p1, scale);
            elementsTypes['layoutDot'].draw(ctx, obj.p2, scale);
        }

        elementsTypes['polygon'].draw(ctx, obj, scale, false)
    },

    resize: (obj, mouse, corner) => {
        if(corner < 2){
            obj.path[corner].p.x = mouse.x;
            obj.path[corner].p.y = mouse.y;
        }
    },

    move: elementsTypes['polygon'].move,

    testClick: elementsTypes['polygon'].testClick,

    getNearestPoint: elementsTypes['polygon'].getNearestPoint,

    rayIntersection: elementsTypes['polygon'].rayIntersection,

    shot: elementsTypes['polygon'].shot,
}
export default elementsTypes;