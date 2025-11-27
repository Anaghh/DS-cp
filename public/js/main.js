let transactions = [];
let allResults = {};
let netBalances = {};

function addTransaction() {
    const from = document.getElementById('fromInput').value.trim();
    const to = document.getElementById('toInput').value.trim();
    const amount = parseInt(document.getElementById('amountInput').value);

    if (!from || !to || !amount || amount <= 0) {
        alert('Please fill all fields with valid values');
        return;
    }

    if (from === to) {
        alert('Cannot transfer to yourself');
        return;
    }

    transactions.push({ from, to, amount });
    
    // Clear inputs
    document.getElementById('fromInput').value = '';
    document.getElementById('toInput').value = '';
    document.getElementById('amountInput').value = '';

    updateUI();
}

function removeTransaction(index) {
    transactions.splice(index, 1);
    updateUI();
}

function clearAll() {
    if (confirm('Are you sure you want to clear all transactions?')) {
        transactions = [];
        updateUI();
    }
}

function loadSampleData() {
    transactions = [
        { from: 'Rahul', to: 'Priya', amount: 50 },
        { from: 'Priya', to: 'Amit', amount: 30 },
        { from: 'Amit', to: 'Neha', amount: 25 },
        { from: 'Neha', to: 'Rahul', amount: 15 },
        { from: 'Rahul', to: 'Amit', amount: 20 }
    ];
    updateUI();
}

function calculateNetBalances() {
    netBalances = {};
    transactions.forEach(t => {
        if (!netBalances[t.from]) netBalances[t.from] = 0;
        if (!netBalances[t.to]) netBalances[t.to] = 0;
        netBalances[t.from] -= t.amount;
        netBalances[t.to] += t.amount;
    });
}

function displayTransactions() {
    const list = document.getElementById('transactions-list');
    
    if (transactions.length === 0) {
        list.innerHTML = `
            <h3>Current Transactions (0)</h3>
            <p class="empty-message">No transactions added yet</p>
        `;
        return;
    }

    let html = `<h3>Current Transactions (${transactions.length})</h3>`;
    
    transactions.forEach((t, i) => {
        html += `
            <p>
                <strong>${i + 1}.</strong> <span style="color: var(--algo1);">${t.from}</span> 
                → <span style="color: var(--algo2);">${t.to}</span>: 
                <span style="font-weight: 600; color: var(--dark);">₹${t.amount}</span>
                <button onclick="removeTransaction(${i})" class="btn btn-small" 
                    style="padding: 4px 8px; width: auto; display: inline;">✕ Remove</button>
            </p>
        `;
    });
    
    list.innerHTML = html;
}

async function runAllAlgorithms() {
    if (transactions.length === 0) {
        alert('Please add at least one transaction');
        return;
    }

    // Show loading state
    const button = event.target;
    button.disabled = true;
    button.textContent = 'Running algorithms...';

    try {
        const response = await fetch('/api/algorithms/all', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transactions })
        });

        if (!response.ok) {
            throw new Error('Server error');
        }

        allResults = await response.json();
        displayResults();
        displayComparison();
        drawGraphs();
    } catch (error) {
        alert('Error running algorithms: ' + error.message);
    } finally {
        button.disabled = false;
        button.textContent = '▶️ Run All Algorithms';
    }
}

