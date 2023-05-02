let graph = null
let points = []
let numNodes = 7
let minNodes = 4
let maxNodes = 9

const canvas = document.querySelector('canvas')
const { width, height } = canvas

const root = document.querySelector(':root')
const blue = getComputedStyle(root).getPropertyValue('--p-500')
const black = getComputedStyle(root).getPropertyValue('--a-black')
const white = getComputedStyle(root).getPropertyValue('--s-900')
const green = getComputedStyle(root).getPropertyValue('--a-green')
const red = getComputedStyle(root).getPropertyValue('--a-red')
const interval = 5

const padding = 20
const bounds = { 
    xMin: padding, 
    xMax: width - padding, 
    yMin: padding, 
    yMax: height - padding 
}

let tick = 0
let target = 0
let timer

const selectedAlgorithm = document.querySelector('.result > input[name=algorithm]')
const drawnEdges = document.querySelector('.result > input[name=edges]')
const checkedCycles = document.querySelector('.result > input[name=cycles]')
const shortestPathLength = document.querySelector('.result > input[name=shortest]')

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

function enableButtons() {
    document.querySelectorAll("input[type=range], input[type=number], button").forEach((button) => button.classList.remove("disabled"))
}

function disableButtons() {
    document.querySelectorAll("input[type=range], input[type=number], button").forEach((button) => button.classList.add("disabled"))
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

function initGraph(numNodes) {
    const adjList = new Map();
    for (let i = 0; i < numNodes; i++) {
        adjList.set(i, [])
        const { x: x1, y: y1 } = points[i] // 1st point
        for (let j = 0; j < numNodes; j++) {
            if (i === j) continue // No loops/cycles
            const { x: x2, y: y2 } = points[j] // 2nd point
            const dist = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2)) // Distance between points
            adjList.get(i).push([j, dist]) // Add weighted connection 
        }
    }
    return adjList
}

function initAdjMatrix() {
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

function drawPoint(ctx, x, y, i) { // Function to draw a vertex
    ctx.beginPath()
    ctx.moveTo(x, y)
    
    ctx.fillStyle = black // Outer black circle
    ctx.arc(x, y, 20, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = blue // Inner blue circle
    ctx.arc(x, y, 15, 0, Math.PI * 2)
    ctx.fill()
    
    ctx.fillStyle = white // Text
    ctx.fillText(i, x, y + 6)
}

function drawEdge(ctx, v1, v2, color=black) {
    ctx.strokeStyle = color
    ctx.beginPath()
    const { x: x1, y: y1 } = points[v1]
    const { x: x2, y: y2 } = points[v2]
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke() 
}

function drawPath(ctx, path, lineWidth, color, count=false, countDist=false) {
    ctx.lineWidth = lineWidth
    let i = 0;
    let j = 1;
    while (j < path.length) {
        drawEdge(ctx, path[i], path[j], color)
        if (count) drawnEdges.value++
        if (countDist) {
            for (const [v2, dist] of graph.get(i)) {
                if (v2 !== j) continue
                currentDist += dist
            }
        }
        i++;
        j++;
    }
}

let pathOrder = []
let stack = []

function bruteForce(v1, path=[0]) {
    stack.push([...path])
    if (path.length === numNodes) {
        stack.push([...path, 0])
        return
    }
    for (const [v2, dist] of graph.get(v1)) {
        if (path.some(v => v === v2)) continue
        bruteForce(v2, [...path, v2])
        stack.push([...path])
    }
}

let currentPath = []
let bestPath = []

let currentDist = 0
let bestDist = 1e9
let finished = false

function drawGraph() {
    finished = false
    currentDist = 0
    const ctx = canvas.getContext('2d')
    ctx.font = "16px sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "baseline"
    ctx.lineWidth = 1
    ctx.clearRect(0, 0, width, height)

    for (let v1 = 0; v1 < numNodes; v1++) {
        for (const [v2, dist] of graph.get(v1)) {
            drawEdge(ctx, v1, v2)
        }
    }
    // if (bestPath.length > 0) {
    //     drawPath(ctx, bestPath, 3, green)
    // }

    if (currentPath.length > 0) {
        const countDist = currentPath.length === numNodes + 1
        drawPath(ctx, currentPath, 2, red, true, countDist)
        // console.log(currentPath.length, numNodes + 1)
        if (currentPath.length === numNodes + 1) {
            checkedCycles.value++ 
            // console.log([currentPath.join(" "), bestPath.join(" ")].join("\n"))
            // if (currentDist < bestDist) {
            //     bestPath = currentPath.map(x => x)
            //     bestDist = parseInt(currentDist)
            //     shortestPathLength.value = bestDist
            // }
        }
    }

    for (const [i, point] of points.entries()) {
        const { x, y } = point
        drawPoint(ctx, x, y, i)
    }

    pathOrder.length === 0 ? finished = true : currentPath = pathOrder.pop()

    if (finished) {
        enableButtons()
        return
    }    
    setTimeout(() => window.requestAnimationFrame(drawGraph), interval)
}
 
function init() {
    points = initPoints(numNodes)
    graph = initGraph(numNodes)
    pathOrder = []
    stack = []
    bestPath = []
    bestDist = 1e9
    currentPath = []
    currentDist = 0
    drawGraph()
}

const numNodesSlider = document.querySelector('div.num_slider > input[name=node_count]')
const numNodesInput = document.querySelector('div.num_input > input[name=node_count]')

numNodesSlider.addEventListener('input', (e) => {
    numNodes = parseInt(e.target.value)
    numNodesInput.value = numNodes
})

numNodesInput.addEventListener('input', (e) => {
    if (e.target.value !== '') {
        if (e.target.value > maxNodes) {
            e.target.value = maxNodes
            return
        }
        if (e.target.value < minNodes) {
            e.target.value = minNodes
            return
        }
        numNodes = parseInt(e.target.value)
        numNodesSlider.value = numNodes
    }
})

numNodesInput.addEventListener('change', (e) => {
    if (e.target.value !== '') return
    numNodes = minNodes
    numNodesInput.value = numNodes
    numNodesSlider.value = numNodes
})

const numNodesIncBtn = document.querySelector('div.num_input > button.inc')

numNodesIncBtn.addEventListener('click', () => {
    if (numNodes === maxNodes) return
    numNodes += 1
    numNodesSlider.value = numNodes
    numNodesInput.value = numNodes
})

const numNodesDecBtn = document.querySelector('div.num_input > button.dec')

numNodesDecBtn.addEventListener('click', () => {
    if (numNodes === minNodes) return
    numNodes -= 1
    numNodesSlider.value = numNodes
    numNodesInput.value = numNodes
})

const shuffleBtn = document.querySelector('button.shuffle')
shuffleBtn.addEventListener('click', () => {
    init()
})

function resetMetrics() {
    pathOrder = []
    stack = []
    bestPath = []
    bestDist = 1e9
}

const runBtn = document.querySelector('button.run')
runBtn.addEventListener('click', () => {
    disableButtons()
    resetMetrics()

    selectedAlgorithm.value = 'Brute Force'
    drawnEdges.value = 0
    checkedCycles.value = 0
    shortestPathLength.value = bestDist

    bruteForce(0) // Replace with switch between different algos
    while (stack.length > 0) {
        pathOrder.push(stack.pop())
    }

    currentPath = pathOrder.pop()
    drawGraph()
})

init()
drawGraph()

const matrix = initAdjMatrix()
console.log(matrix.map((row) => row.join("\t")).join("\n"))