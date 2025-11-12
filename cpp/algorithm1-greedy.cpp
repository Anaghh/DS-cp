#include <iostream>
#include <map>
#include <vector>
#include <algorithm>
#include <iomanip>

using namespace std;

int main(){
    int no_of_transactions, friends;
    cin >> no_of_transactions >> friends;

    string x, y;
    int amount;

    // STEP 1: Calculate net balance for each person using Hash Map
    map<string, int> net;

    int original_transactions = no_of_transactions;
    while (no_of_transactions--){
        cin >> x >> y >> amount;

        // Initialize if person doesn't exist
        if (net.find(x) == net.end()){
            net[x] = 0;
        }
        if (net.find(y) == net.end()){
            net[y] = 0;
        }

        net[x] -= amount;  // x owes money (negative balance)
        net[y] += amount;  // y is owed money (positive balance)
    }

    // STEP 2: Create a vector of non-zero balances
    vector< pair<int, string> > balances;
    
    for (auto p : net){
        if (p.second != 0){
            balances.push_back( make_pair(p.second, p.first) );
        }
    }

    // STEP 3: Sort by balance
    // Debtors (negative) come first, creditors (positive) come last
    sort(balances.begin(), balances.end());

    int count = 0;
    int left = 0;
    int right = balances.size() - 1;

    // STEP 4: Two-pointer technique to match debtors and creditors
    while (left < right){
        int debit = balances[left].first;        // Most negative (owes most)
        string debit_person = balances[left].second;

        int credit = balances[right].first;      // Most positive (owed most)
        string credit_person = balances[right].second;

        // Calculate settlement amount (minimum of absolute values)
        int settlement_amount = min(-debit, credit);
        
        balances[left].first += settlement_amount;   // Reduce debt
        balances[right].first -= settlement_amount;  // Reduce credit

        cout << debit_person << " will pay " << settlement_amount << " to " << credit_person << endl;

        // Move pointers if balance is settled
        if (balances[left].first == 0){
            left++;
        }
        if (balances[right].first == 0){
            right--;
        }

        count++;
    }
    
    cout << "ALGORITHM: Greedy Two-Pointer (Vector + Sorting)" << endl;
    cout << "Settlements: " << count << endl;
    cout << "Original Transactions: " << original_transactions << endl;
    cout << "Data Structures: map (hash), vector (array), sorting" << endl;
    cout << "Time Complexity: O(n log n)" << endl;
    cout << "Space Complexity: O(n)" << endl;

    return 0;
}
