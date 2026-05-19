"use server";

interface GenerateChapterTitleInput {
  chapterDescription: string;
}

interface GenerateChapterTitleOutput {
  title: string;
}

export async function generateChapterTitle(
  input: GenerateChapterTitleInput
): Promise<GenerateChapterTitleOutput> {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY;

  if (!apiKey) {
    // Fallback: generate a creative title from description keywords
    const words = input.chapterDescription.split(' ').filter(w => w.length > 4);
    const keyWords = words.slice(0, 3).map(w => w.charAt(0).toUpperCase() + w.slice(1));
    return { title: keyWords.length > 0 ? `The ${keyWords.join(' of ')}` : 'The Hidden Path' };
  }

  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Generate a single compelling chapter title for a novel chapter with the following description: "${input.chapterDescription}".
    Return ONLY the title text, nothing else. Make it engaging and literary.`;

    const result = await model.generateContent(prompt);
    const title = result.response.text().trim().replace(/^["']|["']$/g, '');

    return { title };
  } catch (error) {
    console.error('AI generation error:', error);
    return { title: 'The Turning Point' };
  }
}
