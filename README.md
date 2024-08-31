# FET Datasheets

This project extracts values of electronic components from datasheets.

## Description

The `fet-datasheets` project is designed to extract values of electronic components from datasheets in PDF format. It converts PDF files into images and then analyzes these images to extract relevant information such as component names, manufacturers, specifications, and other pertinent details. The extracted data is formatted as JSON for easy consumption.

## Features

- Converts PDF datasheets to high-quality images.
- Reads and analyzes images to extract component information.
- Outputs the extracted data in JSON format.
- Utilizes OpenAI's API for advanced image analysis.

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables (if required)

Prerequisites for pdf to image conversion
node >= 14.x
graphicsmagick
ghostscript

Follow this guide to install the required dependencies.
https://github.com/yakovmeister/pdf2image/blob/HEAD/docs/gm-installation.md

## Environment Variables

Make sure to set up your environment variables by creating a `.env` file in the root directory with the following content:
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key

## Usage

To run the main script:
npm run dev

## Utility Scripts

### Move Omitted Files

This script processes all directories in the 'intermediate' folder, moving any files found in 'omitted' subfolders back to their respective 'images' folders, and then deletes the empty 'omitted' folders.

To move files from the 'omitted' folder back to the main 'images' folder:

npm run move-omitted

### Fix File Names

This script ensures correct sorting order for image files by renaming them from `X.1.png` to `X.01.png` for pages 1-9.
To pad single-digit page numbers with a leading zero in image filenames:

npm run fix-filenames

## Manufaturers and Componets Processed so far for Testing Purposes:

-analog_power_inc.
-anhi
-epc_space
-apm
-slkor
-ts

## File Processing

The main script (`src/index.ts`) handles the following tasks:

1. PDF to Image conversion
2. Pages preselection (gpt-4o-mini)
3. Data extraction from images (sonnet-3-5)
4. Chart reading (V_plateau) (sonnet-3-5)
5. Saving the extracted data in JSON format

For more details on each process, refer to the respective utility files in the `src/utils` directory.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
