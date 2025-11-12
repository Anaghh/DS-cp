#include <iostream>
#include <map>
#include <vector>
#include <algorithm>

using namespace std;

// Union-Find Data Structure
class UnionFind {
public:
    map<string, string> parent;
    map<string, int> rank;

    void makeSet(string x) {
        if (parent.find(x) == parent.end()) {
            parent[x] = x;
            rank[x] = 0;
        }
    }

    string find(string x) {
        if (parent[x] != x) {
            parent[x] = find(parent[x]);  // Path compression
        }
        return parent[x];
    }

    void unite(string x, string y) {
        string px = find(x);
        string py = find(y);

        if (px == py) return;

        // Union by rank
        if (rank[px] < rank[py]) {
            parent[px] = py;
        } else if (rank[px] > rank[py]) {
            parent[py] = px;
        } else {
            parent[py] = px;
            rank[px]++;
        }
    }
};

int main(){
    int no_of_transactions, friends;
    cin >> no_of_transactions >> friends;

    string x, y;
    int amount;

    int original_transactions = no_of_transactions;
    UnionFind uf;
    map<string, int> net;
    vector<tuple<string, string, int>> transactions;

    // Read transactions and build union-find
    while (no_of_transactions--){
        cin >> x >> y >> amount;

        uf.makeSet(x);
        uf.makeSet(y);
        uf.unite(x, y);

        if (net.find(x) == net.end()) net[x] = 0;
        if (net.find(y) == net.end()) net[y] = 0;

        net[x] -= amount;
        net[y] += amount;
        
        transactions.push_back({x, y, amount});
    }

    // Find connected components
    map<string, vector<string>> components;
    for (auto& p : net) {
        string root = uf.find(p.first);
        components[root].push_back(p.first);
    }

    // Settle within each component using greedy approach
    int settlement_count = 0;
    for (auto& comp : components) {
        vector<pair<int, string>> balances;
        
        for (auto& person : comp.second) {
            if (net[person] != 0) {
                balances.push_back({net[person], person});
            }
        }

        sort(balances.begin(), balances.end());

        int left = 0;
        int right = balances.size() - 1;

        while (left < right) {
            int debit = balances[left].first;
            string debit_person = balances[left].second;

            int credit = balances[right].first;
            string credit_person = balances[right].second;

            int settlement_amount = min(-debit, credit);

            cout << debit_person << " will pay " << settlement_amount << " to " 
                 << credit_person << endl;

            balances[left].first += settlement_amount;
            balances[right].first -= settlement_amount;

            if (balances[left].first == 0) left++;
            if (balances[right].first == 0) right--;

            settlement_count++;
        }
    }

    cout << "ALGORITHM: Union-Find (Disjoint Sets)" << endl;
    cout << "Settlements: " << settlement_count << endl;
    cout << "Original Transactions: " << original_transactions << endl;
    cout << "Connected Components: " << components.size() << endl;
    cout << "Data Structures: union-find (parent array + rank), map (hash)" << endl;
    cout << "Time Complexity: O(n α(n)) ≈ O(n)" << endl;
    cout << "Space Complexity: O(n)" << endl;

    return 0;
}
