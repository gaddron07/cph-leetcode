# Competitive Programming Helper (CPH) for LeetCode

The Competitive Programming Helper (CPH) is a Visual Studio Code extension designed to streamline the process of solving LeetCode problems. It automates tasks like fetching test cases, executing solutions locally, and organizing your workspace. Whether you are practicing for competitive programming or sharpening your algorithmic skills, CPH enhances your workflow.

---

## Features

### 1. **Automated Test Case Fetching**

- Fetch test cases directly from LeetCode problem URLs using Puppeteer.
- Automatically format and save test cases in structured directories.

### 2. **Local Test Case Execution**

- Run your solution against test cases locally.
- Supports multiple programming languages (e.g., C++, Python).
- Compare actual output with expected output effortlessly.

### 3. **Workspace Generation**

- Generate a structured workspace for solving LeetCode problems, including the following directories and files:
  - `src/` (contains core scripts like `fetchTestCases.ts`, `saveTestCases.ts`, and `runCode.ts`)
  - `testcases/` (stores input, output, and expected output files)
  - `user_solution` (for your custom solutions)

### 4. **Extensible Support**

- Write and test solutions in any language with minimal setup.
- Integration-ready with your preferred tools and compilers.

### 5. **Test Case Management**

- Add custom test cases manually to the `testcases/` directory.
- Organize test cases for different problems within the same workspace.

### 6. **Terminal Workflow Support**

- After writing your code, you can execute the entire workflow from the terminal.
- Run the `index.ts` script with the following steps:
  1. Enter the name of the problem (e.g., `Two Sum: two-sum`, `Rotate Image: rotate-image`).
  2. Specify the programming language (e.g., `C++`, `Python`).
  3. Provide the user code file name (e.g., `main.cpp`, `main.py`).
  4. Asks for the extra testcase to test with the fetched testcases.
  5. Also shows the errors present in the code, if there are none then compares the result directly.
---

## Installation

1. **Pre-requisites**:

   - Node.js (version 14 or later)
  - npm (Node package manager)
  - VS Code (for development and testing)

2. **Setup**:

   - Clone this repository.
   - Open the project in Visual Studio Code.
   - Install required Node.js and other dependencies:
     - Clone this repository.
- Open the project in Visual Studio Code.
- Install required Node.js dependencies:
  
  ```bash
  npm install
  npm install puppeteer
  npm install typescript --save-dev
  npm install @types/vscode --save-dev
  npm install axios
  npm install fs-extra
  npm install jsdom
  ```

- Install development tools:
  ```bash
  npm install --save-dev nodemon
  npm install --save-dev eslint
  npm install --save-dev prettier
  npm install --save-dev jest
  ```

- Install VS Code extension packaging tools:
  ```bash
  npm install --save-dev vsce
  ```

## Development Commands

- Compile TypeScript files (if using TypeScript):
  ```bash
  npx tsc
  ```

- Run the project:
  ```bash
  node src/index.js
  ```

- Run the extension in VS Code (for testing):
  ```bash
  code --extensionDevelopmentPath=.
  ```

- Run unit tests:
  ```bash
  npm test
  ```

- Run tests with coverage report:
  ```bash
  npm run test -- --coverage
  ```

- Lint the code (using ESLint):
  ```bash
  npm run lint
  ```

- Format the code (using Prettier):
  ```bash
  npm run format
  ```

- Check TypeScript types (if using TypeScript):
  ```bash
  npx tsc --noEmit
  ```

- Watch files for changes and recompile automatically (if using TypeScript):
  ```bash
  npx nodemon --exec "npx tsc"
  ```

- Run Puppeteer script (if using Puppeteer for fetching test cases):
  ```bash
  node src/fetchTestCases.js
  ```

## Build and Packaging

- Build the extension:
  ```bash
  npm run build
  ```

- Package the extension into a `.vsix` file for distribution:
  ```bash
  vsce package
  ```

- Publish the extension to the VS Code marketplace:
  ```bash
  vsce publish
  ```

- Publish a specific version of the extension:
  ```bash
  vsce publish <version>
  ```

- Generate release notes for a new version:
  ```bash
  vsce release-notes
  ```

## Additional Commands

- Clean up generated files (e.g., compiled `.js` files):
  ```bash
  npm run clean
  ```

- Install all dependencies after cloning the repository:
  ```bash
  npm ci
  ```

- Upgrade all dependencies to the latest allowed versions:
  ```bash
  npm update
  ```

## Usage Instructions

1. **Generate a Workspace**:
  -The instructions and format for wirting the code with example are present in the main.cpp(for codes in cpp) and main.py(for codes in python).
   
3. **Fetch Test Cases**:

   - Navigate to a LeetCode problem in your browser.
   - The testcases can directly fetch with the name of proble.
   - For example if the problem is Two Sum then the format of name must be like two-sum.

4. **Write Your Solution**:

   - Implement your solution in the provided `main.cpp`, `main.py`, or any other supported file with any desired name.
   - Ensure the provided snippets in `main.cpp` and `main.py` are used. These snippets are mandatory to parse the input correctly and initialize the arguments and they contain the instructions and functions that are present  to correctly parse the input.
   - For example:
     - Input for "Two Sum" might be an array of integers and a target integer.
     - The input format will be an array of strings (e.g., `arg[0]`, `arg[1]`).
     - Transform the input into the desired format:
       ```cpp
       // Example for main.cpp
       vector<int> nums = stringToIntArray(arg[0]);
       int target = stringToInt(arg[1]);
       ```
       ```python
       # Example for main.py
       nums = string_to_int_array(arg[0])
       target = int(arg[1])
       ```
   - Utility functions like `stringToIntArray`, `stringToInt` (C++), and `string_to_int_array`, `int` (Python) are provided to save time.
   - There are more functions that can be used in other problems, these functions are needed as the input format in leetcode are generally array which then are needed to convert into desired format.
   - Funtions like stringToIntArra then arrayToLinkedlist are used to convert the argument into a Linkedlist or some other data structures as Tree,DoublyLinkedList..etc.

5. **Run Your Code**:

   - Execute the workflow from the terminal using:
     ```bash
     node src/index.js
     ```
   - Follow the prompts to:
     1. Enter the problem name (e.g., `two-sum`).
     2. Specify the language (e.g., `C++`, `Python`).
     3. Provide the user code file name (e.g., `main.cpp`, `main.py`).
   - The script will run your solution against the saved test cases and display the results.

6. **Add Custom Test Cases**:

   - Manually add input and expected output files in the `testcases/` directory or add them in terminal when it asks for the additional testcase.
   - Ensure the file structure follows the naming convention (`input.txt`, `expected_output.txt`, etc.).

---
``` bash
## WorkSpace structure
/WorkSpace
|-- src 
| |-- fetchTestCases.ts 
| |-- saveTestCases.ts 
| |-- runCode.ts 
| |-- index.ts 
| |-- testcases 
| |-- testcase_1 
| | |-- input.txt 
| | |-- output.txt 
| | |-- expected_output.txt 
| |--ListNode.cpp 
| |--ListNode.h 
| |--ListNode.py 
| |-- main.cpp 
| |-- main.py
```
## Future Enhancements

- Support for additional competitive programming platforms.
- Integrated code submission functionality.
- Real-time test case debugging in the editor.
- Enhanced multi-language support with custom configuration options.

---

## Contributions

Contributions are welcome! Feel free to fork this repository, create a new branch, and submit a pull request. Please ensure all code changes are well-documented and tested.

---

## Acknowledgments

Special thanks to the competitive programming community for inspiring this project. This tool is tailored to enhance your problem-solving experience on LeetCode and beyond.


