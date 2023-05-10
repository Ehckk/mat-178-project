let graph = null
let points = []
let mst = null
let numNodes = 4
let minNodes = 4
let maxNodes = 9

const results = {
    'algorithm': 'None',
    'edges': 0,
    'cycles': 0,
    'shortest': 1e9
}

const selectedAlgorithm = document.querySelector('.result > input[name=algorithm]')
const drawnEdges = document.querySelector('.result > input[name=edges]')
const checkedCycles = document.querySelector('.result > input[name=cycles]')
const shortestPathLength = document.querySelector('.result > input[name=shortest]')
const mstWeight = document.querySelector('.result > input[name=mst]')
const actualShortest = document.querySelector('.result > input[name=actual]')

const toDisable = "input[type=range], input[type=number], button"
function enableButtons() {
    for (const button of document.querySelectorAll(toDisable)) {
        button.classList.remove("disabled")
    }
}
function disableButtons() {
    for (const button of document.querySelectorAll(toDisable)) {
        button.classList.add("disabled")
    }
}

let pathOrder = []
let stack = []

function bruteForce(path=[0]) {
    stack.push([...path])
    if (path.length === numNodes) {
        stack.push([...path, 0])
        return
    }
    for (let v2 = 0; v2 < numNodes; v2++) {
        if (path.some(v => v === v2)) continue
        bruteForce([...path, v2])
        stack.push([...path])
    }
}

const bruteForceSet = new Set();
function noRepeats(path=[0]) {
    stack.push([...path])
    if (path.length === numNodes) {
        const pathCode = path.slice(1).join("")
        if (bruteForceSet.has(pathCode.split("").reverse().join(""))) return

        bruteForceSet.add(pathCode)
        stack.push([...path, 0])
        return
    }
    for (let v2 = 0; v2 < numNodes; v2++) {
        if (path.some(v => v === v2)) continue
        noRepeats([...path, v2])
        stack.push([...path])
    }   
}

function noRepeatsAndDP(v1, path=[0], current=0) {
    stack.push([...path])
    if (path.length === numNodes) {
        const pathCode = path.slice(1).join("")
        if (bruteForceSet.has(pathCode.split("").reverse().join(""))) return
        bruteForceSet.add(pathCode)

        if (current + graph[v1][0] > bestDistFound) return
        bestDistFound = current + graph[v1][0]
        stack.push([...path, 0])
        return
    }
    for (let v2 = 0; v2 < numNodes; v2++) {
        if (path.some(v => v === v2)) continue
        if (current + graph[v1][v2] > bestDistFound) continue
        noRepeatsAndDP(v2, [...path, v2], current + graph[v1][v2])
        stack.push([...path])
    }   
}

function nearestNeighbors(path=[0]) {
    stack.push([...path])
    while (path.length < graph.length) {
        const v1 = path[path.length - 1]
        const edges = []
        for (let v2 = 0; v2 < graph.length; v2++) {
            if (v1 === v2) continue
            if (path.some(v => v === v2)) continue
            edges.push([v1, v2])
            stack.push([...path, v2])
        }
        edges.sort((a, b) => graph[a[0]][a[1]] - graph[b[0]][b[1]])
        path.push(edges[0][1])
        stack.push([...path])
    }
    path.push(0)
}

function prims() { // To get the MST
    mst = []
    const vertices = [0]
    let edges = []
    
    while (vertices.length < graph.length) {
        edges = []
        for (const i of vertices) {
            for (let j = 0; j < graph.length; j++) {
                if (i === j) continue
                if (vertices.some(v => v === j) && vertices.some(v => v === i)) continue
                edges.push([i, j])
            }
        }
        edges.sort((a, b) => graph[a[0]][a[1]] - graph[b[0]][b[1]])
        mst.push(edges[0])
        vertices.push(edges[0][1])
    }
}

let currentPath = []
let bestPathFound = []
let actualBestPath = []
let estimate = []

let currentDist = 0
let bestDistFound = 1e9
let actualBestDist = 1e9
let finished = false

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

function resetMetrics() {
    pathOrder = []
    stack = []
}
function resestBestPaths() {
    bestPathFound = []
    bestDistFound = 1e9
}
const runBtn = document.querySelector('button.run')
runBtn.addEventListener('click', () => {
    disableButtons()
    resetMetrics()
    const selected = document.querySelector('input[type=radio]:checked').value;
    selectedAlgorithm.value = document.querySelector(`label[for=${selected}]`).innerHTML
    drawnEdges.value = 0
    checkedCycles.value = 0
    shortestPathLength.value = bestDistFound
    switch (selected) {
        case 'naive':
            resestBestPaths()
            bruteForce()
            break;
        case 'unique':
            resestBestPaths()
            bruteForceSet.clear()
            noRepeats()
            break;
        case 'dp':
            resestBestPaths()
            bruteForceSet.clear()
            noRepeatsAndDP(0)
            bestDistFound = 1e9
            break;
        // case 'nearest':
        //     estimate = []
        //     nearestNeighbors()
        //     break;
    }
    while (stack.length > 0) {
        pathOrder.push(stack.pop())
    }

    currentPath = pathOrder.pop()
    drawGraph()
})

init()
drawGraph()