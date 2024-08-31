import fs from 'fs';
import path from 'path';
import { anthropic, handleRateLimitError } from './anthropic';
import { importMarkdownFile } from '../helpers';
import { fixJson } from '../openAI/openAI';

export async function readValuesFromImagesAnthropic(
  imagesPath: string,
  imageFileNames: string[],
  model = 'claude-3-5-sonnet-20240620'
) {
  console.log(`Reading images from: ${imagesPath}`);
  const images = imageFileNames.filter((file: string) =>
    /\.(jpg|jpeg|png|gif|webp)$/.test(file)
  );

  console.log(`Found ${images.length} images to analyze.`);
  const content: any = [];

  for (const image of images) {
    const imagePath = path.join(imagesPath, image);
    console.log(`Processing image: ${imagePath}`);
    const base64Image = fs.readFileSync(imagePath).toString('base64');

    content.push({
      type: 'image',
      source: {
        type: 'base64',
        media_type: `image/${path.extname(image).slice(1)}`,
        data: base64Image,
      },
    });
  }

  const examplePages: any = [];
  //read examples
  const examplesPath = `./prompts/datasheetReading/examples`;
  const examplesImages = fs
    .readdirSync(examplesPath)
    .filter((file: string) => /\.(jpg|jpeg|png|gif|webp)$/.test(file));

  for (const image of examplesImages) {
    const imagePath = path.join(examplesPath, image);
    const base64Image = fs.readFileSync(imagePath).toString('base64');

    examplePages.push({
      type: 'image',
      source: {
        type: 'base64',
        media_type: `image/${path.extname(image).slice(1)}`,
        data: base64Image,
      },
    });
  }

  const exampleOutputFile = `./prompts/datasheetReading/examples/llm_extract_claude-3-5-sonnet-20240620.json`;
  const exampleAnswers = JSON.parse(
    fs.readFileSync(exampleOutputFile, 'utf-8')
  );

  const DataSheetReadingSystem = importMarkdownFile(
    'prompts/datasheetReading/DatasheetReadingSystem.md'
  );
  const DataSheetReadingUser = importMarkdownFile(
    'prompts/datasheetReading/DatasheetReadingUser.md'
  );
  const createMessageRequest = () =>
    anthropic.messages.create({
      model,
      max_tokens: model.includes('claude-3-5-sonnet') ? 8192 : 4096,
      temperature: 0,
      system: DataSheetReadingSystem,
      messages: [
        {
          role: 'user',
          content: [
            ...examplePages,
            {
              type: 'text',
              text: DataSheetReadingUser,
            },
          ],
        },
        {
          role: 'assistant',
          content: [
            {
              type: 'text',
              text: JSON.stringify(exampleAnswers),
            },
          ],
        },
        {
          role: 'user',
          content: [...content],
        },
      ],
    });

  let response: any;
  try {
    response = await createMessageRequest();
  } catch (error: any) {
    if (error.response && error.response.status === 429) {
      await handleRateLimitError(error.response);
      response = await createMessageRequest();
    } else {
      throw error;
    }
  }

  // Save JSON response
  let jsonOutput;
  try {
    jsonOutput = JSON.parse(response.content[0].text);
  } catch (error) {
    console.error('Error parsing JSON:', error);
    jsonOutput = await fixJson(response.content[0].text);
  }

  return jsonOutput;
}
