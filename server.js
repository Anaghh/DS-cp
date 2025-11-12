const express = require('express');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Helper: Generate C++ input format
function generateCppInput(transactions) {
    let input = `${transactions.length} ${new Set([...transactions.flatMap(t => [t.from, t.to])]).size}\n`;
    transactions.forEach(t => {
        input += `${t.from} ${t.to} ${t.amount}\n`;
    });
    return input;
}

// Helper: Parse C++ output
function parseCppOutput(output) {
    const lines = output.split('\n').filter(l => l.trim());
    const settlements = [];
    const metadata = {};

    lines.forEach(line => {
        if (line.includes('will pay')) {
            settlements.push(line);
        }
        if (line.includes('ALGORITHM:')) {
            metadata.algorithm = line.split('ALGORITHM:')[1].trim();
        }
        if (line.includes('Settlements:')) {
            metadata.settlements = parseInt(line.split(':')[1].trim());
        }
        if (line.includes('Original Transactions:')) {
            metadata.originalTransactions = parseInt(line.split(':')[1].trim());
        }
        if (line.includes('Time Complexity:')) {
            metadata.timeComplexity = line.split(':')[1].trim();
        }
        if (line.includes('Space Complexity:')) {
            metadata.spaceComplexity = line.split(':')[1].trim();
        }
        if (line.includes('Data Structures:')) {
            metadata.dataStructures = line.split(':')[1].trim();
        }
        if (line.includes('Connected Components:')) {
            metadata.components = parseInt(line.split(':')[1].trim());
        }
    });

    return { settlements, metadata };
}

// API Endpoint: Run Algorithm 1 (Greedy)
app.post('/api/algorithm/1', (req, res) => {
    const { transactions } = req.body;
    if (!transactions || transactions.length === 0) {
        return res.status(400).json({ error: 'No transactions provided' });
    }

    const input = generateCppInput(transactions);

    exec(`echo "${input}" | ./cpp/bin/algo1`, { maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
        if (error) {
            console.error('Algorithm 1 error:', error);
            return res.status(500).json({ error: error.message });
        }
        const result = parseCppOutput(stdout);
        res.json({ algorithmNumber: 1, ...result });
    });
});

// API Endpoint: Run Algorithm 2 (DFS)
app.post('/api/algorithm/2', (req, res) => {
    const { transactions } = req.body;
    if (!transactions || transactions.length === 0) {
        return res.status(400).json({ error: 'No transactions provided' });
    }

    const input = generateCppInput(transactions);

    exec(`echo "${input}" | ./cpp/bin/algo2`, { maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
        if (error) {
            console.error('Algorithm 2 error:', error);
            return res.status(500).json({ error: error.message });
        }
        const result = parseCppOutput(stdout);
        res.json({ algorithmNumber: 2, ...result });
    });
});

// API Endpoint: Run Algorithm 3 (Union-Find)
app.post('/api/algorithm/3', (req, res) => {
    const { transactions } = req.body;
    if (!transactions || transactions.length === 0) {
        return res.status(400).json({ error: 'No transactions provided' });
    }

    const input = generateCppInput(transactions);

    exec(`echo "${input}" | ./cpp/bin/algo3`, { maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
        if (error) {
            console.error('Algorithm 3 error:', error);
            return res.status(500).json({ error: error.message });
        }
        const result = parseCppOutput(stdout);
        res.json({ algorithmNumber: 3, ...result });
    });
});

// API Endpoint: Run Algorithm 4 (Heap)
app.post('/api/algorithm/4', (req, res) => {
    const { transactions } = req.body;
    if (!transactions || transactions.length === 0) {
        return res.status(400).json({ error: 'No transactions provided' });
    }

    const input = generateCppInput(transactions);

    exec(`echo "${input}" | ./cpp/bin/algo4`, { maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
        if (error) {
            console.error('Algorithm 4 error:', error);
            return res.status(500).json({ error: error.message });
        }
        const result = parseCppOutput(stdout);
        res.json({ algorithmNumber: 4, ...result });
    });
});

// API Endpoint: Run all algorithms
app.post('/api/algorithms/all', (req, res) => {
    const { transactions } = req.body;
    if (!transactions || transactions.length === 0) {
        return res.status(400).json({ error: 'No transactions provided' });
    }

    const input = generateCppInput(transactions);
    const results = {};
    let completed = 0;

    // Run all 4 algorithms in parallel
    for (let i = 1; i <= 4; i++) {
        exec(`echo "${input}" | ./cpp/bin/algo${i}`, { maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
            if (error) {
                results[i] = { error: error.message };
            } else {
                results[i] = parseCppOutput(stdout);
            }

            completed++;
            if (completed === 4) {
                res.json({ algorithms: results });
            }
        });
    }
});

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ message: 'Server is running!', timestamp: new Date() });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📝 POST /api/algorithm/1 - Run Greedy Algorithm`);
    console.log(`📝 POST /api/algorithm/2 - Run DFS Algorithm`);
    console.log(`📝 POST /api/algorithm/3 - Run Union-Find Algorithm`);
    console.log(`📝 POST /api/algorithm/4 - Run Heap Algorithm`);
    console.log(`📝 POST /api/algorithms/all - Run all algorithms`);
});
