import { NextResponse } from "next/server";

// Define available models from OpenAI and Google
const AVAILABLE_MODELS = [
    // OpenAI Models (Using your credits)
  {
    id: "gpt-4-turbo",
    provider: "openai",
    name: "GPT-4 Turbo",
    description: "Most capable GPT-4 model with 128k context and vision",
    context_length: 128000,
    supportsTools: true,
    supportsVision: true,
    free: false,
    recommended: true,
  },
  {
    id: "gpt-4",
    provider: "openai",
    name: "GPT-4",
    description: "High-intelligence flagship model for complex tasks",
    context_length: 8192,
    supportsTools: true,
    supportsVision: false,
    free: false,
    recommended: false,
  },
  {
    id: "gpt-3.5-turbo",
    provider: "openai",
    name: "GPT-3.5 Turbo",
    description: "Fast and efficient model for everyday tasks",
    context_length: 16385,
    supportsTools: true,
    supportsVision: false,
    free: false,
    recommended: false,
  },
  // Google Gemini Models (FREE)
  {
    id: "gemini-1.5-flash-latest",
    provider: "google",
    name: "Gemini 1.5 Flash",
    description: "Fast and versatile multimodal model with 1M context window",
    context_length: 1048576,
    supportsTools: true,
    supportsVision: true,
    free: false,
    recommended: true,
  },
  {
    id: "gemini-1.5-pro-latest",
    provider: "google",
    name: "Gemini 1.5 Pro",
    description: "Most capable Gemini model with 2M token context window",
    context_length: 2097152,
    supportsTools: true,
    supportsVision: true,
    free: false,
    recommended: true,
  },
  {
    id: "gemini-1.0-pro",
    provider: "google",
    name: "Gemini 1.0 Pro",
    description: "Previous generation Gemini model",
    context_length: 32768,
    supportsTools: true,
    supportsVision: false,
    free: false,
    recommended: true,
  },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const provider = searchParams.get("provider"); // Filter by provider
    const freeOnly = searchParams.get("free") === "true"; // Only free models
    const toolsOnly = searchParams.get("tools") === "true"; // Only models with tool support

    // Check which API keys are configured
    // Check multiple possible environment variable names for Google
    const googleApiKey = 
      process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.GEMINI_API_KEY;
    
    const availableProviders = {
      openai: !!process.env.OPENAI_API_KEY,
      google: !!googleApiKey,
    };

    // Enhanced logging for debugging
    console.log("=== API Key Debug Info ===");
    console.log("Environment check:", {
      NODE_ENV: process.env.NODE_ENV,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ? `Set (${process.env.OPENAI_API_KEY.length} chars)` : "NOT SET",
      GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY ? `Set (${process.env.GOOGLE_GENERATIVE_AI_API_KEY.length} chars)` : "NOT SET",
      GOOGLE_API_KEY: process.env.GOOGLE_API_KEY ? `Set (${process.env.GOOGLE_API_KEY.length} chars)` : "NOT SET",
      GEMINI_API_KEY: process.env.GEMINI_API_KEY ? `Set (${process.env.GEMINI_API_KEY.length} chars)` : "NOT SET",
    });
    console.log("Available providers:", availableProviders);
    console.log("Google API key found:", !!googleApiKey);
    console.log("========================");

    let models = AVAILABLE_MODELS;

    // Filter by configured API keys
    const filteredModels = models.filter(
      (model) =>
        availableProviders[model.provider as keyof typeof availableProviders]
    );

    // Log filtered models for debugging
    if (process.env.NODE_ENV === "development") {
      const filteredOut = models.filter(
        (model) =>
          !availableProviders[model.provider as keyof typeof availableProviders]
      );
      if (filteredOut.length > 0) {
        console.log(
          `Filtered out ${filteredOut.length} model(s) due to missing API keys:`,
          filteredOut.map((m) => `${m.name} (${m.provider})`)
        );
      }
    }

    models = filteredModels;

    // Filter by provider if specified
    if (provider) {
      models = models.filter((m) => m.provider === provider);
    }

    // Filter for free models only
    if (freeOnly) {
      models = models.filter((m) => m.free);
    }

    // Filter for models with tool support
    if (toolsOnly) {
      models = models.filter((m) => m.supportsTools);
    }

    // Group models by provider
    const groupedByProvider = models.reduce((acc: any, model: any) => {
      if (!acc[model.provider]) {
        acc[model.provider] = [];
      }
      acc[model.provider].push(model);
      return acc;
    }, {});

    // Get recommended models (free ones first)
    const recommendedModels = models
      .filter((m) => m.recommended)
      .sort((a, b) => (b.free ? 1 : 0) - (a.free ? 1 : 0));

    return NextResponse.json({
      models,
      groupedByProvider,
      recommendedModels,
      availableProviders,
      // Include debug info in development
      ...(process.env.NODE_ENV === "development" && {
        debug: {
          totalAvailable: AVAILABLE_MODELS.length,
          filteredOut: AVAILABLE_MODELS.length - models.length,
          missingKeys: {
            google: !availableProviders.google,
            openai: !availableProviders.openai,
          },
        },
      }),
      stats: {
        total: models.length,
        free: models.filter((m) => m.free).length,
        paid: models.filter((m) => !m.free).length,
        withTools: models.filter((m) => m.supportsTools).length,
        withVision: models.filter((m) => m.supportsVision).length,
      },
    });
  } catch (error) {
    console.error("Error fetching models:", error);
    return NextResponse.json(
      { error: "Failed to fetch models" },
      { status: 500 }
    );
  }
}
