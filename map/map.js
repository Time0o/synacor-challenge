'use strict';

var cytoscape = require('cytoscape');
var cose = require('cytoscape-cose-bilkent');

cytoscape.use(cose);

/******************************************************************************
 * adjacency lists
 ******************************************************************************/

const adjDefault = {
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
        ['continue', 'fumbling_around_in_the_darkness1'],
        ['continue (with lamp)', 'dark_passage1']
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
    dark_passage1: [
        ['east', 'passage2'],
        ['west', 'dark_passage2']
    ],
    dark_passage2: [
        ['east', 'dark_passage1'],
        ['west', 'dark_passage3']
    ],
    dark_passage3: [
        ['east', 'dark_passage2'],
        ['west', 'ruins1']
    ],
    ruins1: [
        ['east', 'dark_passage3'],
        ['north', 'ruins2']
    ],
    ruins2: [
        ['north', 'ruins3'],
        ['south', 'ruins1']
    ],
    ruins3: [
        //['north', ''], // TODO
        ['south', 'ruins2'],
        ['east', 'ruins4'],
        ['west', 'ruins6']
    ],
    ruins4: [
        ['west', 'ruins3'],
        ['down', 'ruins5']
    ],
    ruins5: [
        ['up', 'ruins4']
    ],
    ruins6: [
        ['up', 'ruins7'],
        ['east', 'ruins3']
    ],
    ruins7: [
        ['down', 'ruins6']
    ]
};

const adjTwisty = {
    twisty_passages1: [
        ['ladder', 'passage1'],
        ['north', 'twisty_passages2'],
        ['south', 'twisty_passages3'],
        ['east', 'twisty_passages4'],
        ['west', 'twisty_passages5']
    ],
    twisty_passages2: [
        ['north', 'twisty_passages3'],
        ['south', 'twisty_passages1'],
        ['west', 'twisty_passages2']
    ],
    twisty_passages3: [
        ['north', 'twisty_passages1'],
        ['south', 'twisty_passages2'],
        ['east', 'twisty_passages3']
    ],
    twisty_passages4: [
        ['north', 'twisty_passages6'],
        ['south', 'twisty_passages4'],
        ['east', 'twisty_passages7'],
        ['west', 'twisty_passages1']
    ],
    twisty_passages5: [
        ['north', 'twisty_passages5'],
        ['south', 'twisty_passages8'],
        ['east', 'twisty_passages1']
    ],
    twisty_passages6: [
        ['north', 'twisty_passages3'],
        ['east', 'twisty_passages2'],
        ['south', 'twisty_passages6']
    ],
    twisty_passages7: [
        // TODO
    ],
    twisty_passages8: [
        ['north', 'twisty_passages9'],
        ['south', 'twisty_passages2'],
        ['east', 'twisty_passages7'],
        ['west', 'twisty_passages3']
    ],
    twisty_passages9: [
        ['west', 'twisty_passages1']
    ]
};

/******************************************************************************
 * styles and layouts
 ******************************************************************************/

const styleDefault = './map_default.style';
const styleTwisty = './map_twisty_passages.style';

const layoutDefault = {
    name: 'cose-bilkent',
    idealEdgeLength: 100,
    animate: true
}

const layoutTwisty = {
    name: 'circle',
    spacingFactor: 1.5,
    animate: true
}

/******************************************************************************
 * graph construction helper functions
 ******************************************************************************/

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

function edgeName(dir) {
    return wrapText(dir, 12);
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

function resetGraph() {
    cy.elements().remove();

    addNode.existing = undefined;
}

function buildGraph(adj, styleFile, layout) {
    resetGraph();

    for (var from in adj) {
        addNode(from);

        adj[from].forEach(function (edge) {
            var dir = edge[0];
            var target = edge[1];

            // don't include self loops
            if (target != from) {
                addNode(target);

                cy.add({
                    data: {
                        name: edgeName(dir),
                        source: from,
                        target: target
                    }
                });
            }
        });
    }

    fetch(styleFile)
        .then(response => response.text())
        .then(style => {
            cy.style(style);
            cy.layout(layout).run();
        });
}

/******************************************************************************
 * create graph
 ******************************************************************************/

var cy = cytoscape({
    container: document.getElementById('cy'),
});

buildGraph(adjDefault, styleDefault, layoutDefault);

/******************************************************************************
 * expand twisty passages on demand
 ******************************************************************************/

var twistyExpanded = false;

cy.on('click', 'node', function(evt) {
    var nodeId = this.id();

    if (!twistyExpanded) {
        if (nodeId.startsWith('twisty_passages')) {
            buildGraph(adjTwisty, styleTwisty, layoutTwisty);
            twistyExpanded = true;
        }
    } else {
        if (nodeId.startsWith('passage')) {
            buildGraph(adjDefault, styleDefault, layoutDefault);
            twistyExpanded = false;
        }
    }
});
