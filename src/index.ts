import fs from 'fs';
import path from 'path';
import { readValuesFromImages } from './utils/imgToData';
import { convertPdfToImage } from './utils/pdfToImg';

const handlePdfConversion = async (filePath: string, fileName: string) => {
  try {
    await convertPdfToImage(filePath, fileName);
    console.log(`Successfully converted ${fileName} to image.`);
  } catch (error) {
    console.error(`Error converting ${fileName}:`, error);
  }
};
const processDocuments = async (directoryPath: string) => {
  const pdfFiles = fs
    .readdirSync(directoryPath)
    .filter((file) => file.endsWith('.pdf'));

  for (const pdfFile of pdfFiles) {
    const filePath = path.join(directoryPath, pdfFile);
    const fileName = pdfFile.replace('.pdf', ''); // Remove .pdf from the filename
    await handlePdfConversion(filePath, fileName);
    // Call readValuesFromImages after each image creation
    readValuesFromImages(path.join(directoryPath, fileName));
  }
};

// Call processDocuments on few directories for testing
// processDocuments('./data/analog_power_inc.');
// processDocuments('./data/anhi');
processDocuments('./data/epc_space');
