import * as fs from 'fs';
import * as path from 'path';

function preprocessInput(input: string): string {
    // Replace instances of `][` with `],[`
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
            const value = current.split('=').pop()?.trim(); // Remove the name (before `=`)
            if (value) {values.push(value.replace(/,$/, '')); }// Remove trailing commas
            current = '';
        }
    }

    return values.map(value => {
        try {
            // Attempt to parse the value as JSON if it starts with `{` or `[`
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
    // Preprocess the input to handle `][` edge case
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
            console.error(`Skipping test case ${i + 1}: Missing input/output.`);
            skippedCount++;
            continue;
        }

        const formattedInput = formatListFromInput(input);
        const formattedExpectedOutput = formatListFromInput(expectedOutput);

        const testCaseDir = path.join(testcasesDir, `testcase_${i + 1}`);
        if (!fs.existsSync(testCaseDir)) {
            fs.mkdirSync(testCaseDir);
        }

        try {
            const inputFilePath = path.join(testCaseDir, 'input.txt');
            const outputFilePath = path.join(testCaseDir, 'expected_output.txt');

            fs.writeFileSync(inputFilePath, formattedInput);
            fs.writeFileSync(outputFilePath, formattedExpectedOutput);

            console.log(`Test case ${i + 1} saved successfully.`);
            savedCount++;
        } catch (err) {
            console.error(`Error saving test case ${i + 1}: ${err instanceof Error ? err.message : String(err)}`);
            skippedCount++;
        }
    }

    console.log(`\nSummary: ${savedCount} test cases saved, ${skippedCount} skipped.`);
}
