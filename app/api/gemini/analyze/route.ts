import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const { prompt, dataPreview, headers, fileName, sheetName, totalRows } = await req.json();

    const systemInstruction = `You are a helpful data analyst AI. The user has uploaded an Excel file named "${fileName}", sheet "${sheetName}".
    Total rows: ${totalRows}.
    Columns: ${headers.join(', ')}.
    Here is a preview of the first 50 rows of data:
    ${JSON.stringify(dataPreview, null, 2)}
    
    Please answer the user's question based on this data context clearly and concisely.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { role: "user", parts: [{ text: systemInstruction + "\n\nUser Question: " + prompt }] }
      ],
    });

    return NextResponse.json({ text: response.text });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ text: "Error: GEMINI_API_KEY environment variable is not configured on the server." }, { status: 400 });
    }
    return NextResponse.json({ text: "Error generating response from Gemini API: " + message }, { status: 500 });
  }
}
