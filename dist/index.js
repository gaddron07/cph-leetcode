"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
const fetchTestCases_1 = require("./fetchTestCases");
const saveTestCases_1 = require("./saveTestCases");
const runCode_1 = require("./runCode");
function activate(context) {
    console.log('LeetCode Helper Extension Activated.');
    let fetchRunTestCases = vscode.commands.registerCommand('extension.fetchRunTestCases', () => __awaiter(this, void 0, void 0, function* () {
        const problemName = yield vscode.window.showInputBox({
            prompt: 'Enter the LeetCode problem name',
        });
        if (!problemName) {
            vscode.window.showErrorMessage('Problem name is required!');
            return;
        }
        const language = yield vscode.window.showQuickPick(['cpp', 'python'], {
            placeHolder: 'Choose the programming language for the solution file',
        });
        if (!language) {
            vscode.window.showErrorMessage('Language is required!');
            return;
        }
        // Create the user-specific workspace
        const workspaceDir = path.resolve(context.extensionPath, 'user');
        const outputDir = path.resolve(context.extensionPath, 'testcases');
        // Setup workspace with helper files (main.cpp, listNode.h, etc.)
        setupWorkspace(workspaceDir, language);
        // Fetch test cases
        const url = `https://leetcode.com/problems/${problemName}/description/`;
        try {
            if (fs.existsSync(outputDir)) {
                fs.rmSync(outputDir, { recursive: true, force: true });
            }
            console.log('Fetching test cases...');
            const { inputs, expectedOutputs } = yield (0, fetchTestCases_1.fetchTestCases)(url);
            if (!inputs.length || !expectedOutputs.length) {
                vscode.window.showErrorMessage('No test cases were found. Please check the problem URL or page structure.');
                return;
            }
            if (inputs.length !== expectedOutputs.length) {
                throw new Error('Mismatch between number of inputs and expected outputs.');
            }
            console.log(`Fetched ${inputs.length} test cases.`);
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }
            console.log('Saving new test cases...');
            yield (0, saveTestCases_1.saveTestCases)(inputs, expectedOutputs, outputDir);
            vscode.window.showInformationMessage('Test cases fetched and saved successfully!');
            // Ask if user wants to add a custom test case
            const addCustom = yield vscode.window.showQuickPick(['Yes', 'No'], {
                placeHolder: 'Would you like to add a custom test case?',
            });
            if (addCustom === 'Yes') {
                const testCaseNumber = fs.readdirSync(outputDir).filter((dir) => dir.startsWith('testcase_')).length + 1;
                const testCaseDir = path.join(outputDir, `testcase_${testCaseNumber}`);
                if (!fs.existsSync(testCaseDir)) {
                    fs.mkdirSync(testCaseDir, { recursive: true });
                }
                const input = yield vscode.window.showInputBox({
                    prompt: 'Enter the input for the custom test case:',
                });
                const expectedOutput = yield vscode.window.showInputBox({
                    prompt: 'Enter the expected output for the custom test case:',
                });
                if (input && expectedOutput) {
                    fs.writeFileSync(path.join(testCaseDir, 'input.txt'), input.trim());
                    fs.writeFileSync(path.join(testCaseDir, 'expected_output.txt'), expectedOutput.trim());
                    vscode.window.showInformationMessage(`Test case ${testCaseNumber} added successfully.`);
                }
            }
            // Run the test cases
            console.log('Running tests...');
            const results = [];
            for (let i = 0; i < inputs.length; i++) {
                const testCaseDir = path.join(outputDir, `testcase_${i + 1}`);
                const expectedOutput = expectedOutputs[i].trim();
                yield (0, runCode_1.runCode)(language, path.join(testCaseDir, 'input.txt'), path.join(testCaseDir, 'output.txt'), path.resolve(workspaceDir, `main.${language}`), (err, userOutput) => {
                    if (err) {
                        results.push({
                            test: i + 1,
                            status: 'Error',
                            reason: err.message,
                        });
                    }
                    else {
                        const normalizedUserOutput = userOutput ? userOutput.trim() : '';
                        const normalizedExpectedOutput = expectedOutput.trim();
                        if (normalizedUserOutput === normalizedExpectedOutput) {
                            results.push({ test: i + 1, status: 'Passed' });
                        }
                        else {
                            results.push({
                                test: i + 1,
                                status: 'Failed',
                                reason: `Expected "${normalizedExpectedOutput}", but got "${normalizedUserOutput}"`,
                            });
                        }
                    }
                });
            }
            // Display the results
            console.log('Test Results:');
            results.forEach(({ test, status, reason }) => {
                console.log(`Test ${test}: ${status}${reason ? ` - ${reason}` : ''}`);
            });
            const passed = results.filter((result) => result.status === 'Passed').length;
            const failed = results.filter((result) => result.status === 'Failed').length;
            const errors = results.filter((result) => result.status === 'Error').length;
            vscode.window.showInformationMessage(`Test Results: ${passed} Passed, ${failed} Failed, ${errors} Errors`);
        }
        catch (error) {
            if (error instanceof Error) {
                vscode.window.showErrorMessage(`An error occurred: ${error.message}`);
            }
            else {
                vscode.window.showErrorMessage('An unknown error occurred.');
            }
        }
    }));
    context.subscriptions.push(fetchRunTestCases);
}
// Setup workspace with necessary files
function setupWorkspace(workspaceDir, language) {
    if (!fs.existsSync(workspaceDir)) {
        fs.mkdirSync(workspaceDir, { recursive: true });
    }
    const mainTemplate = path.resolve(workspaceDir, `main.${language}`);
    const listNodeHeader = path.resolve(workspaceDir, 'ListNode.h');
    const listNodeCpp = path.resolve(workspaceDir, 'ListNode.cpp');
    const listNodePy = path.resolve(workspaceDir, 'ListNode.py');
    // Write or overwrite main file
    const mainContent = generateMainFileContent(language);
    fs.writeFileSync(mainTemplate, mainContent);
    // Write or overwrite ListNode files (based on the selected language)
    if (language === 'cpp') {
        fs.writeFileSync(listNodeHeader, generateListNodeHeaderCpp());
        fs.writeFileSync(listNodeCpp, generateListNodeCpp());
    }
    else if (language === 'python') {
        fs.writeFileSync(listNodePy, generateListNodePython());
    }
}
// Generate main file content based on the selected language
function generateMainFileContent(language) {
    if (language === 'cpp') {
        return `
#include <bits/stdc++.h>
#include "ListNode.h"
using namespace std;


// Function to read input from file
string readInputFromFile(const string& filename) {
    ifstream file(filename);
    stringstream buffer;
    buffer << file.rdbuf(); // Read the entire file into the buffer
    return buffer.str(); // Return the content as a string
}


 USER INSTRUCTIONS:
  1. Parse the input using parseInput.
  2. Convert arguments to desired types:
     - 1D Array: Use stringToArray with the required conversion function.
     - 2D Matrix: Use stringToMatrix with the required conversion function.
     - Linked List: Use arrayToLinkedList.
     - Doubly Linked List: Use arrayToDoubleLinkedList.
     - Binary Tree: Use arrayToTree.
  3. Use tree traversal functions for traversal:
     - Inorder: inorderTraversal.
     - Preorder: preorderTraversal.
     - Postorder: postorderTraversal.
  4. Write your solution using the converted data in the designated section.
 


int main() {
    // this are needed for reading from file so must be in code
    string line;
    stringstream inputStream;
    while (getline(cin, line)) {
        inputStream << line;
    }
    string inputData = inputStream.str();  // Get the complete input as a string
    vector<int> arr;
    arr = stringToArray<int>(inputData, stringToInt); // Use the helper function to convert to array
    // Here the arguments are parsed and converted to the desired type

   

    // Now you can use your desired operation

    return 0;
}

        `;
    }
    else if (language === 'python') {
        return `
import sys
from listNode import parse_input, array_to_linked_list, array_to_double_linked_list, array_to_tree, traversal_inorder, traversal_preorder, traversal_postorder

"""
Instructions for the User:
1. Write your solution code below the section # User Solution Code Goes Here.
2. If your solution requires converting an input to a specific structure, use the functions:
    - Convert 1D/2D arrays: Use conversion_to_list(arg).
    - Convert to linked list: Use array_to_linked_list(argument).
    - Convert to double linked list: Use array_to_double_linked_list(argument).
    - Convert to tree: Use array_to_tree(argument).
    - For specific traversal of trees:
      - Use traversal_inorder(array_to_tree(argument)) for in-order.
      - Use traversal_preorder(array_to_tree(argument)) for pre-order.
      - Use traversal_postorder(array_to_tree(argument)) for post-order.

3. You can pass any parsed arguments (converted or raw) to your solution function as required.

4. Input:
   - The program reads all inputs from stdin. Input is provided line by line.
   - For multiple arguments, ensure inputs are provided in the correct order.

5. Output:
   - Print the output of your solution.
"""

# User Solution Code Goes Here

# Read input for arguments
arg = sys.stdin.read().strip().split('\n')

# Parse and process arguments
args = parse_input(arg)

# Example: Convert inputs to required formats as needed for your solution
# Call the user's solution function with prepared arguments
# result = solution(*args)

# Output the result
# print(result)
`;
    }
    return '';
}
// Generate ListNode files (C++ and Python)
function generateListNodeHeaderCpp() {
    return `
// ListNode.h

#ifndef LISTNODE_H
#define LISTNODE_H

#include <string>
#include <vector>
#include <queue>

using namespace std;

// Class declaration for singly-linked list node
struct ListNode {
    string val;
    ListNode* next;
    ListNode(string x);
};

// Class declaration for doubly-linked list node
struct DoubleListNode {
    string val;
    DoubleListNode* next;
    DoubleListNode* prev;
    DoubleListNode(string x);
};

// Class declaration for binary tree node
struct TreeNode {
    string val;
    TreeNode* left;
    TreeNode* right;
    TreeNode(string x);
};

// Function declarations for utility functions
vector<string> parseInput(const vector<string>& input_data);
string trimBrackets(const string& str);
vector<string> split(const string& str, char delimiter);

// Template function declarations for converting strings
template <typename T>
vector<T> stringToArray(const string& str, T (*convertFunc)(const string&));

template <typename T>
vector<vector<T>> stringToMatrix(const string& input, T (*convertFunc)(const string&));

// Conversion functions for different types
int stringToInt(const string& str);
double stringToDouble(const string& str);
string stringToString(const string& str);

// Function declarations for converting arrays to linked lists and trees
ListNode* arrayToLinkedList(const vector<string>& arr);
DoubleListNode* arrayToDoubleLinkedList(const vector<string>& arr);
TreeNode* arrayToTree(const vector<string>& arr);

// Tree traversal function declarations
vector<string> inorderTraversal(TreeNode* root);
vector<string> preorderTraversal(TreeNode* root);
vector<string> postorderTraversal(TreeNode* root);

// Function to read input from file
string readInputFromFile(const string& filename);

#endif // LISTNODE_H

    `;
}
function generateListNodeCpp() {
    return `
// ListNode.cpp

#include "ListNode.h"
#include <sstream>
#include <algorithm>
#include <fstream>

// Constructor definitions for the classes
ListNode::ListNode(string x) : val(x), next(nullptr) {}
DoubleListNode::DoubleListNode(string x) : val(x), next(nullptr), prev(nullptr) {}
TreeNode::TreeNode(string x) : val(x), left(nullptr), right(nullptr) {}

// Function implementations

vector<string> parseInput(const vector<string>& input_data) {
    vector<string> args;
    for (const string& line : input_data) {
        if (!line.empty()) {
            args.push_back(line);
        }
    }
    return args;
}

string trimBrackets(const string& str) {
    if (str.front() == '[' && str.back() == ']') {
        return str.substr(1, str.size() - 2);
    }
    return str;
}

vector<string> split(const string& str, char delimiter) {
    vector<string> tokens;
    string token;
    stringstream ss(str);
    while (getline(ss, token, delimiter)) {
        tokens.push_back(token);
    }
    return tokens;
}

// Template function definitions for converting strings
template <typename T>
vector<T> stringToArray(const string& str, T (*convertFunc)(const string&)) {
    string trimmed = trimBrackets(str);
    vector<string> elements = split(trimmed, ',');
    vector<T> result;
    for (auto& element : elements) {
        element.erase(remove(element.begin(), element.end(), ' '), element.end()); // Remove spaces
        result.push_back(convertFunc(element)); // Convert string to the required type
    }
    return result;
}

template <typename T>
vector<vector<T>> stringToMatrix(const string& input, T (*convertFunc)(const string&)) {
    vector<vector<T>> matrix;
    stringstream ss(input);
    string temp;
    
    // Remove the surrounding brackets
    ss.ignore(2); // Skip the "[[" at the start
    while (getline(ss, temp, ']')) {
        if (temp.empty()) continue;
        vector<T> row;
        stringstream rowStream(temp);
        string num;
        while (getline(rowStream, num, ',')) {
            row.push_back(convertFunc(num)); // Convert the string to the appropriate type
        }
        matrix.push_back(row);
    }
    
    return matrix;
}

// Conversion functions for different types
int stringToInt(const string& str) {
    return stoi(str); // Converts string to integer
}

double stringToDouble(const string& str) {
    return stod(str); // Converts string to double
}

string stringToString(const string& str) {
    return str; // Directly returns the string (for string-based matrices)
}

// Function implementations for linked list and tree conversions
ListNode* arrayToLinkedList(const vector<string>& arr) {
    ListNode dummy("");
    ListNode* current = &dummy;
    for (const string& value : arr) {
        current->next = new ListNode(value);
        current = current->next;
    }
    return dummy.next;
}

DoubleListNode* arrayToDoubleLinkedList(const vector<string>& arr) {
    DoubleListNode dummy("");
    DoubleListNode* current = &dummy;
    for (const string& value : arr) {
        DoubleListNode* node = new DoubleListNode(value);
        current->next = node;
        node->prev = current;
        current = node;
    }
    return dummy.next;
}

TreeNode* arrayToTree(const vector<string>& arr) {
    if (arr.empty()) return nullptr;

    TreeNode* root = new TreeNode(arr[0]);
    queue<TreeNode*> q;
    q.push(root);
    size_t i = 1;

    while (i < arr.size()) {
        TreeNode* current = q.front();
        q.pop();

        if (i < arr.size() && arr[i] != "null") {
            current->left = new TreeNode(arr[i]);
            q.push(current->left);
        }
        ++i;

        if (i < arr.size() && arr[i] != "null") {
            current->right = new TreeNode(arr[i]);
            q.push(current->right);
        }
        ++i;
    }

    return root;
}

// Tree traversal function implementations
vector<string> inorderTraversal(TreeNode* root) {
    if (!root) return {};
    vector<string> left = inorderTraversal(root->left);
    vector<string> right = inorderTraversal(root->right);
    left.push_back(root->val);
    left.insert(left.end(), right.begin(), right.end());
    return left;
}

vector<string> preorderTraversal(TreeNode* root) {
    if (!root) return {};
    vector<string> left = preorderTraversal(root->left);
    vector<string> right = preorderTraversal(root->right);
    vector<string> result = {root->val};
    result.insert(result.end(), left.begin(), left.end());
    result.insert(result.end(), right.begin(), right.end());
    return result;
}

vector<string> postorderTraversal(TreeNode* root) {
    if (!root) return {};
    vector<string> left = postorderTraversal(root->left);
    vector<string> right = postorderTraversal(root->right);
    left.insert(left.end(), right.begin(), right.end());
    left.push_back(root->val);
    return left;
}

// Function to read input from file
string readInputFromFile(const string& filename) {
    ifstream file(filename);
    stringstream buffer;
    buffer << file.rdbuf(); // Read the entire file into the buffer
    return buffer.str(); // Return the content as a string
}
  `;
}
function generateListNodePython() {
    return `
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

# Function to parse input data from stdin
def parse_input(input_data):
    input_data = [line.strip() for line in input_data if line.strip()]  # Remove empty lines and strip whitespace
    args = []

    for line in input_data:
        try:
            parsed = ast.literal_eval(line)
            args.append(parsed)
        except (ValueError, SyntaxError):
            args.append(line)
    
    return args

# Functions to convert arrays to specific data structures
def array_to_linked_list(arr):
    head = ListNode(0)  # Dummy head node
    current = head
    for value in arr:
        current.next = ListNode(value)
        current = current.next
    return head.next  # Return the actual head node

def array_to_double_linked_list(arr):
    head = DoubleListNode(0)  # Dummy head node
    current = head
    for value in arr:
        node = DoubleListNode(value)
        current.next = node
        node.prev = current
        current = node
    return head.next  # Return the actual head node

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

# Tree Traversal Functions
def traversal_inorder(root):
    return traversal_inorder(root.left) + [root.val] + traversal_inorder(root.right) if root else []

def traversal_preorder(root):
    return [root.val] + traversal_preorder(root.left) + traversal_preorder(root.right) if root else []

def traversal_postorder(root):
    return traversal_postorder(root.left) + traversal_postorder(root.right) + [root.val] if root else []

# Conversion Function for General Use
def conversion_to_list(arg):
    for a in range(len(arg)):
        if '[' in arg[a]:
            arg[a] = ast.literal_eval(arg[a])
    return arg
  `;
}
function deactivate() {
    console.log('LeetCode Helper Extension Deactivated.');
}
