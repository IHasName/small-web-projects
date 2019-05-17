document.addEventListener('DOMContentLoaded', init);

canvas = 0;
context = 0;
w = 0;
h = 0;

particleConfig = {
    particleCount: 0,
    minSize: 0,
    maxSize: 0,
    minSpeedX: 0,
    maxSpeedX: 0,
    minSpeedY: 0,
    maxSpeedY: 0,
    directionX: 0,
    directionY: 0,
    linesEnabled: false,
    lineDistance: 0,
    minRotationSpeed: 0,
    maxRotationSpeed: 0,
    enableFixedRotation: false,
    fixedRotation: 0,
    pWireframe: false,
    particleColor: "#000000",
    lineColor: "#000000",
    backgroundColor: "#000000",
    particleShape: "",
    loadConfig: function(config) {
        if(config.hasOwnProperty('using')) {
            particleConfig.loadConfig(particleConfigs[config.using]);
        }
        for(key in config) {   
            if(this.hasOwnProperty(key) && key != "loadConfig") {
                this[key] = config[key];
            }
        }
        update();
        updateInputs();
    }
};

particleConfigs = {
    default: {
        particleCount: 150,
        minSize: 1,
        maxSize: 4,
        minSpeedX: -2,
        maxSpeedX: 2,
        minSpeedY: -2,
        maxSpeedY: 2,
        directionX: 0,
        directionY: 0,
        linesEnabled: true,
        lineDistance: 200,
        minRotationSpeed: 1,
        maxRotationSpeed: 6,
        enableFixedRotation: false,
        fixedRotation: 0,
        pWireframe: false,
        particleColor: "#ffffff",
        lineColor: "#00ffff",
        backgroundColor: "#1d1c1c",
        particleShape: "sphere"
    },
    snow_light: {
        particleCount: 250,
        minSize: 1,
        maxSize: 3,
        minSpeedX: 0.6,
        maxSpeedX: 2,
        minSpeedY: 0.6,
        maxSpeedY: 2,
        directionX: 1,
        directionY: 3,
        linesEnabled: false,
        lineDistance: 0,
        minRotationSpeed: 1,
        maxRotationSpeed: 1,
        enableFixedRotation: false,
        fixedRotation: 0,
        pWireframe: false,
        particleColor: "#ffffff",
        lineColor: "#000000",
        backgroundColor: "#1d1c1c",
        particleShape: "sphere"
    },
    snow_heavy: {
        using: "snow_light",
        particleCount: 800,
        minSize: 2,
        maxSize: 5,
        directionX: 0,
        directionY: 5
    },
    rain: {
        particleCount: 250,
        minSize: 1,
        maxSize: 10,
        minSpeedX: 0,
        maxSpeedX: 0,
        minSpeedY: 6,
        maxSpeedY: 10,
        directionX: 0,
        directionY: 0,
        linesEnabled: false,
        lineDistance: 0,
        minRotationSpeed: 0,
        maxRotationSpeed: 0,
        enableFixedRotation: true,
        fixedRotation: 0,
        pWireframe: false,
        particleColor: "#00ffff",
        lineColor: "#000000",
        backgroundColor: "#1d1c1c",
        particleShape: "line"
    }
}

clockInterval = 20;
needsUpdate = false;
paused = false;

particles = [];

particleShapes = {
    createSquare: function(size) {
        return [
            {x: 0, y: 0},
            {x: size, y: 0},
            {x: size, y: size},
            {x: 0, y: size},
            {x: 0, y: 0}
        ]
    },
    createTriangle: function(size) { 
        return [
            {x: 0, y: 0},
            {x: size, y: 0},
            {x: size / 2, y: Math.sqrt(Math.pow(size, 2) - Math.pow(size / 2, 2))},
            {x: 0, y: 0}
        ]
    },
    createLine: function(size) {
        return [
            {x: 0, y: 0},
            {x: 2, y: 0},
            {x: 2, y: size},
            {x: 0, y: size},
            {x: 0, y: 0}
        ]
    }
}

