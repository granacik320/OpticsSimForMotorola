import elementsTypes from "./ElementTypes";
import objectUtils from "./objectUtils";

class Scene {
    constructor(width, height, canvas, lightCanvas) {
        this.width = width;
        this.height = height;
        this.canvas = canvas;
        this.lightCanvas = lightCanvas
        this.elements = [];
        this.lights = [];
        this.action = null;
        this.elementToCreate = null;
        this.isCreatingPolygon = false;
        this.isMoving = false;
        this.scale = 1;
        this.panPosition = objectUtils.point(0, 0);
        this.scaledOffset = objectUtils.point(0, 0);
        this.nameIndex = 0;
        this.events = {};

        this.canvas.width = width;
        this.canvas.height = height;

        this.lightCanvas.width = width;
        this.lightCanvas.height = height;

        this.ctx = this.canvas.getContext('2d');
        this.lightCtx = this.lightCanvas.getContext('2d');
        this.lightCtx.globalCompositeOperation = 'screen';
        this.draw();

        this.#setupEventListeners();
    }
    #setupEventListeners() {
        this.canvas.addEventListener('mousedown', this.#handleMouseDown.bind(this));
        this.canvas.addEventListener('mouseup', this.#handleMouseUp.bind(this));
        this.canvas.addEventListener('mousemove', this.#handleMouseMove.bind(this));
        this.canvas.addEventListener('wheel', this.#handleMouseWheel.bind(this));

        window.addEventListener('keyup', this.#handleKeyUp.bind(this));
    }
    /**
     * It adds event listener
     * @method addEvent
     * @param {String} eventName 
     * @param {Function} callback 
     */
    addEvent(eventName, callback) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(callback);
    }

    /**
     * It removes event listener
     * @method removeEvent
     * @param {String} eventName 
     * @param {Function} callback 
     */
    removeEvent(eventName, callback) {
        if (this.events[eventName]) {
            this.events[eventName] = this.events[eventName].filter(cb => cb !== callback);
        }
    }

    /**
     * It triggers event 
     * @method #triggerEvent
     * @param {String} eventName
     */
    #triggerEvent(eventName) {
        if (this.events[eventName]) {
            this.events[eventName].forEach(callback => callback());
        }
    }

    #handleMouseDown(e) {
        const mouse = this.getMousePosition(e);

        if(e?.which === 2) {
            this.isMoving = true;
        }

        if(this.action === 'creating' ) {
            if(e?.which === 1 && (this.elementToCreate || this.isCreatingPolygon)){
                if(this.isCreatingPolygon){
                    if(this.elements[this.elements.length - 1].type === 'arc'){
                        if(this.elements[this.elements.length - 1].path.length < 3) {
                            this.elements[this.elements.length - 1].path.push({p: mouse});
                        }else{
                            this.isCreatingPolygon = false;
                        }
                    }else{
                        if(this.elements[this.elements.length - 1].path.length > 2) {
                            this.elements[this.elements.length - 1].selected = true;
                        }
                        if(this.elements[this.elements.length - 1].path.length > 3 && elementsTypes['polygon'].getNearestPoint(this.elements[this.elements.length - 1], mouse, this.scale) === '0'){
                            this.isCreatingPolygon = false;
                            this.elements[this.elements.length - 1].path.pop();
                            this.elements[this.elements.length - 1].creating = false;
                            this.elements[this.elements.length - 1].selected = false;
                        }else{
                            this.elements[this.elements.length - 1].path.push({p: mouse, arc: false});
                        }
                    }
                }else{
                    this.addElement(this.elementToCreate, elementsTypes[this.elementToCreate].create(mouse));
                    this.isCreatingPolygon = this.elementToCreate === 'polygon' || this.elementToCreate === 'arc';
                }
                this.elementToCreate = null;
            }
        } else {
            this.target = this.getElementFromPoint(mouse);
            if(this.target){
                if(this.target.type === 'polygon' || this.target.type === 'arc') {
                    this.movingOffset = objectUtils.point(mouse.x - this.target.path[0].p.x, mouse.y - this.target.path[0].p.y);
                }else{
                    this.movingOffset = objectUtils.point(mouse.x - this.target.p1.x, mouse.y - this.target.p1.y);
                }
                this.action = this.target.selected === true ? 'moving' : 'resizing';
            }
            this.#triggerEvent('targetChange');
        }
        this.draw();
    }

    #handleMouseUp(e) {
        if(e?.which === 2) {
            this.isMoving = false;
        }else if(this.action === 'creating' && this.isCreatingPolygon){
            // tu trzeba dodać cos
        }else if(this.action === 'creating' && elementsTypes[this.elements[this.elements.length - 1].type].triggerCluster){
            this.addClusters(elementsTypes[this.elements[this.elements.length - 1].type].triggerCluster(this.elements[this.elements.length - 1]))
            this.action = null;
        }else{
            this.action = null;
        }
    }

