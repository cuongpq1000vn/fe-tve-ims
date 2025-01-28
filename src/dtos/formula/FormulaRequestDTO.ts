export type FormulaRequestDTO = {
  id: number;
  name: string;
  midtermListeningMaxScore: number;
  midtermReadingMaxScore: number;
  midtermWritingMaxScore: number;
  midtermSpeakingMaxScore: number;
  midtermSumFormula: string;
  midtermPercentageFormula: string;
  midtermClassificationFormula: string;
  finalListeningMaxScore: number;
  finalReadingMaxScore: number;
  finalWritingMaxScore: number;
  finalSpeakingMaxScore: number;
  finalSumFormula: string;
  finalPercentageFormula: string;
  finalClassificationFormula: string;
  midtermGradeWeight: number;
  finalGradeWeight: number;
  bonusGradeWeight: number;
  classificationFormula: string;
  courseIds: number[];
}