inputs = {
    configSelect: document.getElementById('configSelect'),

    pCount: document.getElementById('pCount'),
    minSize: document.getElementById('minSize'),
    maxSize: document.getElementById('maxSize'),
    minSpeedX: document.getElementById('minSpeedX'),
    maxSpeedX: document.getElementById('maxSpeedX'),
    minSpeedY: document.getElementById('minSpeedY'),
    maxSpeedY: document.getElementById('maxSpeedY'),
    minRSpeed: document.getElementById('minRSpeed'),
    maxRSpeed: document.getElementById('maxRSpeed'),
    fixedRotation: document.getElementById('fixedRotation'),
    enableFixedRotation: document.getElementById('enableFixedRotation'),
    directionX: document.getElementById('directionX'),
    directionY: document.getElementById('directionY'),
    lEnabled: document.getElementById('lEnabled'),
    lDistance: document.getElementById('lDistance'),
    pColor: document.getElementById('pColor'),
    lColor: document.getElementById('lColor'),
    bColor: document.getElementById('bColor'),
    pShape: document.getElementById('pShape'),
    pWireframe: document.getElementById('pWireframe')
};

function init() {
    document.removeEventListener('DOMContentLoaded', init);
    window.addEventListener('resize', handleResize);
    window.addEventListener('fullscreenchange', handleResize);
    window.addEventListener('webkitscreenchange', handleResize);
    window.addEventListener('mozfullscreenchange', handleResize);

    canvas = document.getElementById('particle');
    startConfig = canvas.getAttribute('config');
    particleConfig.loadConfig(particleConfigs[startConfig]);
    for(configKey in particleConfigs) {
        o = document.createElement('option');
        o.text = configKey;
        o.id = configKey;
        o.selected = configKey == startConfig;
        inputs.configSelect.add(o, 1);
    }
    inputs.configSelect.addEventListener("change", (e) => {
        particleConfig.loadConfig(particleConfigs[e.target.value]);
    });
    updateInputs();
    handleResize();
    context = canvas.getContext('2d');
    CanvasRenderingContext2D.prototype.createRotatedShape = createRotatedShape;

    for(input in inputs) {
        input = inputs[input];
        input.addEventListener('change', update);
        if(input.type == "range") {
            input.addEventListener('input', updateValue);
        }
    }

    for(i = 0; i < particleConfig.particleCount; i++) {
        particles[i] = generateParticle();
    }

    particleRunner = setInterval(function() {
        if(paused) {
            return;
        }
        
        if(needsUpdate) {
            if(particleConfig.particleCount < particles.length) {
                particles.splice(0, particles.length - particleConfig.particleCount);
            } else {
                for(i = particles.length - 1; i < particleConfig.particleCount; i++) {
                    particles[i] = generateParticle();
                }
            }
            for(i = 0; i < particles.length; i++) {
                particles[i].dirX = randomFloat(particleConfig.minSpeedX, particleConfig.maxSpeedX);
                particles[i].dirY = randomFloat(particleConfig.minSpeedY, particleConfig.maxSpeedY);
                particles[i].size = randomInt(particleConfig.minSize, particleConfig.maxSize)
                particles[i].rotationRate = particleConfig.enableFixedRotation ? 0 : randomFloat(particleConfig.minRotationSpeed, particleConfig.maxRotationSpeed) * (randomBoolean() ? 1 : -1)
                particles[i].rotation = particleConfig.enableFixedRotation ? particleConfig.fixedRotation : randomInt(0, 360)
            }
            needsUpdate = false;
        }
        context.fillStyle = particleConfig.backgroundColor;
        context.fillRect(0, 0, w, h);
        context.fillStyle = particleConfig.particleColor;
        // Draw all Lines first
        particles.forEach(p => {
            p.x += p.dirX + particleConfig.directionX;
            p.y += p.dirY + particleConfig.directionY;
            if(!particleConfig.enableFixedRotation) {
                p.rotation += p.rotationRate;
            }
            if(p.x+p.size < 0) {
                p.x = window.innerWidth;
            }
            if(p.x-p.size > window.innerWidth) {
                p.x = 0;
            }
            if(p.y+p.size < 0) {
                p.y = window.innerHeight; 
            }
            if(p.y-p.size > window.innerHeight) {
                p.y = 0;
            }
        
            if(particleConfig.linesEnabled) {
                for(i = 0; i < particles.length; i++) {
                    particle = particles[i];
                    if(particle != p && distance(p, particle) < particleConfig.lineDistance) {
                        context.beginPath();
                        context.moveTo(p.x, p.y);
                        context.lineTo(particle.x, particle.y);
                        context.strokeStyle = "rgba(" + hexToRGB(particleConfig.lineColor).join(",") + "," + (-(1/particleConfig.lineDistance) * distance(p, particle) + 1) + ")";
                        context.stroke();
                        
                    }
                }
            }
        });
        // Then draw the Particles over them
        particles.forEach(particle => {
            particle.draw(context);
        });
        
    }, clockInterval);
}

