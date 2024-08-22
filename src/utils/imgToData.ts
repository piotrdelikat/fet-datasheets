import openai from './openAI';

import fs from 'fs';
import path from 'path';

export async function readValuesFromImages(folderPath: string) {
  const imagesPath = folderPath + '/images';

  console.log(`Reading images from: ${imagesPath}`);
  const images = fs
    .readdirSync(imagesPath)
    .filter((file) => /\.(jpg|jpeg|png|gif)$/.test(file));

  console.log(`Found ${images.length} images to analyze.`);
  const content = [];

  for (const image of images) {
    const imagePath = path.join(imagesPath, image);
    console.log(`Processing image: ${imagePath}`);
    const base64Image = fs.readFileSync(imagePath).toString('base64');

    content.push({
      type: 'image_url',
      image_url: {
        url: `data:image/jpeg;base64,${base64Image}`,
      },
    });
  }

  console.log(`Sending ${content.length} images for analysis.`);
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'You are an expert in reading and analyzing specifications of electronic components. Format the output strictly as JSON.',
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Please analyze these images of electrical components and extract all relevant values such as componentName, manufacturer, specifications, and any other pertinent details. 
            Make sure that all values are extracted includig, symbols, units, test conditions and any other relevant information.
            
            IMPORTANT:
            Put special attetion if the value is specified as Min, Typ or Max. Make sure to save it with appropriate key. This is especially important.
            
            Please format the output as JSON.`,
          },
          ...(content as any),
        ],
      },
    ],
    temperature: 0.5,
    response_format: { type: 'json_object' },
  });

  const jsonOutput = JSON.parse(response.choices[0].message.content as string);
  const jsonFolderPath = path.join(folderPath, 'json');
  if (!fs.existsSync(jsonFolderPath)) {
    fs.mkdirSync(jsonFolderPath);
  }
  fs.writeFileSync(
    path.join(jsonFolderPath, path.basename(folderPath) + '.json'),
    JSON.stringify(jsonOutput, null, 0) // No indentation to avoid extra spaces or newlines
  );

  console.log(
    `Analysis complete. Output written to: ${path.join(
      jsonFolderPath,
      path.basename(folderPath) + '.json'
    )}`
  );
}
