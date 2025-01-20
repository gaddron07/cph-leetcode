import * as vscode from 'vscode';
import * as path from 'path';
import { fetchTestCases } from './fetchTestCases';
import { saveTestCases } from './saveTestCases';
import { runCode } from './runCode';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {
    console.log('LeetCode Helper Extension Activated.');

    // Command to fetch test cases, save them, and run the code
    let fetchRunTestCases = vscode.commands.registerCommand('extension.fetchRunTestCases', async () => {
        const problemName = await vscode.window.showInputBox({
            prompt: 'Enter the LeetCode problem name',
        });

        if (!problemName) {
            vscode.window.showErrorMessage('Problem name is required!');
            return;
        }

        const language = await vscode.window.showQuickPick(['python', 'java', 'cpp', 'javascript'], {
            placeHolder: 'Choose the programming language for the solution file',
        });

        if (!language) {
            vscode.window.showErrorMessage('Language is required!');
            return;
        }

        const solutionFileUri = await vscode.window.showOpenDialog({
            canSelectFiles: true,
            filters: {
                'Solution Files': ['.py', '.java', '.cpp', '.js'],
            },
        });

        if (!solutionFileUri || solutionFileUri.length === 0) {
            vscode.window.showErrorMessage('Solution file is required!');
            return;
        }

        const solutionFile = solutionFileUri[0].fsPath;

        const url = `https://leetcode.com/problems/${problemName}/description/`;
        const outputDir = path.resolve(context.extensionPath, 'testcases');

        try {
            if (fs.existsSync(outputDir)) {
                console.log('Deleting old test cases...');
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

            console.log(`Fetched ${inputs.length} test cases.`);
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
                const testCaseDir = path.join(outputDir, `testcase_${testCaseNumber}`);

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
                    vscode.window.showInformationMessage(`Test case ${testCaseNumber} added successfully.`);
                }
            }

            // Run the test cases
            console.log('Running tests...');
            const results: any[] = [];
            for (let i = 0; i < inputs.length; i++) {
                const testCaseDir = path.join(outputDir, `testcase_${i + 1}`);
                const expectedOutput = expectedOutputs[i].trim();

                await runCode(language, path.join(testCaseDir, 'input.txt'), path.join(testCaseDir, 'output.txt'), solutionFile, (err, userOutput) => {
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
		} catch (error: unknown) {
			if (error instanceof Error) {
				vscode.window.showErrorMessage(`An error occurred: ${error.message}`);
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