function displayResults() {
    for (let i = 1; i <= 4; i++) {
        const result = allResults.algorithms[i];
        const resultsDiv = document.getElementById(`algo${i}-results`);
        const statsDiv = document.getElementById(`algo${i}-stats`);

        if (result.error) {
            resultsDiv.innerHTML = `<p style="color: var(--danger);">Error: ${result.error}</p>`;
            statsDiv.innerHTML = '';
            continue;
        }

        // Display settlements
        if (result.settlements && result.settlements.length > 0) {
            resultsDiv.innerHTML = result.settlements
                .map(s => `<p>💳 ${s}</p>`)
                .join('');
        } else {
            resultsDiv.innerHTML = '<p style="color: #9ca3af;">All balanced (0 settlements needed)</p>';
        }

        // Display stats
        const metadata = result.metadata;
        let statsHtml = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.9em;">
                <div><strong>Settlements:</strong> ${metadata.settlements || 0}</div>
                <div><strong>Original Txs:</strong> ${metadata.originalTransactions || 0}</div>
                <div><strong>Complexity:</strong> ${metadata.timeComplexity || 'N/A'}</div>
        `;
        
        if (metadata.components) {
            statsHtml += `<div><strong>Components:</strong> ${metadata.components}</div>`;
        }
        
        statsHtml += '</div>';
        statsDiv.innerHTML = statsHtml;
    }
}

function displayComparison() {
    const tbody = document.getElementById('comparison-body');
    let rows = '';

    for (let i = 1; i <= 4; i++) {
        const result = allResults.algorithms[i];
        if (result.error) continue;

        const metadata = result.metadata;
        const settlements = metadata.settlements || 0;
        const original = metadata.originalTransactions || 0;
        const reduction = original > 0 ? (((original - settlements) / original) * 100).toFixed(1) : 0;

        const algorithmNames = [
            'Greedy Two-Pointer',
            'DFS Graph Traversal',
            'Union-Find',
            'Min-Heap Priority Queue'
        ];

        rows += `
            <tr>
                <td><strong>${algorithmNames[i - 1]}</strong></td>
                <td>${settlements}</td>
                <td>${original}</td>
                <td>${reduction}% reduction</td>
                <td>${metadata.timeComplexity || 'N/A'}</td>
                <td>${metadata.spaceComplexity || 'N/A'}</td>
            </tr>
        `;
    }

    tbody.innerHTML = rows || '<tr><td colspan="6">Run algorithms to see comparison</td></tr>';
}

function updateUI() {
    calculateNetBalances();
    displayTransactions();
    drawGraphs();
    
    // Clear previous results
    for (let i = 1; i <= 4; i++) {
        document.getElementById(`algo${i}-results`).innerHTML = '<p class="placeholder">Run algorithms to see results</p>';
        document.getElementById(`algo${i}-stats`).innerHTML = '';
    }
    document.getElementById('comparison-body').innerHTML = '<tr><td colspan="6">Run algorithms to see comparison</td></tr>';
}

function showWalkthrough(algoNum) {
    const algorithmNames = [
        'Greedy Two-Pointer Algorithm',
        'DFS Graph Traversal Algorithm',
        'Union-Find Algorithm',
        'Min-Heap Priority Queue Algorithm'
    ];

    const descriptions = [
        `
        <h3>Greedy Two-Pointer Walkthrough</h3>
        <p><strong>Algorithm:</strong> Sorts net balances and uses two pointers to match debtors with creditors.</p>
        <div class="code-block">
            <strong>Steps:</strong>
            <pre>1. Calculate net balance for each person
2. Create vector with non-zero balances
3. Sort by amount (debtors first, creditors last)
4. Set left=0, right=size-1
5. While left < right:
   a. Calculate settlement amount
   b. Record settlement
   c. Move appropriate pointer
6. Done!</pre>
        </div>
        <p><strong>Data Structures Used:</strong> Map (hash), Vector (array), Sorting</p>
        <p><strong>Time Complexity:</strong> O(n log n) due to sorting</p>
        <p><strong>Best for:</strong> Quick, simple solutions</p>
        `,
        `
        <h3>DFS Graph Traversal Walkthrough</h3>
        <p><strong>Algorithm:</strong> Builds a directed graph and uses DFS to find settlement paths.</p>
        <div class="code-block">
            <strong>Steps:</strong>
            <pre>1. Build adjacency list from transactions
2. Calculate net balances
3. For each debtor:
   a. Use DFS to find creditor paths
   b. Settle along path
   c. Mark visited nodes
   d. Continue until balanced
4. Done!</pre>
        </div>
        <p><strong>Data Structures Used:</strong> Adjacency List (graph), Map, Stack (recursion)</p>
        <p><strong>Time Complexity:</strong> O(V + E) where V=people, E=transactions</p>
        <p><strong>Best for:</strong> Understanding payment paths</p>
        `,
        `
        <h3>Union-Find Walkthrough</h3>
        <p><strong>Algorithm:</strong> Groups connected people using Union-Find, then solves each group separately.</p>
        <div class="code-block">
            <strong>Steps:</strong>
            <pre>1. Create Union-Find structure
2. For each transaction, unite two people
3. Find all connected components
4. For each component:
   a. Extract balances
   b. Sort balances
   c. Use two-pointer to settle
5. Done!</pre>
        </div>
        <p><strong>Data Structures Used:</strong> Union-Find (parent + rank), Map</p>
        <p><strong>Time Complexity:</strong> O(n α(n)) ≈ O(n)</p>
        <p><strong>Best for:</strong> Identifying disconnected groups</p>
        `,
        `
        <h3>Min-Heap Priority Queue Walkthrough</h3>
        <p><strong>Algorithm:</strong> Uses two heaps to always match most extreme debtors and creditors.</p>
        <div class="code-block">
            <strong>Steps:</strong>
            <pre>1. Calculate net balances
2. Create min-heap for debtors
3. Create max-heap for creditors
4. While both heaps non-empty:
   a. Extract min debtor
   b. Extract max creditor
   c. Calculate settlement
   d. Re-insert if not settled
5. Done!</pre>
        </div>
        <p><strong>Data Structures Used:</strong> Priority Queue (min-heap + max-heap), Map</p>
        <p><strong>Time Complexity:</strong> O(n log n)</p>
        <p><strong>Best for:</strong> Streaming/dynamic data</p>
        `
    ];

    const modal = document.getElementById('walkthrough-modal');
    document.getElementById('walkthrough-title').textContent = algorithmNames[algoNum - 1];
    document.getElementById('walkthrough-body').innerHTML = descriptions[algoNum - 1];
    modal.style.display = 'block';
}

function closeWalkthrough() {
    document.getElementById('walkthrough-modal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('walkthrough-modal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    updateUI();
});
