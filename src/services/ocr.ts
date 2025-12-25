import { createWorker } from 'tesseract.js';

export const analyzeImage = async (
  base64Data: string, 
  mimeType: string,
  onProgress?: (status: string, progress: number) => void
): Promise<string> => {
  try {
    // Initialize the Tesseract worker
    // 'eng' is the language code for English.
    // 1 is the OEM (OCR Engine Mode) for LSTM only, which is standard for V5.
    const worker = await createWorker('eng', 1, {
      logger: m => {
        if (onProgress) {
          // Tesseract updates: { status: 'recognizing text', progress: 0.5 }
          onProgress(m.status, m.progress);
        }
        console.debug('Tesseract Log:', m);
      }
    });

    const imageUri = `data:${mimeType};base64,${base64Data}`;
    
    // Perform the recognition
    // We explicitly specify the language here as well to be safe, though worker is init with it.
    const { data: { text } } = await worker.recognize(imageUri);
    
    // Terminate the worker to free up memory immediately after use
    await worker.terminate();

    return text.trim() || "No text found in image.";
  } catch (error: any) {
    console.error("Tesseract Error:", error);
    throw new Error("OCR Failed: " + (error.message || "Unknown error"));
  }
};