function createRotatedShape(x, y, rotation, points) {
    var m = new Matrix();
    m.translate(x, y);
    m.rotate(rotation);
    centeredPoint = calculateCenter(points);
    m.translate(centeredPoint.x, centeredPoint.y);

    points.forEach(point => {
        appliedPoint = m.applyToPoint(point);
        this.lineTo(appliedPoint.x, appliedPoint.y);
    });
}

function calculateCenter(p) {
    xMin = 0,
    xMax = 0,
    yMin = 0,
    yMax = 0;
    p.forEach(point => {
        if(point.x < xMin) {
            xMin = point.x;
        }
        if(point.x > xMax) {
            xMax = point.x;
        }
        if(point.y < yMin) {
            xMin = point.y;
        }
        if(point.y > yMax) {
            yMax = point.y;
        }
    });

    return {x: -(xMin+xMax/2), y: -(yMin+yMax/2)};
}

function generateParticle() {
    return {
        x: randomInt(0, canvas.width), 
        y: randomInt(0, canvas.height),
        dirX: randomFloat(particleConfig.minSpeed, particleConfig.maxSpeed),
        dirY: randomFloat(particleConfig.minSpeed, particleConfig.maxSpeed),
        size: randomInt(particleConfig.minSize, particleConfig.maxSize),
        rotationRate: particleConfig.enableFixedRotation ? 0 : randomFloat(particleConfig.minRotationSpeed, particleConfig.maxRotationSpeed) * (randomBoolean() ? 1 : -1),
        rotation: particleConfig.enableFixedRotation ? particleConfig.fixedRotation : randomInt(0, 360),
        draw: drawParticle
    };
}

function randomBoolean() {
    return randomInt(0, 1) == 1;
}

function randomInt(min, max) {
    return Math.floor(randomFloat(min, max).toFixed(0));
}

function randomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

function distance(p1, p2) {
    return (Math.max(p1['x'], p2['x']) - Math.min(p1['x'], p2['x'])) + (Math.max(p1['y'], p2['y']) - Math.min(p1['y'], p2['y']));
}

function getAveragedDistance(p1, p2) {
    return ((Math.max(p1['x'], p2['x']) - Math.min(p1['x'], p2['x'])) / w) + ((Math.max(p1['y'], p2['y']) - Math.min(p1['y'], p2['y'])) / h);
}

function hexToRGB(h) { 
    if(h.charAt(0) == '#') {
        h = h.substring(1);
    }
    return [parseInt(h.substring(0, 2),16), parseInt(h.substring(2, 4),16), parseInt(h.substring(4, 6),16)] 
}

function handleResize() {
    canvas.width = w = window.innerWidth;
    canvas.height = h = window.innerHeight;
}

function drawParticle(context) {
    context.beginPath();
    context.strokeStyle = particleConfig.particleColor;
    stroke = false; 
    switch(particleConfig.particleShape) {
        case 'sphere':
            context.arc(this.x, this.y, this.size/2, 0, 2 * Math.PI);
            break;
        case 'square':
            context.createRotatedShape(this.x, this.y, this.rotation, particleShapes.createSquare(this.size));
            break;
        case 'triangle':
            context.createRotatedShape(this.x, this.y, this.rotation, particleShapes.createTriangle(this.size));
            break;
        case 'line':
            context.createRotatedShape(this.x, this.y, this.rotation, particleShapes.createLine(this.size));
            break;
        default:
            context.fillText("Invalid Shape", this.x, this.y);
    }
    if(particleConfig.pWireframe) {
        context.stroke();
    } else {
        context.fill();
    }
}

// Matrix Function 
function Matrix() {
    this.a = 1;
    this.b = 0;
    this.c = 0;
    this.d = 1;
    this.e = 0;
    this.f = 0;
}
  
