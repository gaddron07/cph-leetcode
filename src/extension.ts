import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { fetchTestCases } from './fetchTestCases';
import { saveTestCases } from './saveTestCases';
import { runCode } from './runCode';

// Helper function to initialize the workspace with files
async function createWorkspace(workspacePath: string) {
    const helperFiles = [
        { name: 'ListNode.h', content: 
`
// ListNode.h
#ifndef LISTNODE_H
#define LISTNODE_H

#include <string>
#include <vector>
#include <sstream>
#include <iostream>
#include <fstream>
#include <queue>

using namespace std;

// Class Definitions
template <typename T>
class ListNode {
public:
    T val;
    ListNode* next;
    ListNode(T x) : val(x), next(nullptr) {}
};

template <typename T>
class DoubleListNode {
public:
    T val;
    DoubleListNode* next;
    DoubleListNode* prev;
    DoubleListNode(T x) : val(x), next(nullptr), prev(nullptr) {}
};

template <typename T>
class TreeNode {
public:
    T val;
    TreeNode* left;
    TreeNode* right;
    TreeNode(T x) : val(x), left(nullptr), right(nullptr) {}
};

// Function Definitions
// Helper function to trim spaces from the string
string trim(const string &str) {
    size_t start = str.find_first_not_of(" \t\n\r");
    size_t end = str.find_last_not_of(" \t\n\r");
    return (start == string::npos) ? "" : str.substr(start, end - start + 1);
}

// Function to convert a string to an array of integers
vector<int> stringToIntArray(const string& str) {
    vector<int> arr;
    string temp;
    size_t i = 0;
    while (i < str.size()) {
        if (str[i] == ',') {
            i++;
            continue;
        }
        
        // Capture a number until we encounter a comma or closing bracket
        while (i < str.size() && (isdigit(str[i]) || str[i] == '-' || str[i] == '.')) {
            temp += str[i];
            i++;
        }

        if (!temp.empty()) {
            try {
                arr.push_back(stoi(temp));  // Convert to integer
            } catch (const invalid_argument& e) {
                cerr << "Invalid integer format: " << temp << endl;
            }
        }
        temp.clear();
        i++;
    }
    return arr;
}

// Function to convert a string to an array of floating-point numbers (double)
vector<double> stringToDoubleArray(const string& str) {
    vector<double> arr;
    string temp;
    size_t i = 0;
    while (i < str.size()) {
        if (str[i] == ',') {
            i++;
            continue;
        }
        
        while (i < str.size() && (isdigit(str[i]) || str[i] == '-' || str[i] == '.')) {
            temp += str[i];
            i++;
        }

        if (!temp.empty()) {
            try {
                arr.push_back(stod(temp));  // Convert to double
            } catch (const invalid_argument& e) {
                cerr << "Invalid double format: " << temp << endl;
            }
        }
        temp.clear();
        i++;
    }
    return arr;
}

// Function to convert a string to an array of strings
vector<string> stringToStringArray(const string& str) {
    vector<string> arr;
    stringstream ss(str.substr(1, str.size() - 2));  // Remove surrounding brackets
    string temp;
    
    while (getline(ss, temp, ',')) {
        arr.push_back(trim(temp));  // Trim spaces and add to array
    }
    return arr;
}

vector<vector<int>> stringToIntMatrix(const string& matrixString) {
    vector<vector<int>> matrix;
    
    // Step 1: Remove the outer brackets and any unwanted spaces
    string content = matrixString.substr(1, matrixString.size() - 2);  // Remove outer brackets
    content = trim(content);  // Trim leading/trailing spaces from entire content

    // Step 2: Split by "],[" to get each row
    size_t start = 0;
    size_t end = content.find("],[");

    while (end != string::npos) {
        string rowStr = content.substr(start, end - start);
        matrix.push_back(stringToIntArray(rowStr));  // Convert and add to matrix
        start = end + 3;  // Move past the "],[" separator
        end = content.find("],[" , start);
    }

    // Handle the last row (after the final "],[" or after the first row)
    if (start < content.size()) {
        string rowStr = content.substr(start);
        matrix.push_back(stringToIntArray(rowStr));  // Convert and add to matrix
    }

    return matrix;
}

// Function to process a double matrix string into a vector of double vectors
vector<vector<double>> stringToDoubleMatrix(const string& matrixString) {
    vector<vector<double>> matrix;
    
    // Step 1: Remove the outer brackets and any unwanted spaces
    string content = matrixString.substr(1, matrixString.size() - 2);  // Remove outer brackets
    content = trim(content);  // Trim leading/trailing spaces from entire content

    // Step 2: Split by "],[" to get each row
    size_t start = 0;
    size_t end = content.find("],[");

    while (end != string::npos) {
        string rowStr = content.substr(start, end - start);
        matrix.push_back(stringToDoubleArray(rowStr));  // Convert and add to matrix
        start = end + 3;  // Move past the "],[" separator
        end = content.find("],[" , start);
    }

    // Handle the last row (after the final "],[" or after the first row)
    if (start < content.size()) {
        string rowStr = content.substr(start);
        matrix.push_back(stringToDoubleArray(rowStr));  // Convert and add to matrix
    }

    return matrix;
}

vector<vector<string>> stringToStringMatrix(const string& input) {
    vector<vector<string>> result;
    stringstream ss(input);
    string line;
    while (getline(ss, line)) {
        if (line.empty()) continue; // Skip empty lines
        result.push_back(stringToStringArray(line));
    }
    return result;
}


int stringToInt(const string& str) {
   return stoi(str);
}

double stringToDouble(const string& str) {
    return stod(str);
}

string stringToString(const string& str) {
    return str;
}

template <typename T>
ListNode<T>* arrayToLinkedList(const vector<T>& arr) {
    ListNode<T>* head = nullptr;
    ListNode<T>* tail = nullptr;
    for (const T& val : arr) {
        ListNode<T>* newNode = new ListNode<T>(val);
        if (!head) {
            head = newNode;
            tail = head;
        } else {
            tail->next = newNode;
            tail = newNode;
        }
    }
    return head;
}

template <typename T>
DoubleListNode<T>* arrayToDoubleLinkedList(const vector<T>& arr) {
    DoubleListNode<T>* head = nullptr;
    DoubleListNode<T>* tail = nullptr;
    for (const T& val : arr) {
        DoubleListNode<T>* newNode = new DoubleListNode<T>(val);
        if (!head) {
            head = newNode;
            tail = head;
        } else {
            tail->next = newNode;
            newNode->prev = tail;
            tail = newNode;
        }
    }
    return head;
}

template <typename T>
TreeNode<T>* arrayToTree(const vector<T>& arr) {
    if (arr.empty()) return nullptr;
    TreeNode<T>* root = new TreeNode<T>(arr[0]);
    queue<TreeNode<T>*> nodesQueue;
    nodesQueue.push(root);
    size_t i = 1;
    while (i < arr.size()) {
        TreeNode<T>* currentNode = nodesQueue.front();
        nodesQueue.pop();
        if (i < arr.size()) {
            currentNode->left = new TreeNode<T>(arr[i++]);
            nodesQueue.push(currentNode->left);
        }
        if (i < arr.size()) {
            currentNode->right = new TreeNode<T>(arr[i++]);
            nodesQueue.push(currentNode->right);
        }
    }
    return root;
}

template <typename T>
vector<T> inorderTraversal(TreeNode<T>* root) {
    vector<T> result;
    if (root) {
        vector<T> left = inorderTraversal(root->left);
        result.insert(result.end(), left.begin(), left.end());
        result.push_back(root->val);
        vector<T> right = inorderTraversal(root->right);
        result.insert(result.end(), right.begin(), right.end());
    }
    return result;
}

template <typename T>
vector<T> preorderTraversal(TreeNode<T>* root) {
    vector<T> result;
    if (root) {
        result.push_back(root->val);
        vector<T> left = preorderTraversal(root->left);
        result.insert(result.end(), left.begin(), left.end());
        vector<T> right = preorderTraversal(root->right);
        result.insert(result.end(), right.begin(), right.end());
    }
    return result;
}

template <typename T>
vector<T> postorderTraversal(TreeNode<T>* root) {
    vector<T> result;
    if (root) {
        vector<T> left = postorderTraversal(root->left);
        result.insert(result.end(), left.begin(), left.end());
        vector<T> right = postorderTraversal(root->right);
        result.insert(result.end(), right.begin(), right.end());
        result.push_back(root->val);
    }
    return result;
}

template <typename T>
string readInputFromFile(const string& filename) {
    ifstream file(filename);
    stringstream buffer;
    buffer << file.rdbuf();
    return buffer.str();
}

// For printing the results
template <typename T>
void printArray(const vector<T>& vec) {
    cout << '[';
    for (int i = 0; i < vec.size(); i++) {
        cout << vec[i];
        if (i < vec.size() - 1) {
            cout << ", ";
        }
    }
    cout << ']' << endl;
}

template <typename T>
void printMatrix(const vector<vector<T>>& matrix) {
    cout << '[';
    for (int i = 0; i < matrix.size(); i++) {
        cout << '[';
        for (int j = 0; j < matrix[i].size(); j++) {
            cout << matrix[i][j];
            if (j < matrix[i].size() - 1) {
                cout << ", ";
            }
        }
        cout << ']';
        if (i < matrix.size() - 1) {
            cout << ", ";
        }
    }
    cout << ']' << endl;
}

template <typename T>
void printLinkedList(ListNode<T>* head) {
    cout << '[';
    while (head) {
        cout << head->val;
        if (head->next) {
            cout << ", ";
        }
        head = head->next;
    }
    cout << ']' << endl;
}

template <typename T>
void printDoubleLinkedList(DoubleListNode<T>* head) {
    cout << '[';
    while (head) {
        cout << head->val;
        if (head->next) {
            cout << ", ";
        }
        head = head->next;
    }
    cout << ']' << endl;
}

template <typename T>
void printTree(TreeNode<int>* root, string treeType) {
    if (treeType == "inorder") {
        vector<int> inorder = inorderTraversal(root);
        printArray(inorder);
    } else if (treeType == "preorder") {
        vector<int> preorder = preorderTraversal(root);
        printArray(preorder);
    } else if (treeType == "postorder") {
        vector<int> postorder = postorderTraversal(root);
        printArray(postorder);
    }
}
#endif
` },
        { name: 'ListNode.cpp', content: 
`
// ListNode.cpp

#include "ListNode.h"

// Explicit template instantiations for ListNode
template class ListNode<int>;
template class ListNode<double>;
template class ListNode<string>;

// Explicit template instantiations for DoubleListNode
template class DoubleListNode<int>;
template class DoubleListNode<double>;
template class DoubleListNode<string>;

// Explicit template instantiations for TreeNode
template class TreeNode<int>;
template class TreeNode<double>;
template class TreeNode<string>;

// Explicit template instantiations for string to array or matrix
vector<int> stringToIntArray(const string&);
vector<double> stringToDoubleArray(const string&); 
vector<string> stringToStringArray(const string&);
vector<vector<int>> stringToIntMatrix(const string&);
vector<vector<double>> stringToDoubleMatrix(const string&);
vector<vector<string>> stringToStringMatrix(const string&);
// Explicit template instantiations for arrayToLinkedList
template ListNode<int>* arrayToLinkedList<int>(const vector<int>&);
template ListNode<double>* arrayToLinkedList<double>(const vector<double>&);
template ListNode<string>* arrayToLinkedList<string>(const vector<string>&);

// Explicit template instantiations for arrayToDoubleLinkedList
template DoubleListNode<int>* arrayToDoubleLinkedList<int>(const vector<int>&);
template DoubleListNode<double>* arrayToDoubleLinkedList<double>(const vector<double>&);
template DoubleListNode<string>* arrayToDoubleLinkedList<string>(const vector<string>&);

// Explicit template instantiations for arrayToTree
template TreeNode<int>* arrayToTree<int>(const vector<int>&);
template TreeNode<double>* arrayToTree<double>(const vector<double>&);
template TreeNode<string>* arrayToTree<string>(const vector<string>&);

// Explicit template instantiations for tree traversal functions
template vector<int> inorderTraversal<int>(TreeNode<int>*);
template vector<double> inorderTraversal<double>(TreeNode<double>*);
template vector<string> inorderTraversal<string>(TreeNode<string>*);

template vector<int> preorderTraversal<int>(TreeNode<int>*);
template vector<double> preorderTraversal<double>(TreeNode<double>*);
template vector<string> preorderTraversal<string>(TreeNode<string>*);

template vector<int> postorderTraversal<int>(TreeNode<int>*);
template vector<double> postorderTraversal<double>(TreeNode<double>*);
template vector<string> postorderTraversal<string>(TreeNode<string>*);

// Explicit template instantiations for print functions
template void printLinkedList<int>(ListNode<int>*);
template void printLinkedList<double>(ListNode<double>*);
template void printLinkedList<string>(ListNode<string>*);

template void printDoubleLinkedList<int>(DoubleListNode<int>*);
template void printDoubleLinkedList<double>(DoubleListNode<double>*);
template void printDoubleLinkedList<string>(DoubleListNode<string>*);

template void printTree<int>(TreeNode<int>*, string);

template void printArray<int>(const vector<int>&);
template void printArray<double>(const vector<double>&);
template void printArray<string>(const vector<string>&);

`
},
        { name: 'ListNode.py', content: 
`
import ast
from collections import deque

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class DoubleListNode:
    def __init__(self, val=0, next=None, prev=None):
        self.val = val
        self.next = next
        self.prev = prev

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def parse_input(input_data):
    return [ast.literal_eval(line) if line.strip() else line.strip() for line in input_data]

def conversion_to_list(arg):
    return ast.literal_eval(arg) if isinstance(arg, str) else list(arg)

def stringToInt(arg):
    return int(arg)

def stringToDouble(arg):
    return float(arg)

def array_to_linked_list(arr):
    dummy = ListNode()
    current = dummy
    for value in arr:
        current.next = ListNode(value)
        current = current.next
    return dummy.next

def array_to_double_linked_list(arr):
    dummy = DoubleListNode()
    current = dummy
    for value in arr:
        node = DoubleListNode(value)
        current.next = node
        node.prev = current
        current = node
    return dummy.next

def array_to_tree(arr):
    if not arr:
        return None
    root = TreeNode(arr[0])
    queue = deque([root])
    i = 1
    while queue and i < len(arr):
        node = queue.popleft()
        if arr[i] is not None:
            node.left = TreeNode(arr[i])
            queue.append(node.left)
        i += 1
        if i < len(arr) and arr[i] is not None:
            node.right = TreeNode(arr[i])
            queue.append(node.right)
        i += 1
    return root

def traversal_inorder(root):
    return traversal_inorder(root.left) + [root.val] + traversal_inorder(root.right) if root else []

def traversal_preorder(root):
    return [root.val] + traversal_preorder(root.left) + traversal_preorder(root.right) if root else []

def traversal_postorder(root):
    return traversal_postorder(root.left) + traversal_postorder(root.right) + [root.val] if root else []

def print_linked_list(head):
    values = []
    while head:
        values.append(head.val)
        head = head.next
    print("Empty List" if not values else f"[{', '.join(map(str, values))}]")

def print_double_linked_list(head):
    values = []
    while head:
        values.append(head.val)
        head = head.next
    print("Empty List" if not values else f"[{', '.join(map(str, values))}]")

def print_tree(root, traversal_type="inorder"):
    if traversal_type == "preorder":
        result = traversal_preorder(root)
    elif traversal_type == "inorder":
        result = traversal_inorder(root)
    elif traversal_type == "postorder":
        result = traversal_postorder(root)
    else:
        print(f"Unsupported traversal type: {traversal_type}")
        return
    print(f"[{', '.join(map(str, result))}]")

`
},
        { name: 'main.cpp', content: 
`
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
 *The argumetns are in the form of a string of array, where the elements of the array are arguments.
 *User need to convert the each element of the array to the desired data type.
 *The fucntions that are present are:
    *stringToIntArray(string str) : Converts string to integer array
    *stringToIntMatrix(string str) : Converts string to integer matrix
    *stringToStringArray(string str) : Converts string to string array
    *stringToStringMatrix(string str) : Converts string to string matrix
    *stringToDoubleArray(string str) : Converts string to double array
    *stringToDoubleMatrix(string str) : Converts string to double matrix
    *stringToDouble(string str) : Converts string to double
    *stringToString(string str) : Converts string to string
    *stringToInt(string str) : Converts string to integer
    *arrayToLinkedList(vector<T> arr) : Converts array to linked list
    *arrayToDoubleLinkedList(vector<T> arr) : Converts array to double linked list
    *arrayToTree(vector<T> arr) : Converts array to tree
    *inorderTraversal(TreeNode<T>* root) : Returns the inorder traversal of the tree
    *preorderTraversal(TreeNode<T>* root) : Returns the preorder traversal of the tree
    *postorderTraversal(TreeNode<T>* root) : Returns the postorder traversal of the tree
*To print the results, use the print functions.
    *printLinkedList(ListNode<T>* head) : Prints the linked list
    *printDoubleLinkedList(DoubleListNode<T>* head) : Prints the double linked list
    *printTree(TreeNode<T>* root, string order) : Prints the tree in the given order
    *printMatrix(vector<vector<T>> matrix) : Prints the matrix
    *printArray(vector<T> arr) : Prints the array
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

`
},
        { name: 'main.py', content:
`
import sys
from listNode import parse_input, conversion_to_list, stringToDouble, stringToInt,array_to_linked_list, array_to_double_linked_list, array_to_tree, traversal_inorder, traversal_preorder, traversal_postorder

"""
Instructions for the User:
1. Write your solution in the User Solution Code section.
2. The arguments are in the form of a list. The first element of the list is the first argument, the second element of the list is the second argument, and so on.
3. The input is already parsed and stored in the variable args. args[0] is the first argument, args[1] is the second argument and so on.
4. The functions that are pre-defined are:
    *conversion_to_list(arg) : Converts the input arguments to a list if the input is in string format.
    *stringToInt(arg) : Converts the input argument to an integer if the input is in string format.
    *stringToDouble(arg) : Converts the input argument to a double if the input is in string format.
    *array_to_linked_list(arr) : Converts the input list to a linked list.
    *array_to_double_linked_list(arr) : Converts the input list to a double linked list.
    *array_to_tree(arr) : Converts the input list to a binary tree.
    *traversal_inorder(root) : Returns the inorder traversal of the binary tree.
    *traversal_preorder(root) : Returns the preorder traversal of the binary tree.
    *traversal_postorder(root) : Returns the postorder traversal of the binary tree.
5. The funtions for printing the results are:
    *printLinkedList(head) : Prints the linked list.
    *printDoubleLinkedList(head) : Prints the double linked list.
    *printTree(root, order) : Prints the binary tree in the given order. The order can be 'inorder', 'preorder', 'postorder'.
   
"""

# User Solution Code Goes Here

# Read input for arguments
arg = sys.stdin.read().strip().split('\n')

# Parse and process arguments
args = parse_input(arg)

# Example: Convert inputs to required formats as needed for your solution
#Example problem: Rotate Image
def rotate(matrix):
    n = len(matrix)
    for i in range(n):
        for j in range(i + 1, n):
            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]

    for i in range(n):
        matrix[i].reverse()

    return matrix
args = conversion_to_list(args[0])
print(rotate(args))
"""
#Example problem: Two Sum
def twoSum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []
args[0] = conversion_to_list(args[0])
args[1] = stringToInt(args[1])
result = twoSum(args[0], args[1])
print(result)
"""
`
},
    ];

    // Create the workspace directory if it doesn't exist
    const userSolutionsDir = path.join(workspacePath, 'user_solutions');
    if (!fs.existsSync(workspacePath)) {
        fs.mkdirSync(workspacePath, { recursive: true });
    }

    if (!fs.existsSync(userSolutionsDir)) {
        fs.mkdirSync(userSolutionsDir, { recursive: true });
    }

    // Create helper and main files if they don't already exist
    for (const file of helperFiles) {
        const filePath = path.join(userSolutionsDir, file.name);
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, file.content, 'utf-8');
        }
    }

    vscode.window.showInformationMessage('Workspace initialized with helper files and solution templates.');
}
// Helper function to get the user solution file (either main.cpp or main.py)
async function getUserSolutionFile(): Promise<string | undefined> {
    const userSolutionsDir = path.join(vscode.workspace.rootPath || '', 'user_solutions');
    const files = fs.readdirSync(userSolutionsDir);

    // Filter out solution files for C++ and Python
    const solutionFiles = files.filter(file => file === 'main.cpp' || file === 'main.py');

    // If no solution files are found, show an error message
    if (solutionFiles.length === 0) {
        vscode.window.showErrorMessage('No solution file found in the workspace. Please ensure main.cpp or main.py exists.');
        return undefined;
    }

    // Ask the user to select the solution file from the available options
    const selectedFile = await vscode.window.showQuickPick(solutionFiles, {
        placeHolder: 'Select your solution file (main.cpp or main.py)',
    });

    if (!selectedFile) {
        vscode.window.showErrorMessage('No solution file selected. Operation aborted.');
        return undefined;
    }

    return path.join(userSolutionsDir, selectedFile);
}

