#include <iostream>
#include <map>
#include <vector>
#include <set>

using namespace std;

map<string, vector<pair<string, int>>> graph;
map<string, int> net;
set<string> visited;
int settlement_count = 0;

// DFS to find and settle debts
void dfs(string person, int amount_to_settle, vector<string>& path) {
    if (amount_to_settle == 0) return;
    
    visited.insert(person);
    path.push_back(person);

    // Try to settle with neighbors
    for (auto& edge : graph[person]) {
        string neighbor = edge.first;
        
        if (visited.find(neighbor) == visited.end() && 
            net[neighbor] > 0 && net[person] < 0) {
            
            int settlement_amount = min(-net[person], net[neighbor]);
            
            cout << person << " will pay " << settlement_amount << " to " 
                 << neighbor << endl;
            
            net[person] += settlement_amount;
            net[neighbor] -= settlement_amount;
            settlement_count++;
            
            if (net[person] != 0) {
                dfs(neighbor, net[person], path);
            }
        }
    }
    
    visited.erase(person);
    path.pop_back();
}

int main(){
    int no_of_transactions, friends;
    cin >> no_of_transactions >> friends;

    string x, y;
    int amount;

    int original_transactions = no_of_transactions;
    
    // Build graph and calculate net balances
    while (no_of_transactions--){
        cin >> x >> y >> amount;

        if (net.find(x) == net.end()) net[x] = 0;
        if (net.find(y) == net.end()) net[y] = 0;

        net[x] -= amount;
        net[y] += amount;

        // Add edges to adjacency list
        graph[x].push_back({y, amount});
        graph[y].push_back({x, amount});
    }

    // DFS-based settlement
    for (auto& p : net) {
        string person = p.first;
        int balance = p.second;

        if (balance < 0 && visited.find(person) == visited.end()) {
            vector<string> path;
            dfs(person, -balance, path);
        }
    }

    cout << "ALGORITHM: Graph DFS Traversal (Adjacency List + DFS)" << endl;
    cout << "Settlements: " << settlement_count << endl;
    cout << "Original Transactions: " << original_transactions << endl;
    cout << "Data Structures: graph (adjacency list), map (hash), DFS recursion" << endl;
    cout << "Time Complexity: O(V + E)" << endl;
    cout << "Space Complexity: O(V + E)" << endl;

    return 0;
}
