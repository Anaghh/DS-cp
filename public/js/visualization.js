let beforeNetwork = null;
let afterNetwork = null;

// Modern dark theme colors
const graphColors = {
    debtor: { background: '#ef4444', border: '#dc2626', highlight: { background: '#f87171', border: '#ef4444' } },
    creditor: { background: '#22c55e', border: '#16a34a', highlight: { background: '#4ade80', border: '#22c55e' } },
    neutral: { background: '#64748b', border: '#475569', highlight: { background: '#94a3b8', border: '#64748b' } },
    edge: '#64748b',
    edgeHighlight: '#00d4ff',
    settlement: '#22c55e',
    settlementHighlight: '#4ade80'
};

function drawGraphs() {
    if (transactions.length === 0) {
        document.getElementById('before-info').textContent = 'Add transactions to see graph';
        document.getElementById('after-info').textContent = 'Add transactions to see graph';
        return;
    }

    calculateNetBalances();
    drawBeforeGraph();
    drawAfterGraph();
}

function drawBeforeGraph() {
    // Create nodes for each person
    const nodes = new vis.DataSet();
    const edges = new vis.DataSet();

    // Get all unique people
    const people = new Set();
    transactions.forEach(t => {
        people.add(t.from);
        people.add(t.to);
    });

    // Add nodes with balance information
    people.forEach(person => {
        const balance = netBalances[person] || 0;
        let color, title, shadowColor;
        
        if (balance < 0) {
            color = graphColors.debtor;
            shadowColor = 'rgba(239, 68, 68, 0.5)';
            title = `${person}\nOwes: $${Math.abs(balance)}`;
        } else if (balance > 0) {
            color = graphColors.creditor;
            shadowColor = 'rgba(34, 197, 94, 0.5)';
            title = `${person}\nOwed: $${balance}`;
        } else {
            color = graphColors.neutral;
            shadowColor = 'rgba(100, 116, 139, 0.5)';
            title = `${person}\nBalanced`;
        }

        nodes.add({
            id: person,
            label: `${person}\n$${balance}`,
            color: color,
            title: title,
            shape: 'circle',
            font: { size: 14, color: '#ffffff', face: 'Inter, sans-serif', bold: true },
            widthConstraint: { maximum: 100 },
            shadow: { enabled: true, color: shadowColor, size: 15, x: 0, y: 0 },
            borderWidth: 2,
            borderWidthSelected: 3
        });
    });

    // Add edges for each transaction
    transactions.forEach((t, index) => {
        edges.add({
            id: index,
            from: t.from,
            to: t.to,
            label: `$${t.amount}`,
            title: `${t.from} → ${t.to}: $${t.amount}`,
            arrows: { to: { enabled: true, scaleFactor: 0.8 } },
            color: { color: graphColors.edge, highlight: graphColors.edgeHighlight, opacity: 0.8 },
            font: { align: 'middle', size: 12, color: '#94a3b8', strokeWidth: 0 },
            smooth: { type: 'curvedCW', roundness: 0.2 },
            width: 2,
            shadow: { enabled: true, color: 'rgba(0, 0, 0, 0.3)', size: 5 }
        });
    });

    const options = {
        physics: {
            enabled: true,
            stabilization: { iterations: 200 },
            solver: 'forceAtlas2Based',
            forceAtlas2Based: {
                gravitationalConstant: -50,
                centralGravity: 0.01,
                springLength: 200
            }
        },
        interaction: {
            navigationButtons: true,
            keyboard: true,
            zoomView: true,
            dragView: true,
            hover: true
        },
        nodes: {
            chosen: {
                node: function(values) {
                    values.shadowSize = 25;
                }
            }
        }
    };

    const container = document.getElementById('graph-before');
    beforeNetwork = new vis.Network(container, { nodes, edges }, options);
    
    document.getElementById('before-info').textContent = 
        `${people.size} people, ${transactions.length} transactions`;
}