Matrix.prototype = {
    applyToPoint: function (p) {
        return {
            x: p.x * this.a + p.y * this.c + this.e,
            y: p.x * this.b + p.y * this.d + this.f
        }
    },

    transform: function (a2, b2, c2, d2, e2, f2) {
        var a1 = this.a,
            b1 = this.b,
            c1 = this.c,
            d1 = this.d,
            e1 = this.e,
            f1 = this.f;

        this.a = a1 * a2 + c1 * b2;
        this.b = b1 * a2 + d1 * b2;
        this.c = a1 * c2 + c1 * d2;
        this.d = b1 * c2 + d1 * d2;
        this.e = a1 * e2 + c1 * f2 + e1;
        this.f = b1 * e2 + d1 * f2 + f1;
    },

    rotate: function (angle) {
        angle = angle*Math.PI/180;
        var cos = Math.cos(angle),
            sin = Math.sin(angle);
        this.transform(cos, sin, -sin, cos, 0, 0);
    },

    scale: function (sx, sy) {
        this.transform(sx, 0, 0, sy, 0, 0);
    },

    translate: function (tx, ty) {
        this.transform(1, 0, 0, 1, tx, ty);
    }
};

// User Input Handler (not related with the Particles) 
function readUserInputs() {
    particleConfig.linesEnabled = inputs.lEnabled.checked;
    particleConfig.lineDistance = parseInt(inputs.lDistance.value);
    particleConfig.particleColor = inputs.pColor.value;
    particleConfig.lineColor = inputs.lColor.value;
    particleConfig.backgroundColor = inputs.bColor.value;
    particleConfig.directionX = parseFloat(inputs.directionX.value);
    particleConfig.directionY = parseFloat(inputs.directionY.value);
    particleConfig.particleShape = inputs.pShape.value;
    particleConfig.pWireframe = inputs.pWireframe.checked;

    particleConfig.particleCount = parseInt(inputs.pCount.value);
    particleConfig.minSize = parseInt(inputs.minSize.value);
    particleConfig.maxSize = parseInt(inputs.maxSize.value);
    particleConfig.minSpeedX = parseFloat(inputs.minSpeedX.value);
    particleConfig.maxSpeedX = parseFloat(inputs.maxSpeedX.value);
    particleConfig.minSpeedY = parseFloat(inputs.minSpeedY.value);
    particleConfig.maxSpeedY = parseFloat(inputs.maxSpeedY.value);
    particleConfig.maxRotationSpeed = parseInt(inputs.maxRSpeed.value);
    particleConfig.minRotationSpeed = parseInt(inputs.minRSpeed.value);
    particleConfig.enableFixedRotation = inputs.enableFixedRotation.checked;
    particleConfig.fixedRotation = parseInt(inputs.fixedRotation.value);
}

function updateInputs() {
    inputs.pCount.value = particleConfig.particleCount;
    inputs.minSize.value = particleConfig.minSize;
    inputs.maxSize.value = particleConfig.maxSize;
    inputs.minSpeedX.value = particleConfig.minSpeedX;
    inputs.maxSpeedX.value = particleConfig.maxSpeedX;
    inputs.minSpeedY.value = particleConfig.minSpeedY;
    inputs.maxSpeedY.value = particleConfig.maxSpeedY;
    inputs.minRSpeed.value = particleConfig.minRotationSpeed;
    inputs.maxRSpeed.value = particleConfig.maxRotationSpeed;
    inputs.directionX.value = particleConfig.directionX;
    updateValue({target: inputs.directionX});
    inputs.directionY.value = particleConfig.directionY;
    updateValue({target: inputs.directionY});
    inputs.lEnabled.checked = particleConfig.linesEnabled;
    inputs.lDistance.value = particleConfig.lineDistance;
    inputs.pColor.value = particleConfig.particleColor;
    inputs.lColor.value = particleConfig.lineColor;
    inputs.bColor.value = particleConfig.backgroundColor;
    inputs.pShape.value = particleConfig.particleShape;
    inputs.pWireframe.checked = particleConfig.pWireframe;
    inputs.fixedRotation.value = particleConfig.fixedRotation;
    inputs.enableFixedRotation.checked = particleConfig.enableFixedRotation;
} 

function updateValue(e) {
    e.target.nextSibling.nodeValue = " " + e.target.value;
}

function update(user) {
    if(user) {
        readUserInputs();
    }
    needsUpdate = true;
}

function togglePause() {
    paused = !paused;
}