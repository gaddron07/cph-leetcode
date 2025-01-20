import * as fs from 'fs';
import * as path from 'path';
import { fetchTestCases } from './fetchTestCases';
import { saveTestCases } from './saveTestCases';
import { runCode } from './runCode';
import readline from 'readline';

// Define TestResult Interface
interface TestResult {
    test: number;
    status: 'Passed' | 'Failed' | 'Error';
    reason?: string;
}
const askQuestion = (question: string): Promise<string> => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
};

// Function to add a test case
async function addTestCase(outputDir: string): Promise<void> {
    const testCaseNumber = fs.readdirSync(outputDir).filter((dir) => dir.startsWith("testcase_")).length + 1;
    const testCaseDir = path.join(outputDir, `testcase_${testCaseNumber}`);

    if (!fs.existsSync(testCaseDir)) {
        fs.mkdirSync(testCaseDir, { recursive: true });
    }

    const input = await askQuestion('Enter the input for the test case: ');
    const expectedOutput = await askQuestion('Enter the expected output for the test case: ');

    fs.writeFileSync(path.join(testCaseDir, 'input.txt'), input.trim());
    fs.writeFileSync(path.join(testCaseDir, 'expected_output.txt'), expectedOutput.trim());

    console.log(`Test case ${testCaseNumber} added successfully.`);
}

async function runTest(
    testDir: string,
    expectedOutput: string,
    testIndex: number,
    language: string,
    solutionFile: string
): Promise<TestResult> {
    const inputPath = path.join(testDir, 'input.txt');
    const outputPath = path.join(testDir, 'output.txt');
    return new Promise<TestResult>((resolve) => {
        runCode(language, inputPath, outputPath, solutionFile, (err, userOutput) => {
            if (err) {
                resolve({
                    test: testIndex,
                    status: 'Error',
                    reason: err.message,
                });
            } else {
                const normalize = (str: string) => str.replace(/\s+/g, '').trim();
                const safeUserOutput = userOutput ? normalize(userOutput) : '';

                const formattedExpectedOutput = normalize(expectedOutput);

                if (safeUserOutput === normalize(expectedOutput)) {
                    resolve({ test: testIndex, status: 'Passed' });
                } else {
                    resolve({
                        test: testIndex,
                        status: 'Failed',
                        reason: `Expected "${formattedExpectedOutput}", but got "${safeUserOutput}"`,
                    });
                }
            }
        });
    });
}

async function main(): Promise<void> {
    const problemName = await askQuestion('Enter the problem name: ');
    const language = await askQuestion('Enter the language: ');
    const solutionFile = await askQuestion('Enter the solution file path: ');

    if (!fs.existsSync(solutionFile)) {
        console.error('Solution file does not exist. Please provide a valid path.');
        return;
    }

    const url = `https://leetcode.com/problems/${problemName}/description/`;
    const outputDir = './testcases';

    try {
        if (fs.existsSync(outputDir)) {
            console.log('Deleting old test cases...');
            fs.rmSync(outputDir, { recursive: true, force: true });
        }

        console.log('Fetching test cases...');
        const { inputs, expectedOutputs } = await fetchTestCases(url);

        if (!inputs.length || !expectedOutputs.length) {
            console.error('No test cases were found. Please check the problem URL or page structure.');
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

        console.log('Would you like to add a custom test case? (yes/no)');
        const addCustom = await askQuestion('');
        if (addCustom.toLowerCase() === 'yes') {
            await addTestCase(outputDir);
        }

        console.log('Running tests...');
        const results: TestResult[] = await Promise.all(
            inputs.map(async (_, i: number) => {
                const testDir = path.join(outputDir, `testcase_${i + 1}`);
                const expectedOutput = expectedOutputs[i].trim();
                return runTest(testDir, expectedOutput, i + 1, language, solutionFile);
            })
        );

        const passed = results.filter((result) => result.status === 'Passed').length;
        const failed = results.filter((result) => result.status === 'Failed').length;
        const errors = results.filter((result) => result.status === 'Error').length;

        console.log('\nTest Results:');
        results.forEach(({ test, status, reason }) => {
            console.log(`Test ${test}: ${status}${reason ? ` - ${reason}` : ''}`);
        });

        console.log(`\nSummary: ${passed} Passed, ${failed} Failed, ${errors} Errors`);
    } catch (error) {
        console.error('An error occurred:', error instanceof Error ? error.message : String(error));
    }
}

main().catch((error) => {
    console.error('Unhandled error:', error instanceof Error ? error.message : String(error));
});