function drawAfterGraph() {
    // Only draw if we have results
    if (!allResults.algorithms) {
        document.getElementById('after-info').textContent = 'Run algorithms to see simplified graph';
        return;
    }

    const nodes = new vis.DataSet();
    const edges = new vis.DataSet();

    // Get settlements from Algorithm 1 (Greedy)
    const algo1Result = allResults.algorithms[1];
    if (!algo1Result || algo1Result.error) {
        document.getElementById('after-info').textContent = 'Error getting results';
        return;
    }

    // Get all unique people
    const people = new Set();
    transactions.forEach(t => {
        people.add(t.from);
        people.add(t.to);
    });

    // Add nodes
    people.forEach(person => {
        const balance = netBalances[person] || 0;
        let color, title, shadowColor;
        
        if (balance < 0) {
            color = graphColors.debtor;
            shadowColor = 'rgba(239, 68, 68, 0.5)';
            title = `${person}\nOwes: $${Math.abs(balance)}`;
        } else if (balance > 0) {
            color = graphColors.creditor;
            shadowColor = 'rgba(34, 197, 94, 0.5)';
            title = `${person}\nOwed: $${balance}`;
        } else {
            color = graphColors.neutral;
            shadowColor = 'rgba(100, 116, 139, 0.5)';
            title = `${person}\nBalanced`;
        }

        nodes.add({
            id: person,
            label: person,
            color: color,
            title: title,
            shape: 'circle',
            font: { size: 14, color: '#ffffff', face: 'Inter, sans-serif', bold: true },
            widthConstraint: { maximum: 100 },
            shadow: { enabled: true, color: shadowColor, size: 15, x: 0, y: 0 },
            borderWidth: 2,
            borderWidthSelected: 3
        });
    });

    // Parse settlements from output
    let settlements = [];
    if (algo1Result.settlements) {
        settlements = algo1Result.settlements;
    }

    // Parse settlement format: "Person A will pay $X to Person B"
    settlements.forEach((settlement, index) => {
        const match = settlement.match(/(\w+)\s+will pay\s+(\d+)\s+to\s+(\w+)/);
        if (match) {
            const from = match[1];
            const amount = parseInt(match[2]);
            const to = match[3];

            edges.add({
                id: `settlement-${index}`,
                from: from,
                to: to,
                label: `$${amount}`,
                title: `${from} → ${to}: $${amount}`,
                arrows: { to: { enabled: true, scaleFactor: 0.8 } },
                color: { color: graphColors.settlement, highlight: graphColors.settlementHighlight, opacity: 0.9 },
                width: 3,
                font: { align: 'middle', size: 12, color: '#22c55e', strokeWidth: 0 },
                smooth: { type: 'curvedCW', roundness: 0.2 },
                shadow: { enabled: true, color: 'rgba(34, 197, 94, 0.4)', size: 10 }
            });
        }
    });

    const options = {
        physics: {
            enabled: true,
            stabilization: { iterations: 200 },
            solver: 'forceAtlas2Based',
            forceAtlas2Based: {
                gravitationalConstant: -50,
                centralGravity: 0.01,
                springLength: 200
            }
        },
        interaction: {
            navigationButtons: true,
            keyboard: true,
            zoomView: true,
            dragView: true,
            hover: true
        },
        nodes: {
            chosen: {
                node: function(values) {
                    values.shadowSize = 25;
                }
            }
        }
    };

    const container = document.getElementById('graph-after');
    afterNetwork = new vis.Network(container, { nodes, edges }, options);
    
    const settlementCount = settlements.length;
    const reduction = transactions.length > 0 ? 
        (((transactions.length - settlementCount) / transactions.length) * 100).toFixed(1) : 0;
    
    document.getElementById('after-info').textContent = 
        `${settlementCount} settlements (${reduction}% reduction)`;
}

// Redraw graphs on window resize
window.addEventListener('resize', () => {
    if (beforeNetwork) beforeNetwork.fit();
    if (afterNetwork) afterNetwork.fit();
});
