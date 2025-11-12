let beforeNetwork = null;
let afterNetwork = null;

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
        let color, title;
        
        if (balance < 0) {
            color = '#ef4444'; // Red for debtors
            title = `${person}\nOwes: $${Math.abs(balance)}`;
        } else if (balance > 0) {
            color = '#10b981'; // Green for creditors
            title = `${person}\nOwed: $${balance}`;
        } else {
            color = '#6b7280'; // Gray for neutral
            title = `${person}\nBalanced`;
        }

        nodes.add({
            id: person,
            label: `${person}\n$${balance}`,
            color: color,
            title: title,
            shape: 'circle',
            font: { size: 14, color: 'white' },
            widthConstraint: { maximum: 100 }
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
            arrows: 'to',
            color: { color: '#9ca3af', highlight: '#3b82f6' },
            font: { align: 'middle', size: 12 },
            smooth: { type: 'curvedCW' }
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
            dragView: true
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
        let color, title;
        
        if (balance < 0) {
            color = '#ef4444';
            title = `${person}\nOwes: $${Math.abs(balance)}`;
        } else if (balance > 0) {
            color = '#10b981';
            title = `${person}\nOwed: $${balance}`;
        } else {
            color = '#6b7280';
            title = `${person}\nBalanced`;
        }

        nodes.add({
            id: person,
            label: person,
            color: color,
            title: title,
            shape: 'circle',
            font: { size: 14, color: 'white' },
            widthConstraint: { maximum: 100 }
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
                arrows: 'to',
                color: { color: '#10b981', highlight: '#059669' },
                width: 3,
                font: { align: 'middle', size: 12 },
                smooth: { type: 'curvedCW' }
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
            dragView: true
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
