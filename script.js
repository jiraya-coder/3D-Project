const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Define stick figure man parts
const stickMan = {
    head: [0, -1.5, 0],
    body: [0, 0, 0],
    leftArm: [-1, -0.5, 0],
    rightArm: [1, -0.5, 0],
    leftLeg: [-0.5, 1.5, 0],
    rightLeg: [0.5, 1.5, 0]
};

let fNear = 0.1;
let fFar = 1000;
let fFov = 90;
let fAspectRatio = canvas.height / canvas.width;
let fFovRad = 1 / Math.tan(fFov * 0.5 / 180 * Math.PI);

let projectionMatrix = [
    [fAspectRatio * fFovRad, 0, 0, 0],
    [0, fFovRad, 0, 0],
    [0, 0, fFar / (fFar - fNear), 1],
    [0, 0, (-fFar * fNear) / (fFar - fNear), 0]
];

function multiplyMatrixVector(i, m) {
    let o = [0, 0, 0];
    o[0] = i[0] * m[0][0] + i[1] * m[1][0] + i[2] * m[2][0] + m[3][0];
    o[1] = i[0] * m[0][1] + i[1] * m[1][1] + i[2] * m[2][1] + m[3][1];
    o[2] = i[0] * m[0][2] + i[1] * m[1][2] + i[2] * m[2][2] + m[3][2];
    let w = i[0] * m[0][3] + i[1] * m[1][3] + i[2] * m[2][3] + m[3][3];

    if (w !== 0) {
        o[0] /= w; o[1] /= w; o[2] /= w;
    }
    return o;
}

function mainLoop(timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;

    let rotationY = timestamp * 0.001;

    let projectedPoints = {};

    for (let part in stickMan) {
        let point = stickMan[part];
        
        // Rotate around Y-axis
        let rotated = [
            point[0] * Math.cos(rotationY) + point[2] * Math.sin(rotationY),
            point[1],
            -point[0] * Math.sin(rotationY) + point[2] * Math.cos(rotationY)
        ];

        // Move the man back so we can see him
        rotated[2] += 5;

        // Project
        let projected = multiplyMatrixVector(rotated, projectionMatrix);

        // Scale and translate
        projected[0] = projected[0] * canvas.width * 0.25 + canvas.width * 0.5;
        projected[1] = projected[1] * canvas.height * 0.25 + canvas.height * 0.5;

        projectedPoints[part] = projected;
    }

    // Draw stick man
    ctx.beginPath();
    // Head
    ctx.arc(projectedPoints.head[0], projectedPoints.head[1], 20, 0, Math.PI * 2);
    // Body
    ctx.moveTo(projectedPoints.body[0], projectedPoints.body[1]);
    ctx.lineTo(projectedPoints.head[0], projectedPoints.head[1]);
    // Arms
    ctx.moveTo(projectedPoints.leftArm[0], projectedPoints.leftArm[1]);
    ctx.lineTo(projectedPoints.body[0], projectedPoints.body[1]);
    ctx.lineTo(projectedPoints.rightArm[0], projectedPoints.rightArm[1]);
    // Legs
    ctx.moveTo(projectedPoints.leftLeg[0], projectedPoints.leftLeg[1]);
    ctx.lineTo(projectedPoints.body[0], projectedPoints.body[1]);
    ctx.lineTo(projectedPoints.rightLeg[0], projectedPoints.rightLeg[1]);
    ctx.stroke();

    requestAnimationFrame(mainLoop);
}

mainLoop(0);

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    fAspectRatio = canvas.height / canvas.width;
    projectionMatrix[0][0] = fAspectRatio * fFovRad;
});