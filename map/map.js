'use strict';

var cytoscape = require('cytoscape');
var cose = require('cytoscape-cose-bilkent');

cytoscape.use(cose);

var cy = cytoscape({
    container: document.getElementById('cy'),
    style: [
        {
            selector: 'node',
            style: {
                label: 'data(id)',
                shape: 'hexagon',
                'height': 100,
                'width': 100,
                'text-valign': 'center'
            }
        },
        {
            selector: 'edge',
            style: {
                label: function(label) {
                    // dirty hack that enables parallel edge labels
                    return (label.data().dir + "\n\n\u2060")
                },
                'curve-style': 'bezier',
                'control-point-step-size': 100,
                'text-rotation': 'autorotate',
                'text-wrap': 'wrap'
            }
        }
    ]
});

var adj = {
    'Foothills (1)': [
        ['doorway', 'Dark cave (1)'],
        ['south', 'Foothills (2)']
    ],
    'Foothills (2)': [
        ['north', 'Foothills (1)']
    ],
    'Dark cave (1)': [
        ['south', 'Foothills (1)'],
        ['north', 'Dark cave (2)']
    ],
    'Dark cave (2)': [
        ['south', 'Dark cave (1)'],
        ['north', 'Dark cave (3)']
    ],
    'Dark cave (3)': [
        ['south', 'Dark cave (2)'],
        ['bridge', 'Rope bridge (1)']
    ],
    'Rope bridge (1)': [
        ['back', 'Dark cave (3)'],
        ['continue', 'Falling through the Air!']
    ],
    'Falling through the Air!': [
        ['down', 'Moss cavern (1)']
    ],
    'Moss cavern (1)': [
        ['west', 'Moss cavern (2)'],
        ['east', 'Moss cavern (3)']
    ],
    'Moss cavern (2)': [
        ['east', 'Moss cavern (1)'],
        ['passage', 'Passage (1)']
    ],
    'Moss cavern (3)': [
        ['west', 'Moss cavern (1)']
    ],
    'Passage (1)': [
        ['cavern', 'Moss cavern (2)'],
        ['ladder', 'Twisty passages (1)'],
        ['darkness', 'Passage (2)']
    ],
    'Passage (2)': [
        ['back', 'Passage (1)'],
        ['continue', 'Fumbling around in the darkness (1)']
    ],
    'Fumbling around in the darkness (1)': [
        ['forward', 'Fumbling around in the darkness (2)'],
        ['back', 'Fumbling around in the darkness (2)']
    ],
    'Fumbling around in the darkness (2)': [
        ['run', 'Panicked and lost'],
        ['investigate', 'Panicked and lost']
    ],
    'Panicked and lost': [
        ['run', 'You have been eaten by a grue'],
        ['wait', 'You have been eaten by a grue'],
        ['hide', 'You have been eaten by a grue']
    ],
};

function addNode(node) {
    if (typeof addNode.existing == 'undefined')
        addNode.existing = new Set();

    if (!addNode.existing.has(node)) {
        cy.add({ data: { id: node } });
        addNode.existing.add(node);
    }
}

for (var from in adj) {
    addNode(from);

    adj[from].forEach(function (edge) {
        var dir = edge[0];
        var target = edge[1];

        addNode(target);

        cy.add({
            data: {
                dir: dir,
                source: from,
                target: target
            }
        });
    });
}

cy.layout({ name: 'cose-bilkent', idealEdgeLength: 100 }).run();
