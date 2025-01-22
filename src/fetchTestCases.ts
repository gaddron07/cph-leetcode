import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

// Apply the stealth plugin
puppeteer.use(StealthPlugin());

export async function fetchTestCases(url: string): Promise<{ inputs: string[]; expectedOutputs: string[] }> {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
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

                // Extract the expected output (actual output provided by LeetCode)
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