// Extension activation
export function activate(context: vscode.ExtensionContext) {
    console.log('CPH LeetCode Extension Activated.');

    // Create workspace command
    const createWorkspaceCommand = vscode.commands.registerCommand('extension.createWorkspace', async () => {
        // Prompt the user to select a folder where the workspace will be created
        const folderUri = await vscode.window.showOpenDialog({
            canSelectFolders: true,
            canSelectFiles: false,
            openLabel: 'Select or Create a Folder for Workspace',
        });

        if (!folderUri || folderUri.length === 0) {
            vscode.window.showErrorMessage('No folder selected. Workspace creation aborted.');
            return;
        }

        const workspacePath = folderUri[0].fsPath;

        // Initialize the workspace with required files
        await createWorkspace(workspacePath);

        // Optionally, open the created workspace folder in VSCode
        vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(workspacePath), true);
    });

    // Fetch and save test cases command
    const fetchAndSaveTestCases = vscode.commands.registerCommand('extension.fetchAndSaveTestCases', async () => {
        try { 
            const problemName = await vscode.window.showInputBox({
                prompt: 'Enter the LeetCode problem name (e.g., "two-sum")',
                placeHolder: 'two-sum',
            });
    
            if (!problemName) {
                vscode.window.showErrorMessage('Problem name is required!');
                return;
            }
    
            vscode.window.showInformationMessage('Fetching and saving test cases...');
            const url = `https://leetcode.com/problems/${problemName}/description/`;
            console.log('Fetching test cases from URL:', url);  // Added logging
    
            const outputDir = path.join(vscode.workspace.rootPath || '', 'testcases');
            if (fs.existsSync(outputDir)) {
                fs.rmSync(outputDir, { recursive: true, force: true });
                console.log('Old test cases directory removed.');
            }
    
            const { inputs, expectedOutputs } = await fetchTestCases(url);
    
            console.log('Fetched inputs:', inputs); // Add more logs here
            console.log('Fetched expectedOutputs:', expectedOutputs);
    
            if (!inputs.length || !expectedOutputs.length) {
                vscode.window.showErrorMessage('No test cases found. Please check the problem URL.');
                return;
            }
    
            await saveTestCases(inputs, expectedOutputs, outputDir);
            vscode.window.showInformationMessage(`Test cases saved successfully to ${outputDir}.`);
        } catch (error) {
            vscode.window.showErrorMessage(
                `Error while fetching and saving test cases: ${error instanceof Error ? error.message : String(error)}`
            );
        }
    });    
    // Run user code command
    const runUserCode = vscode.commands.registerCommand('extension.runUserCode', async () => {
        try {
            vscode.window.showInformationMessage('Running your solution against test cases...');

            const solutionFile = await getUserSolutionFile();
            if (!solutionFile) {return;}  // Exit if no solution file is found

            const testcasesDir = path.join(vscode.workspace.rootPath || '', 'testcases');
            if (!fs.existsSync(testcasesDir)) {
                vscode.window.showErrorMessage('Testcases directory not found. Please fetch and save test cases first.');
                return;
            }

            const testCases = fs.readdirSync(testcasesDir).filter((dir) => dir.startsWith('testcase_'));
            if (!testCases.length) {
                vscode.window.showErrorMessage('No test cases found. Please fetch and save test cases first.');
                return;
            }

            const results = await Promise.all(
                testCases.map(async (testCase, index) => {
                    const testDir = path.join(testcasesDir, testCase);
                    const inputPath = path.join(testDir, 'input.txt');
                    const expectedOutputPath = path.join(testDir, 'expected_output.txt');
                    const expectedOutput = fs.readFileSync(expectedOutputPath, 'utf-8').trim();

                    return new Promise<{ test: number; status: string; reason?: string }>((resolve) => {
                        runCode('python', inputPath, path.join(testDir, 'output.txt'), solutionFile, (err, userOutput) => {
                            if (err) {
                                resolve({ test: index + 1, status: 'Error', reason: err.message });
                            } else {
                                const normalize = (str: string) => str.replace(/\s+/g, '').trim();
                                if (normalize(userOutput || '') === normalize(expectedOutput)) {
                                    resolve({ test: index + 1, status: 'Passed' });
                                } else {
                                    resolve({
                                        test: index + 1,
                                        status: 'Failed',
                                        reason: `Expected "${expectedOutput}", but got "${userOutput}"`,
                                    });
                                }
                            }
                        });
                    });
                })
            );

            const passed = results.filter((result) => result.status === 'Passed').length;
            const failed = results.filter((result) => result.status === 'Failed').length;
            const errors = results.filter((result) => result.status === 'Error').length;

            vscode.window.showInformationMessage(`Summary: ${passed} Passed, ${failed} Failed, ${errors} Errors.`);
        } catch (error) {
            vscode.window.showErrorMessage(
                `Error while running the code: ${error instanceof Error ? error.message : String(error)}`
            );
        }
    });

    context.subscriptions.push(createWorkspaceCommand, fetchAndSaveTestCases, runUserCode);
}

export function deactivate() {
    console.log('CPH LeetCode Extension Deactivated.');
}
