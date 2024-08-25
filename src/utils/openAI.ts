import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default openai;

export const fixJson = async (result: string) => {
  console.log(`Attempting to fix JSON: ${result}`);

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are an expert in JSON formatting. Please fix the following JSON formatting issues and return the fixed JSON: ${result}`,
      },
    ],
    temperature: 0,
    response_format: { type: 'json_object' },
  });

  let jsonOutput;
  try {
    jsonOutput = JSON.parse(response.choices[0].message.content as string);
  } catch (error) {
    console.error('Error parsing JSON:', error);
    jsonOutput = null; // Handle the error appropriately
  }

  return jsonOutput;
};

export async function preselectImages(
  folderPath: string,
  model = 'gpt-4o-mini'
) {
  const imagesPath = folderPath + '/images';

  console.log(`Reading images from: ${imagesPath}`);
  const images = fs
    .readdirSync(imagesPath)
    .filter((file: string) => /\.(jpg|jpeg|png|gif)$/.test(file));

  console.log(`Found ${images.length} images to analyze.`);
  const content = images.map((image) => {
    const imagePath = path.join(imagesPath, image);
    console.log(`Processing image: ${imagePath}`);
    const base64Image = fs.readFileSync(imagePath).toString('base64');

    return {
      role: 'user',
      content: [
        {
          type: 'text',
          text: `filename: ${image}`,
        },
        {
          type: 'image_url',
          image_url: {
            url: `data:image/jpeg;base64,${base64Image}`,
            detail: 'low',
          },
        },
      ],
    };
  });

  console.log(`Sending ${content.length} images for analysis.`);
  const response = await openai.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content: `You are an expert in analyzing images of electronic components. 
                  Please select images that contain tabular data and omit images containing only charts or text. 
                  Return a JSON object with a key 'omitted' containing a list of filenames that were omitted.`,
      },
      ...(content as any),
    ],
    temperature: 0,
    response_format: { type: 'json_object' },
  });

  let jsonOutput;
  try {
    jsonOutput = JSON.parse(response.choices[0].message.content as string);
  } catch (error) {
    console.error('Error parsing JSON:', error);
    jsonOutput = { omitted: [] }; // Handle the error appropriately
  }

  console.log(
    `Preselection complete. Returning parsed JSON.: ${JSON.stringify(
      jsonOutput
    )}`
  );

  const omittedFolderPath = path.join(imagesPath, 'omitted');

  // Check if the omitted folder exists, if not, create it
  if (!fs.existsSync(omittedFolderPath)) {
    fs.mkdirSync(omittedFolderPath, { recursive: true });
    console.log(`Created directory: ${omittedFolderPath}`);
  }

  jsonOutput.omitted
    .filter((filename: string) => !filename.includes('.1'))
    .forEach((filename: string) => {
      const sourcePath = path.join(imagesPath, filename);
      const destinationPath = path.join(omittedFolderPath, filename);

      if (fs.existsSync(sourcePath)) {
        fs.renameSync(sourcePath, destinationPath);
        console.log(`Moved ${filename} to omitted folder.`);
      } else {
        console.warn(`File ${filename} does not exist in images folder.`);
      }
    });

  return jsonOutput;
}
