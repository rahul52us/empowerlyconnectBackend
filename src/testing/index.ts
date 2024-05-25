import * as fs from 'fs';
import * as path from 'path';
const pdfParse = require('pdf-parse');

async function parsePDF(filePath: string) {
  try {
    console.log(`Attempting to read file from path: ${filePath}`);
    // Read the PDF file
    const dataBuffer = fs.readFileSync(filePath);

    // Parse the PDF contents
    const data = await pdfParse(dataBuffer);

    // Extract and print the text content
    console.log(data.text);
  } catch (error) {
    // Handle errors
    console.error('Error parsing PDF:', error);
  }
}

// Path to the PDF file
const filePath = path.resolve(__dirname, 'rahul.pdf');

// Call the function to parse the PDF
parsePDF(filePath);