    #handleMouseMove(e) {
        const mouse = this.getMousePosition(e);

        if (this.isMoving) {
            this.panPosition.x += e.movementX / this.scale;
            this.panPosition.y += e.movementY / this.scale;

            this.draw();
        }

        if(this.action === 'creating' && !this.elementToCreate) {
            if (this.isCreatingPolygon){
                this.elements[this.elements.length - 1].path[this.elements[this.elements.length - 1].path.length - 1].p = mouse;
            }else{
                this.elements[this.elements.length - 1].p2 = mouse;
            }

            this.draw();
        }else if (this.action === 'moving') {
            elementsTypes[this.target.type].move(this.target, mouse, this.movingOffset)
            this.draw();
        }else if (this.action === 'resizing'){
            elementsTypes[this.target.type].resize(this.target, mouse, this.target.selected)
            this.draw();
        }
    }

    #handleMouseWheel(e) {
        this.scale = Math.min(Math.max(this.scale - e.deltaY / 1000, 0.1), 10);
        this.draw();
    }

    #handleKeyUp(e) {
        switch (e.keyCode) {
            case 17:
                if(this.action === 'creating' && this.isCreatingPolygon){
                    this.elements[this.elements.length - 1].path[this.elements[this.elements.length - 1].path.length - 1].arc = true;
                    this.elements[this.elements.length - 1].path.push({p: this.elements[this.elements.length - 1].path[this.elements[this.elements.length - 1].path.length - 1].p, arc: false});
                    this.draw()
                }
                break;
            case 8:
            case 46:
                if(this.target){
                    this.deleteElement(this.target.name);
                }
                break;
            default:
        }
    }

    /**
     * It deletes an element with specific name
     * @method deleteElement
     * @param {String} name 
     */
    deleteElement(name) {
        if(this.target.properties && (this.target.properties.includes('light') || this.target.properties.includes('soloLight'))) {
            this.lights = this.lights.filter(light => light.parent !== name);
        }

        this.elements = this.elements.filter(element => element.name !== this.target.name);
        this.target = null;
        this.draw();
        this.#triggerEvent('elementsChange');
    }

    /**
     * It adds an element with specified name
     * @method addElement
     * @param {String} name 
     * @param {Object} element 
     */
    addElement(name, element) {
        element.name = `${name} ${this.nameIndex++}`;
        this.elements.push(element);
        this.#triggerEvent('elementsChange');
    }

    /**
     * It adds clusters from array
     * @method addClusters
     * @param {[objectUtils.cluster]} clusters 
     */
    addClusters(clusters){
        this.lights.push(...clusters);
        this.draw();
    }

    /**
     * It changes values of cluster
     * @method changeCluster
     * @param {String} parent 
     * @param {Number} wavelength 
     * @param {Number} brightness 
     */
    changeCluster(parent, wavelength, brightness){
        brightness /= 200;

        this.lights.forEach(searchedCluster => {
            if(searchedCluster.parent === parent){
                searchedCluster.path[0].wavelength = wavelength;
                searchedCluster.path[0].brightness_s = brightness;
                searchedCluster.path[0].brightness_p = brightness;
            }
        });

        this.draw();
    }

    /**
     * This changes color of all clusters
     * @method changeMulticolorCluster
     * @param {Object} e 
     */
    changeMulticolorCluster(e){
        this.lights = this.lights.filter(l => !l.addedByMulticolor);

        this.lights.filter(l => l.parent === e.parent).forEach(cluster => {
            const clusters = [];

            for (let i = 0; i < e.wavelengths.length; i++) {
                const ray = objectUtils.ray(cluster.path[0].p1, cluster.path[0].p2, cluster.path[0].dir)
                ray.wavelength = e.wavelengths[i]

                ray.brightness_p = e.brightness[i] / 200
                ray.brightness_s = e.brightness[i] / 200

                clusters.push(objectUtils.cluster(ray))
                clusters[clusters.length - 1].parent = cluster.parent
                clusters[clusters.length - 1].addedByMulticolor = true;
            }

            this.addClusters(clusters)
        });
    }

    /**
     * It changes refractive index of an object with specified name
     * @method changeRefractiveIndex
     * @param {String} name 
     * @param {Number} index 
     */
    changeRefractiveIndex(name, index) {
        this.elements = this.elements.map(element => element.name === name ? { ...element, refractiveIndex: index } : element);
        this.draw();
    }

    /**
     * It changes Cauchy's Coeffient of an object with specified name
     * @method changeRefractiveIndex
     * @param {String} name 
     * @param {Number} value
     */
    changeCauchyCoeffient(name, value) {
        this.elements = this.elements.map(element => element.name === name ? { ...element, cauchyCoeffient: value } : element);
        this.draw();
    }

    /**
     * It changes lens with specified name
     * @method changeLens
     * @param name
     * @param curved
     * @param width
     */
    changeLens(name, curved, width) {
        this.elements = this.elements.map(element => element.name === name ? { ...element, curved: curved ? curved : element.curved, width: width || element.width } : element);
        console.log(this.elements[this.elements.length - 1])
        this.draw();
    }


    /**
     * It changes width and height of canvas
     * @method resize
     * @param {Number} width 
     * @param {Number} height 
     */
    resize(width, height) {
        this.width = width;
        this.height = height;

        this.canvas.width = width;
        this.canvas.height = height;

        this.lightCanvas.width = width;
        this.lightCanvas.height = height;

        this.draw();
    }

    draw() {
        this.checkForRayIntersections();
        this.ctx.clearRect(0, 0, this.width, this.height);

        const scaledWidth = this.width * this.scale;
        const scaledHeight = this.height * this.scale;

        this.scaledOffset.x = (scaledWidth - this.width) / 2;
        this.scaledOffset.y = (scaledHeight - this.height) / 2;

        this.ctx.save();
        this.ctx.translate(this.panPosition.x * this.scale - this.scaledOffset.x, this.panPosition.y * this.scale - this.scaledOffset.y);
        this.ctx.scale(this.scale, this.scale);

        for (let i = 0; i < this.elements.length; i++) {
            elementsTypes[this.elements[i].type].draw(this.ctx, this.elements[i]);
        }

        if(this.target){
            elementsTypes[this.target.type].draw(this.ctx, { ...this.target, selected: true }, this.scale);
        }

        this.ctx.restore();

        if(this.lights){
            this.lightCtx.clearRect(0, 0, this.width, this.height);

            this.lightCtx.save();
            this.lightCtx.translate(this.panPosition.x * this.scale - this.scaledOffset.x, this.panPosition.y * this.scale - this.scaledOffset.y);
            this.lightCtx.scale(this.scale, this.scale);

            for (let i = 0; i < this.lights.length; i++) {
                this.lights[i].path.forEach(ray => {
                    const RGB = this.wavelengthToRGB(ray.wavelength, ray.brightness_s + ray.brightness_p);
                    this.lightCtx.strokeStyle = `rgb(${RGB.r}, ${RGB.g}, ${RGB.b})`;
                    this.lightCtx.lineWidth = 1;
                    this.lightCtx.beginPath();
                    this.lightCtx.moveTo(ray.p1.x, ray.p1.y);
                    this.lightCtx.lineTo(ray.p2?.x, ray.p2?.y);
                    this.lightCtx.stroke();
                });
            }

            this.lightCtx.restore();
        }
    }

    checkForRayIntersections() {
        for(let i = 0; i < this.lights.length; i++){
            this.lights[i].path = [this.lights[i].path[0]];

            for(let j = 0; j < this.lights[i].path.length; j++){
                let intersectedElement = null;
                let intersection = null;
                let lastSquaredLengthFromIntersection = Infinity;
                let minSquaredLengthFromIntersection = 1e-6;

                for(let k = 0; k < this.elements.length; k++){

                    if(elementsTypes[this.elements[k].type].rayIntersection && !this.elements[k].creating){

                        const thisIntersection = elementsTypes[this.elements[k].type].rayIntersection(this.elements[k], this.lights[i].path[j]);


                        if(thisIntersection){
                            const squaredLengthFromIntersection = objectUtils.squaredLength(this.lights[i].path[j].p1, thisIntersection)
                            if(squaredLengthFromIntersection < lastSquaredLengthFromIntersection && squaredLengthFromIntersection > minSquaredLengthFromIntersection){
                                intersectedElement = this.elements[k];
                                intersection = thisIntersection;
                                lastSquaredLengthFromIntersection = squaredLengthFromIntersection;
                            }
                        }
                    }
                }

                if(!intersection){
                    const windowPosition = objectUtils.point(-this.panPosition.x  - 10000, -this.panPosition.y - 10000);
                    const windowSize = objectUtils.point(this.width * 1000, this.height * 1000);

                    const top = objectUtils.line(windowPosition, objectUtils.point(windowSize.x, windowPosition.y));
                    const bottom = objectUtils.line(objectUtils.point(windowPosition.x, windowSize.y), objectUtils.point(windowSize.x, windowSize.y));
                    const left = objectUtils.line(windowPosition, objectUtils.point(windowPosition.x, windowSize.y));
                    const right = objectUtils.line(objectUtils.point(windowSize.x, windowPosition.y), objectUtils.point(windowSize.x, windowSize.y));

                    const topIntersection = elementsTypes['lineBased'].rayIntersection(top, this.lights[i].path[j]);
                    const bottomIntersection = elementsTypes['lineBased'].rayIntersection(bottom, this.lights[i].path[j]);
                    const leftIntersection = elementsTypes['lineBased'].rayIntersection(left, this.lights[i].path[j]);
                    const rightIntersection = elementsTypes['lineBased'].rayIntersection(right, this.lights[i].path[j]);

                    const topDist = topIntersection ? objectUtils.squaredLength(this.lights[i].path[j].p1, topIntersection) : 0;
                    const bottomDist = bottomIntersection ? objectUtils.squaredLength(this.lights[i].path[j].p1, bottomIntersection) : 0;
                    const leftDist = leftIntersection ? objectUtils.squaredLength(this.lights[i].path[j].p1, leftIntersection) : 0;
                    const rightDist = rightIntersection ? objectUtils.squaredLength(this.lights[i].path[j].p1, rightIntersection) : 0;

                    const maxDis = Math.max(topDist, bottomDist, leftDist, rightDist)

                    switch (maxDis) {
                        case topDist:
                            intersection = topIntersection
                            break;
                        case bottomDist:
                            intersection = bottomIntersection
                            break;
                        case leftDist:
                            intersection = leftIntersection
                            break;
                        case rightDist:
                            intersection = rightIntersection
                            break;
                        default:
                            break;
                    }
                }

                this.lights[i].path[j].p2 = intersection;
                if(intersectedElement && elementsTypes[intersectedElement.type].shot && !intersectedElement.creating){
                    const rays = elementsTypes[intersectedElement.type].shot(intersectedElement, this.lights[i].path[j], intersection);
                    if (rays) {
                        this.lights[i].path.push(...rays);
                    }
                }
            }
        }
    }

    /**
     * Returns point where the mouse currently is
     * @method getMousePosition
     * @param e
     * @returns {{x, y, type: string}}
     */
    getMousePosition(e) {
        return objectUtils.point((e.offsetX - this.panPosition.x * this.scale + this.scaledOffset.x) / this.scale, (e.offsetY - this.panPosition.y * this.scale + this.scaledOffset.y) / this.scale);
    }

    /**
     * Returns object in which there is a point
     * @method getElementFromPoint
     * @param mouse
     * @returns {*&{selected: *}}
     */
    getElementFromPoint(mouse) {
        return this.elements
            .map(element => ({ ...element, selected: elementsTypes[element.type].testClick(element, mouse, this.scale) }))
            .find(element => element.selected !== false);
    }


    /**
     * Returns RGB object from wavelength and alpha
     * @method wavelengthToRGB
     * @param wavelength
     * @param alpha
     * @returns {{r: number, b: number, g: number}}
     */
    wavelengthToRGB(wavelength, alpha) {
        const RGB = { r: 0, g: 0, b: 0 };
        let factor

        if (wavelength >= 380 && wavelength <= 440) {
            RGB.r = (-1 * (wavelength - 440)) / (440 - 380);
            RGB.g = 0;
            RGB.b = 1;
        } else if (wavelength >= 440 && wavelength <= 490) {
            RGB.r = 0;
            RGB.g = (wavelength - 440) / (490 - 440);
            RGB.b = 1;
        } else if (wavelength >= 490 && wavelength <= 510) {
            RGB.r = 0;
            RGB.g = 1;
            RGB.b = (-1 * (wavelength - 510)) / (510 - 490);
        } else if (wavelength >= 510 && wavelength <= 580) {
            RGB.r = (wavelength - 510) / (580 - 510);
            RGB.g = 1;
            RGB.b = 0;
        } else if (wavelength >= 580 && wavelength <= 645) {
            RGB.r = 1;
            RGB.g = (-1 * (wavelength - 645)) / (645 - 580);
            RGB.b = 0;
        } else if (wavelength >= 645 && wavelength <= 760) {
            RGB.r = 1;
            RGB.g = 0;
            RGB.b = 0;
        } else {
            RGB.r = 0;
            RGB.g = 0;
            RGB.b = 0;
        }

        if (wavelength >= 380 && wavelength < 420) {
            factor = 0.3 + (0.7 * (wavelength - 380)) / (420 - 380);
        } else if (wavelength >= 420 && wavelength < 701) {
            factor = 1.0;
        } else if (wavelength >= 701 && wavelength < 761) {
            factor = 0.3 + (0.7 * (760 - wavelength)) / (760 - 700);
        } else {
            factor = 0.0;
        }

        RGB.r = Math.round(Math.min(Math.max(RGB.r * factor, 0), 1) * 255) * alpha;
        RGB.g = Math.round(Math.min(Math.max(RGB.g * factor, 0), 1) * 255) * alpha;
        RGB.b = Math.round(Math.min(Math.max(RGB.b * factor, 0), 1) * 255) * alpha;

        return RGB;
    }
}
export default Scene;
