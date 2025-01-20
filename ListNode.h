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

vector<vector<int>> processIntMatrix(const string& matrixString) {
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
vector<vector<double>> processDoubleMatrix(const string& matrixString) {
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
