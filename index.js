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

                const answers = extractAns(text);
                console.log({ answers });

                await worker.terminate();
            })();

        } catch (error) {
            console.error('Error during OCR:', error.message);
        }
    }
}

function extractAns(extractedText) {
    const lines = extractedText.split('\n');
    let currentQuestionNumber = null;

    const mcqAnswers = lines.reduce((answers, line) => {
        const questionMatch = line.match(/^\d+\./); // Matches lines starting with a number followed by a dot
        if (questionMatch) {
            currentQuestionNumber = questionMatch[0].slice(0, -1); // Extracting the question number
        }

        const indexOfUnkn = line.indexOf('Unkn');
        const indexOfYes = line.indexOf('Yes');
        const indexOfNo = line.indexOf('No');

        if (indexOfUnkn !== -1 && currentQuestionNumber !== null) {
            if ((indexOfUnkn < indexOfYes || indexOfYes === -1) && (indexOfUnkn < indexOfNo || indexOfNo === -1)) {
                answers[currentQuestionNumber] = 'Undetermined';
            } else if (indexOfUnkn < indexOfYes || indexOfYes === -1) {
                answers[currentQuestionNumber] = 'Yes';
            } else if (indexOfUnkn < indexOfNo || indexOfNo === -1) {
                answers[currentQuestionNumber] = 'No';
            }
        }

        return answers;
    }, {});

    return mcqAnswers;
}

await imageProcess();