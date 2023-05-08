const info = {
    'naive': [
        'Loop over every possible Hamiltonian Cycle', 
        'Uses Recursive Backtracking'
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
        'Instead'
    ],
    'mst': [
        'Do not loop over cycles',
        'Instead, using Prim\'s Algorithm, find the minimum weight spanning tree of the graph, starting from node 0', 
        'Double the weight of the found MST',
        'The weight of the shortest possible Hamiltonian Cycle will be no more than double this number'
    ]
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