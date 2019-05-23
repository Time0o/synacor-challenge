'use strict';

var cytoscape = require('cytoscape');
var cycola = require('cytoscape-cola');

cytoscape.use(cycola);

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
    // TODO
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

cy.layout({ name: 'cola', nodeSpacing: 100 }).run();
