<p align="center">
  <a href="https://github.com/actions/typescript-action/actions"><img alt="typescript-action status" src="https://github.com/actions/typescript-action/workflows/build-test/badge.svg"></a>
</p>

# OpenAI GPT powered markdown docs checker action

This action uses OpenAI's GPT-3.5-turbo model to ask for pointers on ways in which the repositories markdown docs can be improved.

**Important**
- The action requires an OpenAI API token [secret](https://docs.github.com/en/actions/security-guides/encrypted-secrets) to be set up on the repository, It is also up to you to pay for any API costs incurred through usage.  

**Warning** 
- Using on repositories with many markdown files may be expensive.
- Files that are too large (> ~3000 words) may not process or may have their responses from GPT cut off early due to the model that is limited to ~4000 tokens.  
- The responses are not guaranteed to be accurate, or even helpful. Do not follow what it says without verifying its responses first
- The responses may not stick to the `grammar`, `spelling`, and `general` inputs. 

## Inputs

### `temperature`
**Optional** Must be between 0 and 1. The temperature parameter to use for GPT responses. A lower value makes responses more factual and less 'creative'. Defaulted to `0.75`. 

### `spelling`
**Optional** The spelling parameter denotes whether GPT will be prompted to give suggestions on spelling. Defaulted to `true`

### `grammar`
**Optional** The grammar parameter denotes whether GPT will be prompted to give suggestions on grammar. Defaulted to `true`

### `general`
**Optional** The general parameter denotes whether GPT will be prompted to give general suggestions and improvements. Defaulted to `true`

## Outputs

### `result`
A string containing the GPT responses for each markdown file.

## Example usage

```yaml
name: GPT Docs Feedback
on:
  push:
    branches:
      - main
env:
  OPENAI_API_KEY: ${{secrets.OPENAI_API_KEY}}

jobs:
  docs-feedback:
    runs-on: ubuntu-latest
    steps:
      - name: Check out repository
        uses: actions/checkout@v2

      - name: Set up Node.js
        uses: actions/setup-node@v2
        with:
          node-version: 14

      - name: Install dependencies
        run: npm ci

      - name: Find and process .md files
        id: find-and-process-md
        uses: Hamish-taylor/GPT-Docs-Checker@main
        with:
            temperature: '1'
            spelling: false
            grammar: true
            general: true
               
      - name: Print the result
        run: |
          echo "Markdown-processing result:"
          echo "$RESULT"
        env:
          RESULT: ${{ steps.find-and-process-md.outputs.result }}
```
