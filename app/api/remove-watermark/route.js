import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request) {
  console.log("API route called: /api/remove-watermark");
  try {
    // Parse the incoming form data
    const formData = await request.formData();
    const file = formData.get("image");
    if (!file) {
      console.log("No image provided in request");
      return new Response("No image provided", { status: 400 });
    }

    // Convert file to base64
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const mimeType = file.type;
    console.log("Image received, mimeType:", mimeType);

    // Initialize Gemini API
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp-image-generation",
    });

    const generationConfig = {
      temperature: 1,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
      responseModalities: ["Text", "Image"], // Ensure image output support
    };

    // Start a chat session with empty history
    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });

    console.log("Sending image to Gemini API with prompt");
    const result = await chatSession.sendMessage([
      { inlineData: { data: base64, mimeType } },
      {
        text: "Remove watermarks from the image while preserving image quality and content.",
      },
    ]);

    // Extract the processed image from the response
    const response = result.response;
    console.log("Gemini API response received:", response);
    const candidate = response.candidates[0];
    const content = candidate.content;
    const imagePart = content.parts.find((part) => part.inlineData);

    if (imagePart) {
      const processedImageBase64 = imagePart.inlineData.data;
      const processedImageBuffer = Buffer.from(processedImageBase64, "base64");
      console.log("Processed image extracted successfully");
      return new Response(processedImageBuffer, {
        headers: { "Content-Type": mimeType },
      });
    } else {
      console.log("No processed image found in response");
      return new Response("No image generated", { status: 500 });
    }
  } catch (error) {
    console.error("Error in API route:", error);
    return new Response("Error processing image", { status: 500 });
  }
}
