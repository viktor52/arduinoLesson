import { SYNTAX_QUESTIONS, SyntaxQuestion, buildSyntaxQuestions } from './syntaxQuestionBank';

export type { SyntaxQuestion };
export { SYNTAX_QUESTIONS, buildSyntaxQuestions };

export function getSyntaxQuestionById(id: string): SyntaxQuestion | undefined {
  return SYNTAX_QUESTIONS.find((q) => q.id === id);
}

export function getSyntaxQuestionByOrder(order: number): SyntaxQuestion | undefined {
  return SYNTAX_QUESTIONS.find((q) => q.order === order);
}
