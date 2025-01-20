import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { fetchTestCases } from './fetchTestCases';
import { saveTestCases } from './saveTestCases';
import { runCode } from './runCode';

export function activate(context: vscode.ExtensionContext) {
    console.log('CPH Leetcode Extension Activated.');

    // Helper to create the workspace
    const createWorkspaceDir = (): string => {
        const homeDir = process.env.HOME || process.env.USERPROFILE || '~';
        const workspaceDir = path.join(homeDir, 'CPH-LeetCode-Workspace');
        const srcDir = path.join(workspaceDir, 'src');
        const testcasesDir = path.join(workspaceDir, 'testcases');

        if (!fs.existsSync(workspaceDir)) {
            console.log('Creating workspace...');
            fs.mkdirSync(workspaceDir, { recursive: true });

            // Create src folder with predefined files
            if (!fs.existsSync(srcDir)) {
                console.log('Creating src folder...');
                fs.mkdirSync(srcDir, { recursive: true });

                const files = {
                    'index.ts': `
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { fetchTestCases } from './fetchTestCases';
import { saveTestCases } from './saveTestCases';
import { runCode } from './runCode';

export function activate(context: vscode.ExtensionContext) {
    console.log('LeetCode Helper Extension Activated.');

    let fetchRunTestCases = vscode.commands.registerCommand('extension.fetchRunTestCases', async () => {
        const problemName = await vscode.window.showInputBox({
            prompt: 'Enter the LeetCode problem name',
        });

        if (!problemName) {
            vscode.window.showErrorMessage('Problem name is required!');
            return;
        }

        const language = await vscode.window.showQuickPick(['cpp', 'python'], {
            placeHolder: 'Choose the programming language for the solution file',
        });

        if (!language) {
            vscode.window.showErrorMessage('Language is required!');
            return;
        }

        // Create the user-specific workspace
        const workspaceDir = path.resolve(context.extensionPath, 'user');
        const outputDir = path.resolve(context.extensionPath, 'testcases');

        // Fetch test cases
        const url = \`https://leetcode.com/problems/\${problemName}/description/\`;
        try {
            if (fs.existsSync(outputDir)) {
                fs.rmSync(outputDir, { recursive: true, force: true });
            }

            console.log('Fetching test cases...');
            const { inputs, expectedOutputs } = await fetchTestCases(url);

            if (!inputs.length || !expectedOutputs.length) {
                vscode.window.showErrorMessage('No test cases were found. Please check the problem URL or page structure.');
                return;
            }

            if (inputs.length !== expectedOutputs.length) {
                throw new Error('Mismatch between number of inputs and expected outputs.');
            }

            console.log(\`Fetched \${inputs.length} test cases.\`);
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }

            console.log('Saving new test cases...');
            await saveTestCases(inputs, expectedOutputs, outputDir);

            vscode.window.showInformationMessage('Test cases fetched and saved successfully!');

            // Ask if user wants to add a custom test case
            const addCustom = await vscode.window.showQuickPick(['Yes', 'No'], {
                placeHolder: 'Would you like to add a custom test case?',
            });

            if (addCustom === 'Yes') {
                const testCaseNumber = fs.readdirSync(outputDir).filter((dir) => dir.startsWith('testcase_')).length + 1;
                const testCaseDir = path.join(outputDir, \`testcase_\${testCaseNumber}\`);

                if (!fs.existsSync(testCaseDir)) {
                    fs.mkdirSync(testCaseDir, { recursive: true });
                }

                const input = await vscode.window.showInputBox({
                    prompt: 'Enter the input for the custom test case:',
                });

                const expectedOutput = await vscode.window.showInputBox({
                    prompt: 'Enter the expected output for the custom test case:',
                });

                if (input && expectedOutput) {
                    fs.writeFileSync(path.join(testCaseDir, 'input.txt'), input.trim());
                    fs.writeFileSync(path.join(testCaseDir, 'expected_output.txt'), expectedOutput.trim());
                    vscode.window.showInformationMessage(\`Test case \${testCaseNumber} added successfully.\`);
                }
            }

            // Run the test cases
            console.log('Running tests...');
            const results: any[] = [];
            for (let i = 0; i < inputs.length; i++) {
                const testCaseDir = path.join(outputDir, \`testcase_\${i + 1}\`);
                const expectedOutput = expectedOutputs[i].trim();

                await runCode(language, path.join(testCaseDir, 'input.txt'), path.join(testCaseDir, 'output.txt'), path.resolve(workspaceDir, \`main.\${language}\`), (err, userOutput) => {
                    if (err) {
                        results.push({
                            test: i + 1,
                            status: 'Error',
                            reason: err.message,
                        });
                    } else {
                        const normalizedUserOutput = userOutput ? userOutput.trim() : '';
                        const normalizedExpectedOutput = expectedOutput.trim();

                        if (normalizedUserOutput === normalizedExpectedOutput) {
                            results.push({ test: i + 1, status: 'Passed' });
                        } else {
                            results.push({
                                test: i + 1,
                                status: 'Failed',
                                reason: \`Expected "\${normalizedExpectedOutput}\", but got "\${normalizedUserOutput}"\`,
                            });
                        }
                    }
                });
            }

            // Display the results
            console.log('Test Results:');
            results.forEach(({ test, status, reason }) => {
                console.log(\`Test \${test}: \${status}\${reason ? \` - \${reason}\` : ''}\`);
            });

            const passed = results.filter((result) => result.status === 'Passed').length;
            const failed = results.filter((result) => result.status === 'Failed').length;
            const errors = results.filter((result) => result.status === 'Error').length;

            vscode.window.showInformationMessage(\`Test Results: \${passed} Passed, \${failed} Failed, \${errors} Errors\`);

        } catch (error: unknown) {
            if (error instanceof Error) {
                vscode.window.showErrorMessage(\`An error occurred: \${error.message}\`);
            } else {
                vscode.window.showErrorMessage('An unknown error occurred.');
            }
        }
    });

    context.subscriptions.push(fetchRunTestCases);
}

export function deactivate() {
    console.log('LeetCode Helper Extension Deactivated.');
}
`,
                    'fetchTestCases.ts': `
import puppeteer from 'puppeteer-extra';
import StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

export async function fetchTestCases(url: string): Promise<{ inputs: string[]; expectedOutputs: string[] }> {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    try {
        console.log('Navigating to LeetCode URL...');
        await page.goto(url, { waitUntil: 'networkidle2' });

        console.log('Waiting for test case elements to load...');
        await page.waitForSelector('pre', { timeout: 30000 });

        console.log('Extracting test cases...');
        const data = await page.evaluate(() => {
            const inputs: string[] = [];
            const expectedOutputs: string[] = []; // Store the expected outputs (actual outputs)

            const examples = document.querySelectorAll('pre');
            examples.forEach((example) => {
                const text = example.textContent?.trim() || '';
                const inputMatch = text.match(/(?:Input:?\s*)([\s\S]*?)(?:Output:?)/i);
                const outputMatch = text.match(/(?:Output:?\s*)([\s\S]*)/i);

                if (inputMatch && inputMatch[1]) {
                    inputs.push(inputMatch[1].trim());
                }

                // We now only extract the expected output (actual output provided by LeetCode)
                if (outputMatch && outputMatch[1]) {
                    expectedOutputs.push(outputMatch[1].split(/\n/)[0].trim()); // Store the expected output
                }
            });

            return { inputs, expectedOutputs }; // Return only inputs and expectedOutputs
        });

        if (!data.inputs.length || !data.expectedOutputs.length) {
            throw new Error('No test cases found. Please verify the page structure or URL.');
        }

        console.log('Test cases extracted successfully.');
        return data;

    } catch (err) {
        if (err instanceof Error) {
            console.error('Error fetching test cases:', err.message);
        } else {
            console.error('An unknown error occurred:', err);
        }
        throw err;
    } finally {
        await browser.close();
        console.log('Browser closed.');
    }
}
`,
                    'saveTestCases.ts': `
import * as fs from 'fs';
import * as path from 'path';

function preprocessInput(input: string): string {
    // Replace instances of \`][\` with \`],[\`
    return input.replace(/\]\[/g, '],[');
}

function parseInput(input: string): any[] {
    const values: any[] = [];
    let current = '';
    let openBrackets = 0;

    for (let i = 0; i < input.length; i++) {
        const char = input[i];
        if (char === '[' || char === '{') {openBrackets++;}
        if (char === ']' || char === '}') {openBrackets--;}
        current += char;

        // When encountering a comma at the top level or reaching the end of the input
        if ((char === ',' && openBrackets === 0) || i === input.length - 1) {
            const value = current.split('=').pop()?.trim(); // Remove the name (before \`=\`)
            if (value) {values.push(value.replace(/,$/, '')); }// Remove trailing commas
            current = '';
        }
    }

    return values.map(value => {
        try {
            // Attempt to parse the value as JSON if it starts with \`{\` or \`[\`
            if (value.startsWith('[') || value.startsWith('{')) {
                return JSON.parse(value);
            }
            // If quoted string, strip quotes
            if (value.startsWith('"') && value.endsWith('"')) {
                return value.slice(1, -1);
            }
            // If numeric, convert to a number
            if (!isNaN(Number(value))) {
                return Number(value);
            }
        } catch {
            // If JSON parsing fails, return the raw value
            return value;
        }
        return value;
    });
}

function format(input: string): string {
    const result: string[] = [];
    const parts = input.match(/\[.*?\]|[^,\[\]]+/g); // Split into groups
    if (!parts) {return '';}

    for (let part of parts) {
        part = part.trim();
        if (part.startsWith('[') && part.endsWith(']')) {
            // For arrays, remove brackets and format with spaces
            const rows = part
                .replace(/[\[\]]/g, '') // Remove brackets
                .split('],') // Split by rows
                .map(row => row.replace(/,/g, ' ').trim()); // Replace commas with spaces
            result.push(...rows);
        } else {
            result.push(part.trim());
        }
    }

    return result.join('\n');
}

export function formatListFromInput(input: string): string {
    // Preprocess the input to handle \`][\` edge case
    input = preprocessInput(input);

    const parsedValues = parseInput(input); // Extract values
    const formattedValues: string[] = [];

    for (let item of parsedValues) {
        // Convert arrays or objects into formatted strings
        if (Array.isArray(item) || typeof item === 'object') {
            formattedValues.push(JSON.stringify(item));
        } else {
            formattedValues.push(item.toString());
        }
    }

    // Join all formatted values with newlines
    return formattedValues.join('\n').trim();
}


// Example Usage
//const input = "[\"MedianFinder\", \"addNum\", \"addNum\", \"findMedian\", \"addNum\", \"findMedian\"][[], [1], [2], [], [3], []]";
//console.log(formatListFromInput(input));
export async function saveTestCases(
    inputs: string[],
    expectedOutputs: string[],
    outputDir: string
): Promise<void> {
    const testcasesDir = path.resolve(outputDir);
    if (!fs.existsSync(testcasesDir)) {
        fs.mkdirSync(testcasesDir, { recursive: true });
    }

    let savedCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i];
        const expectedOutput = expectedOutputs[i];

        if (!input || !expectedOutput) {
            console.error(\`Skipping test case \${i + 1}: Missing input/output.\`);
            skippedCount++;
            continue;
        }

        const formattedInput = formatListFromInput(input);
        const formattedExpectedOutput = formatListFromInput(expectedOutput);

        const testCaseDir = path.join(testcasesDir, \`testcase_\${i + 1}\`);
        if (!fs.existsSync(testCaseDir)) {
            fs.mkdirSync(testCaseDir);
        }

        try {
            const inputFilePath = path.join(testCaseDir, 'input.txt');
            const outputFilePath = path.join(testCaseDir, 'expected_output.txt');

            fs.writeFileSync(inputFilePath, formattedInput);
            fs.writeFileSync(outputFilePath, formattedExpectedOutput);

            console.log(\`Test case \${i + 1} saved successfully.\`);
            savedCount++;
        } catch (err) {
            console.error(\`Error saving test case \${i + 1}: \${err instanceof Error ? err.message : String(err)}\`);
            skippedCount++;
        }
    }

    console.log(\`\nSummary: \${savedCount} test cases saved, \${skippedCount} skipped.\`);
}

                    `,
                    'runCode.ts': `
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import * as os from 'os';

interface LanguageConfig {
    name: string;
    runCommand: string;
    fileExtension: string;
    compileCommand?: string;
    execCommand: string;
}

const languages: { [key: string]: LanguageConfig } = {
    python: { name: 'python', runCommand: 'python', fileExtension: '.py', execCommand: 'python' },
    java: { name: 'java', runCommand: 'javac', fileExtension: '.java', compileCommand: 'javac', execCommand: 'java' },
    cpp: { name: 'cpp', runCommand: 'g++ -o', fileExtension: '.cpp', compileCommand: 'g++ -o', execCommand: '' }, // Adjusted for dynamic exec
    javascript: { name: 'javascript', runCommand: 'node', fileExtension: '.js', execCommand: 'node' },
};

export function runCode(
    language: string,
    inputPath: string,
    outputPath: string,
    solutionFile: string,
    callback: (err: Error | null, result: string | null) => void
): void {
    const lang = languages[language.toLowerCase()];
    if (!lang) {
        return callback(new Error(\`Unsupported language: \${language}\`), null);
    }

    const inputFile = path.resolve(inputPath);
    const outputFile = path.resolve(outputPath);

    if (!fs.existsSync(inputFile)) {
        return callback(new Error(\`Input file not found: \${inputFile}\`), null);
    }

    if (!fs.existsSync(path.dirname(outputFile))) {
        return callback(new Error(\`Output directory does not exist: \${path.dirname(outputFile)}\`), null);
    }

    if (!solutionFile.endsWith(lang.fileExtension)) {
        return callback(
            new Error(\`Incorrect solution file extension. Expected \${lang.fileExtension}, got \${path.extname(solutionFile)}\`),
            null
        );
    }

    const solutionFilePath = path.resolve(solutionFile);
    if (!fs.existsSync(solutionFilePath)) {
        return callback(new Error(\`Solution file not found: \${solutionFilePath}\`), null);
    }

    let command = '';
    if (lang.name === 'python' || lang.name === 'javascript') {
        command = \`\${lang.runCommand} \${solutionFilePath} < \${inputFile} > \${outputFile}\`;
        executeCommand(command, outputFile, callback);
    } else if (lang.name === 'cpp') {
        const compiledFile = os.platform() === 'win32' ? 'user_solution.exe' : './user_solution';
        const compileCommand = \`\${lang.compileCommand} user_solution \${solutionFilePath}\`;
        exec(compileCommand, (compileErr) => {
            if (compileErr) {
                return callback(new Error('C++ compilation failed: ' + compileErr.message), null);
            }
            command = \`\${compiledFile} < \${inputFile} > \${outputFile}\`;
            executeCommand(command, outputFile, (err, result) => {
                if (!err) {
                    cleanup(compiledFile);
                }
                callback(err, result);
            });
        });
    } else if (lang.name === 'java') {
        const compileCommand = \`\${lang.compileCommand} \${solutionFilePath}\`;
        exec(compileCommand, (compileErr) => {
            if (compileErr) {
                return callback(new Error('Java compilation failed: ' + compileErr.message), null);
            }
            const className = path.basename(solutionFilePath, '.java');
            command = \`\${lang.execCommand} \${className} < \${inputFile} > \${outputFile}\`;
            executeCommand(command, outputFile, (err, result) => {
                if (!err) {
                    cleanup(\`\${className}.class\`);
                }
                callback(err, result);
            });
        });
    } else {
        callback(new Error('Unsupported language configuration'), null);
    }
}

// Helper function to execute commands
function executeCommand(
    command: string,
    outputFile: string,
    callback: (err: Error | null, result: string | null) => void
): void {
    exec(command, { timeout: 10000 }, (err, stdout, stderr) => {
        if (err || stderr) {
            const errorMessage = stderr || (err as Error).message || 'Unknown execution error';
            return callback(new Error(errorMessage), null);
        }
        try {
            const userOutput = fs.readFileSync(outputFile, 'utf-8').trim();
            callback(null, userOutput);
        } catch (fileErr: unknown) {
            callback(fileErr instanceof Error ? fileErr : new Error('Error reading output file'), null);
        }
    });
}

// Helper function to clean up generated files
function cleanup(filePath: string): void {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch (err) {
        console.error(\`Failed to clean up file: \${filePath}, \${(err as Error).message}\`);
    }
}
`,
                };

                for (const [fileName, content] of Object.entries(files)) {
                    fs.writeFileSync(path.join(srcDir, fileName), content, 'utf8');
                }
            }

            // Create testcases folder
            if (!fs.existsSync(testcasesDir)) {
                console.log('Creating testcases folder...');
                fs.mkdirSync(testcasesDir, { recursive: true });
            }

            // Create user files folder with templates
            if (true) {
                console.log('Creating user files folder...');
        

                const files = {
                    
'main.cpp': `
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

/**
* USER INSTRUCTIONS:
* 1. Parse the input using "parseInput".
* 2. Convert arguments to desired types:
*    - 1D Array: Use "stringToArray" with the required conversion function.
*    - 2D Matrix: Use "stringToMatrix" with the required conversion function.
*    - Linked List: Use "arrayToLinkedList".
*    - Doubly Linked List: Use "arrayToDoubleLinkedList".
*    - Binary Tree: Use "arrayToTree".
* 3. Use tree traversal functions for traversal:
*    - Inorder: "inorderTraversal".
*    - Preorder: "preorderTraversal".
*    - Postorder: "postorderTraversal".
* 4. Write your solution using the converted data in the designated section.
*/


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
`,
                'main.py': `import sys
from listNode import parse_input, array_to_linked_list, array_to_double_linked_list, array_to_tree, traversal_inorder, traversal_preorder, traversal_postorder

"""
Instructions for the User:
1. Write your solution code below the section "# User Solution Code Goes Here".
2. If your solution requires converting an input to a specific structure, use the functions:
- Convert 1D/2D arrays: Use "conversion_to_list(arg)".
- Convert to linked list: Use "array_to_linked_list(argument)".
- Convert to double linked list: Use "array_to_double_linked_list(argument)".
- Convert to tree: Use "array_to_tree(argument)".
- For specific traversal of trees:
  - Use "traversal_inorder(array_to_tree(argument))" for in-order.
  - Use "traversal_preorder(array_to_tree(argument))" for pre-order.
  - Use "traversal_postorder(array_to_tree(argument))" for post-order.

3. You can pass any parsed arguments (converted or raw) to your solution function as required.

4. Input:
- The program reads all inputs from stdin. Input is provided line by line.
- For multiple arguments, ensure inputs are provided in the correct order.

5. Output:
- Print the output of your solution.
"""

# User Solution Code Goes Here

# Read input for arguments
arg = sys.stdin.read().strip().split('/n')

# Parse and process arguments
args = parse_input(arg)

# Example: Convert inputs to required formats as needed for your solution
# Call the user's solution function with prepared arguments
# result = solution(*args)

# Output the result
# print(result)
`,
                'ListNode.cpp': `// ListNode.cpp

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
`,
                'ListNode.h': `
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
`,
                'Pyhton.py':
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
`
                };

                for (const [fileName, content] of Object.entries(files)) {
                    fs.writeFileSync(path.join(fileName), content, 'utf8');
                }
            }
        }

        return workspaceDir;
    };

    // Command 1: Create Workspace
    const createWorkspace = vscode.commands.registerCommand('extension.createWorkspace', async () => {
        const workspaceDir = createWorkspaceDir();
        vscode.window.showInformationMessage(`Workspace created at ${workspaceDir}`);

        // Open the created workspace in a new VS Code window
        const uri = vscode.Uri.file(workspaceDir);
        vscode.commands.executeCommand('vscode.openFolder', uri, true);
    });

    // Command 2: Fetch and Run Test Cases
    const fetchRunTestCases = vscode.commands.registerCommand('extension.fetchRunTestCases', async () => {
        console.log('Fetch and Run Test Cases command triggered.');

        // Prompt for problem name
        const problemName = await vscode.window.showInputBox({
            prompt: 'Enter the LeetCode problem name',
        });

        if (!problemName) {
            vscode.window.showErrorMessage('Problem name is required!');
            return;
        }

        // Prompt for programming language
        const language = await vscode.window.showQuickPick(['python', 'cpp'], {
            placeHolder: 'Choose the programming language for the solution file',
        });

        if (!language) {
            vscode.window.showErrorMessage('Language is required!');
            return;
        }

        // Fetch and process test cases
        const url = `https://leetcode.com/problems/${problemName}/description/`;
        const outputDir = path.join(createWorkspaceDir(), 'testcases');

        try {
            if (fs.existsSync(outputDir)) {
                fs.rmSync(outputDir, { recursive: true, force: true });
            }

            const { inputs, expectedOutputs } = await fetchTestCases(url);

            if (!inputs.length || !expectedOutputs.length) {
                vscode.window.showErrorMessage('No test cases found.');
                return;
            }

            await saveTestCases(inputs, expectedOutputs, outputDir);
            vscode.window.showInformationMessage('Test cases fetched and saved successfully!');

            const results: any[] = [];
            await Promise.all(
                inputs.map(async (_, i) => {
                    const testCaseDir = path.join(outputDir, `testcase_${i + 1}`);
                    const expectedOutput = expectedOutputs[i].trim();

                    try {
                        const userOutput = await new Promise<string>((resolve, reject) => {
                            runCode(
                                language,
                                path.join(testCaseDir, 'input.txt'),
                                path.join(testCaseDir, 'output.txt'),
                                path.join(createWorkspaceDir(), 'user_files', `main.${language}`),
                                (err, output) => {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        resolve(output || '');
                                    }
                                }
                            );
                        });

                        if (userOutput.trim() === expectedOutput) {
                            results.push({ test: i + 1, status: 'Passed' });
                        } else {
                            results.push({
                                test: i + 1,
                                status: 'Failed',
                                reason: `Expected "${expectedOutput}", but got "${userOutput}"`,
                            });
                        }
                    } catch (err: any) {
                        results.push({ test: i + 1, status: 'Error', reason: err.message });
                    }
                })
            );

            const passed = results.filter((r) => r.status === 'Passed').length;
            const failed = results.filter((r) => r.status === 'Failed').length;

            vscode.window.showInformationMessage(`Results: ${passed} Passed, ${failed} Failed`);
        } catch (error: unknown) {
            vscode.window.showErrorMessage(`Error: ${(error as Error).message}`);
        }
    });

    context.subscriptions.push(createWorkspace);
    context.subscriptions.push(fetchRunTestCases);
}

export function deactivate() {
    console.log('CPH Leetcode Extension Deactivated.');
}
