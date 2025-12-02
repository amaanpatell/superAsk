import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/models", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API request failed:${response.status}`);
    }

    const data = await response.json();

    const freeModels = data.data.filter((model: any) => {
      const promtPrice = parseFloat(model.pricing?.prompt || 0);
      const completionPrice = parseFloat(model.pricing?.completion || 0);
      return promtPrice === 0 && completionPrice === 0;
    });

    const formattedMoels = freeModels.map((model: any) => {
      return {
        id: model.id,
        name: model.name,
        description: model.description,
        context_length: model.context_length,
        architecture: model.architecture,
        pricing: model.pricing,
        top_provider: model.top_provider,
      };
    });

    return NextResponse.json({
      models: formattedMoels,
    });
  } catch (error) {
    console.error("Error fetching models:", error);
    return NextResponse.json(
      { error: "Failed to fetch models" },
      { status: 500 }
    );
  }
}
