'use strict';

var cytoscape = require('cytoscape');
var cose = require('cytoscape-cose-bilkent');

cytoscape.use(cose);

var cy = cytoscape({
    container: document.getElementById('cy'),
});

var adj = {
    foothills1: [
        ['doorway', 'dark_cave1'],
        ['south', 'foothills2']
    ],
    foothills2: [
        ['north', 'foothills1']
    ],
    dark_cave1: [
        ['south', 'foothills1'],
        ['north', 'dark_cave2']
    ],
    dark_cave2: [
        ['south', 'dark_cave1'],
        ['north', 'dark_cave3']
    ],
    dark_cave3: [
        ['south', 'dark_cave2'],
        ['bridge', 'rope_bridge1']
    ],
    rope_bridge1: [
        ['back', 'dark_cave3'],
        ['continue', 'falling_through_the_air']
    ],
    falling_through_the_air: [
        ['down', 'moss_cavern1']
    ],
    moss_cavern1: [
        ['west', 'moss_cavern2'],
        ['east', 'moss_cavern3']
    ],
    moss_cavern2: [
        ['east', 'moss_cavern1'],
        ['passage', 'passage1']
    ],
    moss_cavern3: [
        ['west', 'moss_cavern1']
    ],
    passage1: [
        ['cavern', 'moss_cavern2'],
        ['ladder', 'twisty_passages1'],
        ['darkness', 'passage2']
    ],
    passage2: [
        ['back', 'passage1'],
        ['continue', 'fumbling_around_in_the_darkness1']
    ],
    fumbling_around_in_the_darkness1: [
        ['forward', 'fumbling_around_in_the_darkness2'],
        ['back', 'fumbling_around_in_the_darkness2']
    ],
    fumbling_around_in_the_darkness2: [
        ['run', 'panicked_and_lost'],
        ['investigate', 'panicked_and_lost']
    ],
    panicked_and_lost: [
        ['run', 'you_have_been_eaten_by_a_grue'],
        ['wait', 'you_have_been_eaten_by_a_grue'],
        ['hide', 'you_have_been_eaten_by_a_grue']
    ],
};

function wrapText(text, maxWidth, delim='\n') {
    if (text.length <= maxWidth)
        return text;

    var i = maxWidth;
    while (i > 0 && text[i] != ' ')
        --i;

    if (i > 0) {
        var line = text.substring(0, i);
        var remainder = text.substring(i + 1);

        return line + delim + wrapText(remainder, maxWidth, delim);
    }
}

function nodeName(id) {
    // remove numbering
    name = id.replace(/\d*$/, '');

    // replace underscores with spaces
    name = name.replace(/_/g, ' ');

    // capitalize
    name = name.charAt(0).toUpperCase() + name.slice(1);

    // wrap long names
    name = wrapText(name, 15);

    return name;
}

function addNode(node) {
    if (typeof addNode.existing == 'undefined')
        addNode.existing = new Set();

    if (!addNode.existing.has(node)) {
        cy.add({
            data: {
                id: node,
                name: nodeName(node)
            }
        });
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
                name: dir + '\n\n\u2060',
                source: from,
                target: target
            }
        });
    });
}

const layout = {
    name: 'cose-bilkent',
    idealEdgeLength: 100
}

fetch('./map.style')
    .then(response => response.text())
    .then(style => {
        cy.style(style);
        cy.layout(layout).run();
    });
