import { fromPath } from 'pdf2pic';
import fs from 'fs';
import path from 'path';

export const convertPdfToImage = async (mfr: string, mpn: string) => {
  const savePath = path.join('intermediate', mfr, mpn, 'images');

  // Check and create the directory if it doesn't exist
  if (!fs.existsSync(savePath)) {
    fs.mkdirSync(savePath, { recursive: true });
  }

  const options = {
    quality: 90, // Increased quality for better readability
    density: 300, // Higher density for clearer text
    saveFilename: mpn,
    savePath: savePath,
    width: 768,
    height: 1024,
    format: 'png',
  };

  const filePath = `datasheets/${mfr}/${mpn}.pdf`;
  const convert = fromPath(filePath, options);

  return convert.bulk(-1, { responseType: 'image' }).then((resolve) => {
    console.log('Page 1 is now converted as image');
    return resolve;
  });
};
