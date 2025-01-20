#include <bits/stdc++.h>
#include "ListNode.h"
using namespace std;


vector<string> parse_input(const string& input_data) {
    vector<string> result;
    stringstream ss(input_data);
    string line;
    
    while (getline(ss, line)) {
        result.push_back(line);
    }
    
    return result;
}

/**
 * USER INSTRUCTIONS:
 * 1. Parse the input using `parseInput`.
 * 2. Convert arguments to desired types:
 *    - 1D Array: Use `stringToArray` with the required conversion function.
 *    - 2D Matrix: Use `stringToMatrix` with the required conversion function.
 *    - Linked List: Use `arrayToLinkedList`.
 *    - Doubly Linked List: Use `arrayToDoubleLinkedList`.
 *    - Binary Tree: Use `arrayToTree`.
 * 3. Use tree traversal functions for traversal:
 *    - Inorder: `inorderTraversal`.
 *    - Preorder: `preorderTraversal`.
 *    - Postorder: `postorderTraversal`.
 * 4. Write your solution using the converted data in the designated section.
 */
void rotate(vector<vector<int>>& matrix) {
    int n = matrix.size();
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            swap(matrix[i][j], matrix[j][i]);
        }
    }

    for (int i = 0; i < n; i++) {
        reverse(matrix[i].begin(), matrix[i].end());
    }
}

int main() {
    // Read all input data as a string
    string input_data;
    string line;
    
    while (getline(cin, line)) {
        input_data += line + "\n";  // Accumulate all lines in the input_data string
    }
    
    // Parse the input data
    vector<string> args = parse_input(input_data);
    // Now you can use your desired operation
    vector<vector<int>> matrix = stringToIntMatrix(args[0]);
    rotate(matrix);
    printMatrix(matrix);
    return 0;
}
