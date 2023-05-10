import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as fs from 'fs';

import { Configuration, OpenAIApi } from 'openai';

async function findMarkdownFiles(): Promise<string[]> {
    let output = '';
    const options: exec.ExecOptions = {
        listeners: {
            stdout: (data: Buffer) => {
                output += data.toString();
            }
        }
    };

    await exec.exec('git', ['ls-files'], options);

    const files = output.trim().split('\n');
    return files.filter(file => file.endsWith('.md'));
}

function readMarkdownFile(file: string): string {
    try {
        const content = fs.readFileSync(file, 'utf8');
        return content;
    } catch (error) {
        console.error(`Error reading file ${file}: ${(error as Error).message}`);
        return "ERROR"
    }
}

async function processMarkdownFiles(mdFiles: string[], openai: OpenAIApi): Promise<string> {
    // Add your custom processing logic here and return a string
    const temperature = core.getInput('temperature');
    const grammar = core.getInput('grammar');
    const spelling = core.getInput('spelling');
    const general = core.getInput('general');
    
    let result = `Processed Markdown files with settings: \,
        Temperature: ${temperature}\n
        Grammar: ${grammar}\n
        Spelling: ${spelling}\n
        General: ${general}\n
        ---Prompt---
    `;

    let prompt = "Your job is to review the users markdown documentation and provide feedback on";

    if (grammar == "true") {
        prompt += ", grammar";
    }
    if (spelling == "true") {
        prompt += ", spelling";
    }
    if (general == "true") {
        prompt += ", general suggestions an improvements";
    }

    if(general == "false" || spelling == "false" || grammar == "false") {
        prompt += ". Do not give feedback on"
    }

    if(grammar == "false") {
        prompt += ", grammar";
    }
    if(spelling == "false") {
        prompt += ", spelling";
    }
    if(general == "false") {
        prompt += ", general suggestions an improvements";
    }

    prompt += ". Only reply with the suggestions you have been asked for and not the original text."
    result += prompt 
    for (const file of mdFiles) {
        const text = readMarkdownFile(file);
        const gptResponse = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            temperature: Number.parseFloat(temperature),
            messages: [
                { "role": "system", "content": prompt },
                { "role": "user", "content": `${text}` }
            ]
        })

        result += `---${file}--- \n ${gptResponse.data.choices[0].message?.content}\n`;
    }
    return result;
}

async function run(): Promise<void> {

    try {
        if (!process.env.OPENAI_API_KEY) {
            core.setFailed("OPENAI_API_KEY not set");
            return;
        }
        const config = new Configuration({
            apiKey: process.env.OPENAI_API_KEY,
        })

        const openai = new OpenAIApi(config);
        const mdFiles = await findMarkdownFiles();

        const result = await processMarkdownFiles(mdFiles, openai);
        core.setOutput('result', result);
    } catch (error) {
        core.setFailed((error as Error).message);
    }
}

run();
