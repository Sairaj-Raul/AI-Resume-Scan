import { Module } from '@nestjs/common';
import { ResumeModule } from './resume/resume.module';

@Module({
  imports: [ResumeModule], // <-- add ResumeModule to imports array
  controllers: [],
  providers: [],
})
export class AppModule {}
