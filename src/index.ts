import fs from 'fs';
import path from 'path';
import { readValuesFromImage, readValuesFromImages } from './utils/imgToData';
import { convertPdfToImage } from './utils/pdfToImg';
import { extractWihGoogleGemini } from './utils/google';
import { preselectImages } from './utils/openAI';

const handlePdfConversion = async (mfr: string, mpn: string) => {
  try {
    await convertPdfToImage(mfr, mpn);
    console.log(`Successfully converted ${mpn} to image.`);
  } catch (error) {
    console.error(`Error converting ${mpn}:`, error);
  }
};

const processDocuments = async (directoryPath: string, model = 'gpt-4o') => {
  const pdfFiles = fs
    .readdirSync(directoryPath)
    .filter((file) => file.endsWith('.pdf'));

  for (const pdfFile of pdfFiles) {
    const filePath = path.join(directoryPath, pdfFile);
    const fileName = pdfFile.replace('.pdf', ''); // Remove .pdf from the filename

    const mfr = path.basename(directoryPath);
    const mpn = fileName;

    const intermediatePath = path.join('intermediate', mfr, mpn);
    const imagesPath = path.join(intermediatePath, 'images');
    const omittedPath = path.join(imagesPath, 'omitted');
    const llmExtractPath = path.join(
      intermediatePath,
      `llm_extract_${model}.json`
    );

    // Check if the intermediate path exists, if not, create it
    if (!fs.existsSync(intermediatePath)) {
      fs.mkdirSync(intermediatePath, { recursive: true });
      console.log(`Created directory: ${intermediatePath}`);
    }

    // Check if the images path exists, if not, convert the PDF to images
    if (!fs.existsSync(imagesPath)) {
      await handlePdfConversion(mfr, mpn);
    } else {
      console.log(`Images already exist for: ${mfr}/${mpn}`);
    }

    // Check if omittedPath exists, if not run preselectImages
    if (!fs.existsSync(omittedPath)) {
      await preselectImages(intermediatePath);
    } else {
      console.log(`Omitted images already processed for: ${mfr}/${mpn}`);
    }

    //Check if the llm_extract.json file exists, if not, read values from images
    if (!fs.existsSync(llmExtractPath)) {
      await readValuesFromImages(imagesPath, model);
      // extractWihGoogleGemini(imagesPath);
    } else {
      console.log(`Values already extracted for: ${mfr}/${mpn}`);
    }
  }
};

// Call processDocuments on all directories
const processAllManufacturers = () => {
  const manufacturers = fs.readdirSync('./datasheets');
  manufacturers.forEach((mfr) => {
    const mfrPath = path.join('./datasheets', mfr);
    if (fs.lstatSync(mfrPath).isDirectory()) {
      processDocuments(mfrPath);
    }
  });
};

const countLLMCost = () => {
  const datasheetsPath = './datasheets';
  const costPerFile = 0.1;
  let totalCost = 0;
  let totalFiles = 0;

  const manufacturers = fs.readdirSync(datasheetsPath);

  manufacturers.forEach((mfr) => {
    const mfrPath = path.join(datasheetsPath, mfr);
    if (fs.lstatSync(mfrPath).isDirectory()) {
      const files = fs.readdirSync(mfrPath);
      totalFiles += files.length;
      totalCost += files.length * costPerFile;
      console.log(`Manufacturer: ${mfr}, Number of files: ${files.length}`);
    }
  });

  console.log(`Total number of files: ${totalFiles}`);
  console.log(`Total LLM cost: $${totalCost.toFixed(2)}`);
};

// Call processDocuments on individual directories for testing
// processDocuments('./datasheets/analog_power_inc.');
// processDocuments('./datasheets/anhi');
// processDocuments('./datasheets/apm');
processDocuments('./datasheets/epc_space');
// processDocuments('./datasheets/slkor');

// Log approximate LLM cost
// countLLMCost();

// Call processDocuments on all directories
//processAllManufacturers();
