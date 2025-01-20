import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import os from 'os'; // Import to detect the operating system

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
        return callback(new Error(`Unsupported language: ${language}`), null);
    }

    const inputFile = path.resolve(inputPath);
    const outputFile = path.resolve(outputPath);

    if (!fs.existsSync(inputFile)) {
        return callback(new Error(`Input file not found: ${inputFile}`), null);
    }

    if (!fs.existsSync(path.dirname(outputFile))) {
        return callback(new Error(`Output directory does not exist: ${path.dirname(outputFile)}`), null);
    }

    if (!solutionFile.endsWith(lang.fileExtension)) {
        return callback(
            new Error(`Incorrect solution file extension. Expected ${lang.fileExtension}, got ${path.extname(solutionFile)}`),
            null
        );
    }

    const solutionFilePath = path.resolve(solutionFile);
    if (!fs.existsSync(solutionFilePath)) {
        return callback(new Error(`Solution file not found: ${solutionFilePath}`), null);
    }

    let command = '';
    if (lang.name === 'python' || lang.name === 'javascript') {
        command = `${lang.runCommand} ${solutionFilePath} < ${inputFile} > ${outputFile}`;
        executeCommand(command, outputFile, callback);
    } else if (lang.name === 'cpp') {
        const compiledFile = os.platform() === 'win32' ? 'user_solution.exe' : './user_solution';
        const compileCommand = `${lang.compileCommand} user_solution ${solutionFilePath}`;
        exec(compileCommand, (compileErr) => {
            if (compileErr) {
                return callback(new Error('C++ compilation failed: ' + compileErr.message), null);
            }
            command = `${compiledFile} < ${inputFile} > ${outputFile}`;
            executeCommand(command, outputFile, (err, result) => {
                if (!err) {
                    cleanup(compiledFile);
                }
                callback(err, result);
            });
        });
    } else if (lang.name === 'java') {
        const compileCommand = `${lang.compileCommand} ${solutionFilePath}`;
        exec(compileCommand, (compileErr) => {
            if (compileErr) {
                return callback(new Error('Java compilation failed: ' + compileErr.message), null);
            }
            const className = path.basename(solutionFilePath, '.java');
            command = `${lang.execCommand} ${className} < ${inputFile} > ${outputFile}`;
            executeCommand(command, outputFile, (err, result) => {
                if (!err) {
                    cleanup(`${className}.class`);
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
        console.error(`Failed to clean up file: ${filePath}, ${(err as Error).message}`);
    }
}
