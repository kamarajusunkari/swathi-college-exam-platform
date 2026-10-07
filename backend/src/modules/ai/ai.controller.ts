import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { AiService } from "./ai.service";
import { ScanQuestionPaperDto, EvaluateScriptDto } from "./dto/ai.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { Public } from "../../common/decorators/public.decorator";

@Controller("ai")
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private aiService: AiService) {}

  @Public()
  @Post("scan-question-paper")
  scanQuestionPaper(@Body() dto: ScanQuestionPaperDto) {
    return this.aiService.scanQuestionPaper(dto);
  }

  @Public()
  @Post("evaluate-script")
  evaluateScript(@Body() dto: EvaluateScriptDto) {
    return this.aiService.evaluateScript(dto);
  }
}
