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
exports.fetchTestCases = fetchTestCases;
const puppeteer_extra_1 = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer_extra_1.default.use(StealthPlugin());
function fetchTestCases(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const browser = yield puppeteer_extra_1.default.launch({ headless: true });
        const page = yield browser.newPage();
        try {
            console.log('Navigating to LeetCode URL...');
            yield page.goto(url, { waitUntil: 'networkidle2' });
            console.log('Waiting for test case elements to load...');
            yield page.waitForSelector('pre', { timeout: 30000 });
            console.log('Extracting test cases...');
            const data = yield page.evaluate(() => {
                const inputs = [];
                const expectedOutputs = []; // Store the expected outputs (actual outputs)
                const examples = document.querySelectorAll('pre');
                examples.forEach((example) => {
                    var _a;
                    const text = ((_a = example.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || '';
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
        }
        catch (err) {
            if (err instanceof Error) {
                console.error('Error fetching test cases:', err.message);
            }
            else {
                console.error('An unknown error occurred:', err);
            }
            throw err;
        }
        finally {
            yield browser.close();
            console.log('Browser closed.');
        }
    });
}
