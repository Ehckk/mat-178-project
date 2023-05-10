const info = {
    'naive': [
        'Loop over every possible Hamiltonian Cycle', 
        'Choose the cycle with the lowest weight to get the shortest path'
    ],
    'unique': [
        'Works similar to the brute force approach, with one key difference',
        'When a cycle is found, if the cycle matches a previously stored cycle, then disregard it, otherwise store it in memory'
    ],
    'dp': [
        'Works similar to the brute force approach, with two key differences',
        'When checking an edge, if, when added to the cycle, the distance of the path is greater than shortest path found, disregard it',
        'When a cycle is found, if the cycle matches a previously stored cycle, then disregard it, otherwise store it in memory'
    ],
    'nearest': [
        'Do not loop over cycles', 
        'Instead, estimate the shortest path by starting at a vertex and adding the shortest edge that connects to an unvisted vertex to the cycle',
        'When all vertices have been visited, return to the starting vertex and you will have an estimate for the shortest path',
        'Use the minimum spanning tree of the graph as a lower bound for the shortest tour'
    ],
}

function setInfoBox(key) {
    const infoBox = document.querySelector('div.info_box')
    infoBox.innerHTML = ''
    
    const title = document.createElement('h3')
    title.innerHTML = document.querySelector(`label[for=${key}]`).innerHTML
    infoBox.appendChild(title)
    
    for (const text of info[key]) {
        const paragraph = document.createElement('p')
        paragraph.innerHTML = text
        infoBox.appendChild(paragraph)
    }
}

for (const button of document.querySelectorAll('input[type=radio]')) {
    button.addEventListener('change', () => {
        if (button !== document.querySelector('input[type=radio]:checked')) return
        setInfoBox(button.value)
    })
}
setInfoBox('naive')