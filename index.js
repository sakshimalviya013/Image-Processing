import { createWorker } from 'tesseract.js';

async function imageProcess() {
    // Path to the image files
    const inputImagesPath = ['./1.jpg', './2.jpg', './3.jpg'];

    // Process each image
    for (const img of inputImagesPath) {

        // Perform OCR on the image
        try {
            const worker = await createWorker('eng');
            (async () => {
                const { data: { text } } = await worker.recognize(img);
                extractOutputFromImageData(text);
                await worker.terminate();
            })();

        } catch (error) {
            console.error('Error during OCR:', error.message);
        }
    }
}
// Function to dynamically extract keys from input text
function extractKeys(text) {
    const keyRegex = /\b(\d+\s?\.?\s?[\w\s?]+)\?/g; // Add 'g' flag for global matching
    const matches = text.matchAll(keyRegex);
    return Array.from(matches, match => match[1]);
}

// Function to extract information using regular expressions
function extractInfo(text, keys) {
    const patterns = keys.map(key => ({
        key,
        regex: new RegExp(`${key}\\s?.+?([A-Za-z0-9\\s\\[\\]_]+)`)
    }));

    const extractedData = {};

    patterns.forEach(({ key, regex }) => {
        const match = text.match(regex);
        extractedData[key] = match ? match[1].trim() : 'Not Found';
    });

    return extractedData;
}

// Function to extract output from image data
function extractOutputFromImageData(inputText) {
    // Extract keys dynamically
    const keys = extractKeys(inputText);

    // Output the extracted data
    const extractedData = extractInfo(inputText, keys);
    console.log('Extracted Data:', extractedData);
}

await imageProcess();