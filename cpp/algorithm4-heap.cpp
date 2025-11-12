#include <iostream>
#include <map>
#include <vector>
#include <queue>

using namespace std;

int main(){
    int no_of_transactions, friends;
    cin >> no_of_transactions >> friends;

    string x, y;
    int amount;

    int original_transactions = no_of_transactions;
    map<string, int> net;

    // Calculate net balances
    while (no_of_transactions--){
        cin >> x >> y >> amount;

        if (net.find(x) == net.end()) net[x] = 0;
        if (net.find(y) == net.end()) net[y] = 0;

        net[x] -= amount;
        net[y] += amount;
    }

    // Min-heap for debtors (negative balances)
    priority_queue<pair<int, string>, vector<pair<int, string>>, greater<pair<int, string>>> min_heap;
    
    // Max-heap for creditors (positive balances)
    priority_queue<pair<int, string>> max_heap;

    // Insert into heaps
    for (auto& p : net) {
        if (p.second < 0) {
            min_heap.push({p.second, p.first});
        } else if (p.second > 0) {
            max_heap.push({p.second, p.first});
        }
    }

    int settlement_count = 0;

    // Match debtors with creditors using heaps
    while (!min_heap.empty() && !max_heap.empty()) {
        auto [debit, debit_person] = min_heap.top();
        min_heap.pop();

        auto [credit, credit_person] = max_heap.top();
        max_heap.pop();

        int settlement_amount = min(-debit, credit);

        cout << debit_person << " will pay " << settlement_amount << " to " 
             << credit_person << endl;

        debit += settlement_amount;
        credit -= settlement_amount;

        // Re-insert if not fully settled
        if (debit < 0) {
            min_heap.push({debit, debit_person});
        }
        if (credit > 0) {
            max_heap.push({credit, credit_person});
        }

        settlement_count++;
    }

    cout << "ALGORITHM: Min-Heap Priority Queue" << endl;
    cout << "Settlements: " << settlement_count << endl;
    cout << "Original Transactions: " << original_transactions << endl;
    cout << "Data Structures: priority_queue (min-heap + max-heap), map (hash)" << endl;
    cout << "Time Complexity: O(n log n)" << endl;
    cout << "Space Complexity: O(n)" << endl;

    return 0;
}
