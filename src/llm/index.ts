import {formatExercisePrompt} from './formatExercisePrompt';
import {formatMemoPrompt} from './formatMemoPrompt';
import {openaiService} from './openai';

interface ExerciseData {
  exercise?: string;
  weight?: number;
  reps?: number;
  sets?: number;
  side?: string;
}

interface MemoData {
  content: string;
  exercise?: string;
}

interface FormattedExercise {
  exercise: string;
  weight?: number;
  reps?: number;
  sets?: number;
  side?: string;
}

export async function formatExercise(
  rawText: string,
  parsedData: ExerciseData,
): Promise<FormattedExercise> {
  try {
    const prompt = formatExercisePrompt(rawText, parsedData);
    const response = await openaiService.streamChat([{role: 'user', content: prompt}]);

    // Parse the structured response
    const lines = response.split('\n').filter(line => line.trim());
    const result: FormattedExercise = {
      exercise: parsedData.exercise || '不明な種目',
    };

    lines.forEach(line => {
      if (line.includes('種目:')) {
        const match = line.match(/種目:\s*(.+)/);
        if (match) result.exercise = match[1].trim();
      } else if (line.includes('重量:')) {
        const match = line.match(/重量:\s*(\d+(?:\.\d+)?)kg/);
        if (match) result.weight = parseFloat(match[1]);
      } else if (line.includes('回数:')) {
        const match = line.match(/回数:\s*(\d+)回/);
        if (match) result.reps = parseInt(match[1], 10);
      } else if (line.includes('セット数:')) {
        const match = line.match(/セット数:\s*(\d+)セット/);
        if (match) result.sets = parseInt(match[1], 10);
      } else if (line.includes('部位:')) {
        const match = line.match(/部位:\s*(.+)/);
        if (match) {
          const side = match[1].trim();
          if (side !== '不明') result.side = side;
        }
      }
    });

    return result;
  } catch (error) {
    console.warn('Failed to format exercise with OpenAI:', error);
    // Fallback to original parsed data
    return {
      exercise: parsedData.exercise || '不明な種目',
      weight: parsedData.weight,
      reps: parsedData.reps,
      sets: parsedData.sets,
      side: parsedData.side,
    };
  }
}

export async function formatMemo(rawText: string, memoData: MemoData): Promise<string> {
  try {
    const prompt = formatMemoPrompt(rawText, memoData);
    const response = await openaiService.streamChat([{role: 'user', content: prompt}]);

    return response || memoData.content;
  } catch (error) {
    console.warn('Failed to format memo with OpenAI:', error);
    // Fallback to original content
    return memoData.content;
  }
}

export {openaiService} from './openai';
