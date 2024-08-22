import { fromPath } from 'pdf2pic';
import fs from 'fs';
import path from 'path';

export const convertPdfToImage = async (filePath: string, fileName: string) => {
  const savePath = path.join(path.dirname(filePath), `${fileName}/images`);

  // Check and create the directory if it doesn't exist
  if (!fs.existsSync(savePath)) {
    fs.mkdirSync(savePath, { recursive: true });
  }

  const options = {
    quality: 75,
    density: 100,
    saveFilename: fileName,
    savePath: savePath,
    width: 2480, // A4 width in pixels at 300 DPI
    height: 3508, // A4 height in pixels at 300 DPI
    format: 'png',
  };
  const convert = fromPath(filePath, options);

  return convert.bulk(-1, { responseType: 'image' }).then((resolve) => {
    console.log('Page 1 is now converted as image');
    return resolve;
  });
};
