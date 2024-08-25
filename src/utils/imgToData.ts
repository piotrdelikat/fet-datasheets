import openai, { fixJson } from './openAI';

import fs from 'fs';
import path from 'path';

export async function readValuesFromImages(
  folderPath: string,
  model = 'gpt-4o-mini'
) {
  const imagesPath = folderPath;

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
        detail: 'high',
      },
    });
  }

  // Read example images
  const examplesPath = `./src/utils/examples`;
  const exampleOutputFile = `${examplesPath}/llm_extract_gpt-4o.json`;

  const exampleImages = fs
    .readdirSync(examplesPath)
    .filter((file) => /\.(jpg|jpeg|png|gif)$/.test(file))
    .map((file) => {
      const imagePath = path.join(examplesPath, file);
      const base64Image = fs.readFileSync(imagePath).toString('base64');
      return {
        type: 'image_url',
        image_url: {
          url: `data:image/jpeg;base64,${base64Image}`,
          detail: 'high',
        },
      };
    });

  // Read example output JSON
  const exampleOutput = JSON.parse(fs.readFileSync(exampleOutputFile, 'utf-8'));

  console.log(`Sending ${content.length} images for analysis.`);
  const response = await openai.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content: `You are an expert in reading and analyzing specifications of electronic components. 
          IMPORTANT:
            When processing tabular data, always save each column as a separate key, including the column name in the key.
            Pay special attention to the columns labeled Min, Typ, and Max and make sure that these values are accurately identified annd stored. It is crucial that these values are accurately saved with their respective keys: 'min', 'typ', or 'max'. 
            If no value is specified, save it as 'null'.
            This is especially important for the success of the program to that the column data is accurately extracted and stored with the correct keys.
            
          
          Format the output strictly as JSON and do NOT include the example provided below in the output file.`,
      },
      {
        role: 'user',
        content: [...(exampleImages as any)],
      },
      {
        role: 'assistant',
        content: [
          {
            type: 'text',
            text: `${JSON.stringify(exampleOutput)}`,
          },
        ],
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Please analyze these images of electrical components and extract all relevant values such as componentName, manufacturer, specifications, and any other pertinent details. 
            Make sure that all values are extracted including, symbols, units, test conditions and any other relevant information.
            
            IMPORTANT:
            When processing tabular data, always save each column as a separate key, including the column name in the key. If no value is specified, save it as 'null'.
            Pay special attention to the values in the columns labeled Min, Typ, and Max. It is crucial that these values are accurately identified and saved with their respective keys: 'min', 'typ', and 'max'. 
            This is especially important to maintain the integrity of the data.
            
            Please format the output as JSON and do NOT include the example provided below in the output file.`,
          },

          ...(content as any),
        ],
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
    jsonOutput = fixJson(response.choices[0].message.content as string);
  }
  const jsonFolderPath = folderPath.replace('images', '');

  const outputFileName = `llm_extract_${model}.json`;

  fs.writeFileSync(
    path.join(jsonFolderPath, outputFileName),
    JSON.stringify(jsonOutput, null, 0) // No indentation to avoid extra spaces or newlines
  );

  console.log(
    `Analysis complete. Output written to: ${path.join(
      jsonFolderPath,
      outputFileName
    )}`
  );
}

//Send Image to LLM one by one and append results to the same JSON
export async function readValuesFromImage(
  folderPath: string,
  model = 'gpt-4o-mini'
) {
  const imagesPath = folderPath;

  console.log(`Reading images from: ${imagesPath}`);
  const images = fs
    .readdirSync(imagesPath)
    .filter((file) => /\.(jpg|jpeg|png|gif)$/.test(file));

  console.log(`Found ${images.length} images to analyze.`);
  const jsonFolderPath = folderPath.replace('images', '');
  const outputFileName = `llm_extract_${model}_oneByOne.json`;
  const outputFilePath = path.join(jsonFolderPath, outputFileName);

  let existingData = [];
  if (fs.existsSync(outputFilePath)) {
    console.log(`Existing JSON file found. Appending to it.`);
    existingData = JSON.parse(fs.readFileSync(outputFilePath, 'utf-8'));
  } else {
    console.log(`No existing JSON file found. Creating a new one.`);
  }

  for (const image of images) {
    const imagePath = path.join(imagesPath, image);
    console.log(`Processing image: ${imagePath}`);
    const base64Image = fs.readFileSync(imagePath).toString('base64');

    const content = [
      {
        type: 'image_url',
        image_url: {
          url: `data:image/jpeg;base64,${base64Image}`,
        },
      },
    ];

    console.log(`Sending image for analysis.`);
    const response = await openai.chat.completions.create({
      model,
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
              text: `Please analyze this image of an electrical component and extract all relevant values such as componentName, manufacturer, specifications, and any other pertinent details. 
              Make sure that all values are extracted including, symbols, units, test conditions and any other relevant information. 
              If charts are present analyze them as well and include them in the output as an array of values and chart metadata.
              
              IMPORTANT:
              Put special attention if the value is in column specified as Min, Typ or Max. Make sure to save it with appropriate key. 
              When processing tabular data, make sure to always save each column as a separate key and include the column name in the key, if no value is specified save it as 'null'.
              This is especially important.
              
              Please format the output as JSON.`,
            },
            ...(content as any),
          ],
        },
      ],
      temperature: 0,
      response_format: { type: 'json_object' },
    });

    const jsonOutput = JSON.parse(
      response.choices[0].message.content as string
    );
    existingData.push(jsonOutput);

    fs.writeFileSync(
      outputFilePath,
      JSON.stringify(existingData, null, 0) // No indentation to avoid extra spaces or newlines
    );

    console.log(
      `Analysis complete for image: ${imagePath}. Output appended to: ${outputFilePath}`
    );
  }

  console.log(
    `All images processed. Final output written to: ${outputFilePath}`
  );
}
