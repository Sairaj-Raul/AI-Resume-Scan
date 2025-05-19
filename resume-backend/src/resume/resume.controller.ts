import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { ResumeService } from './resume.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ResumeAnalysisResult } from './resume.types';

@Controller('resume')
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  @Post('analyze')
  @UseInterceptors(
    FilesInterceptor('resumes', 10, {
      storage: diskStorage({
        destination: './uploads',
        filename: (_, file, callback) => {
          const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueName}${ext}`);
        },
      }),
      fileFilter: (_, file, callback) => {
        const allowedTypes = ['.pdf', '.docx'];
        const ext = extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
          callback(null, true);
        } else {
          callback(new Error('Only PDF and DOCX files are allowed'), false);
        }
      },
    }),
  )
  async analyzeResumes(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('jobDescription') jobDescription: string,
  ): Promise<ResumeAnalysisResult[]> {
    const resumes = files.map((file) => ({
      candidateName: file.originalname,
      filePath: file.path,
    }));
    return this.resumeService.analyzeAll(resumes, jobDescription);
  }
}
