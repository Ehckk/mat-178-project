const canvas = document.querySelector('canvas')
const { width, height } = canvas

const root = document.querySelector(':root')
const colors = {
    'blue': getComputedStyle(root).getPropertyValue('--p-500'),
    'black': getComputedStyle(root).getPropertyValue('--a-black'),
    'white': getComputedStyle(root).getPropertyValue('--s-900'),
    'green': getComputedStyle(root).getPropertyValue('--a-green'),
    'yellow': getComputedStyle(root).getPropertyValue('--a-yellow'),
    'red': getComputedStyle(root).getPropertyValue('--a-red')
}
const interval = 1
const vSize = 10
const padding = 20
const bounds = { 
    xMin: padding, 
    xMax: width - padding, 
    yMin: padding, 
    yMax: height - padding 
}

function drawPoint(ctx, x, y, i) { // Function to draw a vertex
    ctx.beginPath()
    ctx.moveTo(x, y)

    ctx.fillStyle = colors['blue'] // Inner blue circle
    ctx.arc(x, y, vSize, 0, Math.PI * 2)
    ctx.fill()
    
    ctx.fillStyle = colors['white'] // Text
    ctx.fillText(i, x, y + 3)
}

function drawEdge(ctx, v1, v2, color=colors['black']) {
    ctx.strokeStyle = color
    ctx.beginPath()
    const { x: x1, y: y1 } = points[v1]
    const { x: x2, y: y2 } = points[v2]
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke() 
}

function drawPath(ctx, path, lineWidth, color, count=false, dist=false) {
    ctx.lineWidth = lineWidth
    let i = 0;
    let j = 1;
    while (j < path.length) {
        let v1 = path[i]
        let v2 = path[j === path.length - 1 ? 0 : j]
        drawEdge(ctx, v1, v2, color)
        if (count) drawnEdges.value++
        if (dist) currentDist += graph[v1][v2]
        i++;
        j++;
    }
}

function drawGraph() {
    finished = false
    currentDist = 0
    const ctx = canvas.getContext('2d')
    ctx.font = "32px sans-serif bold"
    ctx.textAlign = "center"
    ctx.textBaseline = "baseline"
    ctx.lineWidth = 1
    ctx.clearRect(0, 0, width, height)

    for (let v1 = 0; v1 < numNodes; v1++) {
        for (let v2 = v1 + 1; v2 < numNodes; v2++) {
            drawEdge(ctx, v1, v2)
        }
    }
    drawPath(ctx, actualBestPath, 2.5, colors['green'])
    
    if (bestPathFound.length > 0) {
        drawPath(ctx, bestPathFound, 2, colors['yellow'])
    }

    if (currentPath.length > 0) {
        drawPath(ctx, currentPath, 2, colors['red'], true, currentPath.length === numNodes + 1)

        if (currentPath.length === numNodes + 1) {
            checkedCycles.value++ 
            if (currentDist < bestDistFound) {
                bestPathFound = currentPath.map(x => x)
                bestDistFound = currentDist
                shortestPathLength.value = bestDistFound
            }
        }
    }

    for (const [i, point] of points.entries()) {
        const { x, y } = point
        drawPoint(ctx, x, y, i)
    }

    pathOrder.length === 0 ? finished = true : currentPath = pathOrder.pop()

    if (!finished) {
        return setTimeout(() => window.requestAnimationFrame(drawGraph), interval)
    } 
    enableButtons()
}