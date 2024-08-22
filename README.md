# datasheets

# fet-datasheets

## Description

The `fet-datasheets` project is designed to extract values of electronic components from datasheets in PDF format. It converts PDF files into images and then analyzes these images to extract relevant information such as component names, manufacturers, specifications, and other pertinent details. The extracted data is formatted as JSON for easy consumption.

## Features

- Converts PDF datasheets to high-quality images.
- Reads and analyzes images to extract component information.
- Outputs the extracted data in JSON format.
- Utilizes OpenAI's API for advanced image analysis.

## Installation

To get started with the project, clone the repository and install the necessary dependencies:

Prerequisites for pdf to image conversion
node >= 14.x
graphicsmagick
ghostscript

Follow this guide to install the required dependencies.
https://github.com/yakovmeister/pdf2image/blob/HEAD/docs/gm-installation.md

## Environment Variables

Make sure to set up your environment variables by creating a `.env` file in the root directory with the following content:
OPENAI_API_KEY=your_openai_api_key

## Manufaturers and Componets Proecssed so far for Testing Purposes:

-analog_power_inc.
-anhi
-epc_space
-apm

## TODO

- Check if values are correct and saved with desirable keys
- Adjust and fix the errors.
  Ideas for data quiality improvement:
  - Improve prompt
  - Process images one by one instead of in batches
  - Give Examples
  - Use gpt-4o instead of gpt-4o-mini
- Discuss the final output.
- Process all files.
