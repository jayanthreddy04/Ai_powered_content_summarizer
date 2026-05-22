import { AppError } from '../utils/apiResponse.js';

export const extractTextFromPdf = async (buffer, filename = 'document.pdf') => {
  if (!buffer || buffer.length === 0) {
    throw new AppError('Empty PDF file uploaded', 400);
  }

  try {
    const { default: pdfParse } = await import('pdf-parse');
    const data = await pdfParse(buffer, { max: 0 });
    const text = (data.text || '')
      .replace(/\u0000/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const meaningfulChars = text.replace(/[^a-zA-Z0-9]/g, '').length;

    if (!text || meaningfulChars < 40) {
      throw new AppError(
        'Could not extract enough text from this PDF. It may be image-based (scanned). Copy the text manually and use the Text Summarizer.',
        422
      );
    }

    return {
      title: filename.replace(/\.pdf$/i, '') || 'PDF Document',
      content: text.slice(0, 50000),
      pageCount: data.numpages,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to parse PDF. Ensure the file is a valid PDF.', 400);
  }
};
