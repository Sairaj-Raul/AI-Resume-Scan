/* eslint-disable  */

import { Injectable } from '@nestjs/common';
import { readFile } from 'fs/promises';
import * as mammoth from 'mammoth';
// import * as pdfParse from 'pdf-parse';
import pdfParse from 'pdf-parse';

import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { ResumeAnalysisResult } from './resume.types';
import { config } from 'dotenv';

config();

@Injectable()
export class ResumeService {
  private llm = new ChatOpenAI({
    modelName: 'gpt-3.5-turbo',
    temperature: 0.3,
    configuration: {
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
    },
  });

  async analyzeAll(
    resumes: { candidateName: string; filePath: string }[],
    jobDescription: string,
  ): Promise<ResumeAnalysisResult[]> {
    const results: ResumeAnalysisResult[] = [];

    for (const resume of resumes) {
      const buffer = await readFile(resume.filePath);
      const result = await this.analyzeBuffer(
        buffer,
        resume.candidateName,
        jobDescription,
      );
      results.push(result);
    }

    return results;
  }

  private async analyzeBuffer(
    buffer: Buffer,
    filename: string,
    jobDescription: string,
  ): Promise<ResumeAnalysisResult> {
    let text = '';
    const ext = filename.toLowerCase();

    try {
      if (ext.endsWith('.pdf')) {
        const pdf = await pdfParse(buffer);
        text = pdf.text;
      } else if (ext.endsWith('.docx')) {
        const doc = await mammoth.extractRawText({ buffer });
        text = doc.value;
      } else {
        return {
          candidateName: filename,
          score: 0,
          goodPoints: [],
          badPoints: [],
          error: 'Unsupported file type',
        };
      }

      const prompt = PromptTemplate.fromTemplate(`
You are an expert technical recruiter. Given a job description and a candidate’s resume, analyze how well the candidate matches the job role. Follow these steps:

Match the resume against the job description.

Identify and list:

Good Points – strengths or relevant experiences, prioritizing:
- First, extract from the Experience section.
- Then, extract from the Skills section.

Bad Points – missing or weak areas, prioritizing:
- First, analyze gaps in the Experience section.
- Then, check the Skills section for any required but missing skills.

Assign a Score between 1 and 100 based on how well the candidate’s experience and skills align with the job requirements.

Return your answer in the following JSON format:

{{
  "candidateName": "<extracted or inferred name from resume>",
  "score": <number between 1 and 100>,
  "goodPoints": [list of good points],
  "badPoints": [list of bad points]
}}

Resume:
{resumeText}

Job Description:
{jobDescription}
`);

      const input = await prompt.format({
        jobDescription,
        resumeText: text,
      });

      const response = await this.llm.invoke([['human', input]]);

      const parsed = JSON.parse(response.content as string);

      return {
        candidateName: filename,
        score: parsed.score || 0,
        goodPoints: parsed.goodPoints || [],
        badPoints: parsed.badPoints || [],
      };
    } catch (error) {
      return {
        candidateName: filename,
        score: 0,
        goodPoints: [],
        badPoints: [],
        error: (error as Error).message,
      };
    }
  }
}
