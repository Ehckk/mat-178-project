function randomValue(minValue, maxValue) {
    return minValue + Math.ceil(Math.random() * (maxValue - minValue))
} 

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const temp = array[i]
        array[i] = array[j]
        array[j] = temp
    }
}

function initPoints(numNodes) {
    const points = Array(numNodes).fill(null) // Array to store the points
    const xCenter = width / 2 // X coordinate center
    const yCenter = height / 2 // Y coordinate center
    const incAngle = (2 * Math.PI) / numNodes // Angle to increment by
    let angle = randomValue(0, 2 * Math.PI)

    for (let i = 0; i < numNodes; i++) {
        const dist = randomValue(padding, xCenter - padding)
        const x = parseInt(Math.cos(angle) * dist + xCenter)
        const y = parseInt(Math.sin(angle) * dist + yCenter)
        points[i] = { x, y }
        angle += incAngle
    }
    shuffle(points)
    return points
}

function initAdjMatrix(numNodes) {
    const adjMatrix = []
    for (let i = 0; i < numNodes; i++) {
        adjMatrix.push(Array(numNodes).fill(0))
        const { x: x1, y: y1 } = points[i] // 1st point
        for (let j = 0; j < numNodes; j++) {
            if (i === j) continue // No loops/cycles
            const { x: x2, y: y2 } = points[j] // 2nd point
            const dist = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2)) // Distance between points
            adjMatrix[i][j] = parseInt(dist) // Add weighted connection 
        }
    }
    return adjMatrix
}

const actualSet = new Set()
function getBestDistAndPath(v1, path=[0], current=0) {
    if (path.length === numNodes) {
        const pathCode = path.slice(1).join("")

        if (actualSet.has(pathCode.split("").reverse().join(""))) return
        actualSet.add(pathCode)

        if (current + graph[v1][0] > actualBestDist) return

        actualBestDist = current + graph[v1][0]
        actualBestPath = [...path, 0]
        return
    }
    for (let v2 = 0; v2 < numNodes; v2++) {
        if (path.some(v => v === v2)) continue
        if (current + graph[v1][v2] > actualBestDist) continue

        getBestDistAndPath(v2, [...path, v2], current + graph[v1][v2])
    } 
}

function init() {
    points = initPoints(numNodes)
    graph = initAdjMatrix(numNodes)
    pathOrder = []
    stack = []
    bestPathFound = []
    bestDistFound = 1e9

    actualBestDist = 1e9
    actualSet.clear()
    getBestDistAndPath(0, [0], 0)
    actualShortest.value = actualBestDist
    
    currentPath = []
    currentDist = 0
    drawGraph()
}

const shuffleBtn = document.querySelector('button.shuffle')
shuffleBtn.addEventListener('click', () => init())