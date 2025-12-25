"use server";

import {
  detectVideoSourceAndQuality,
  type DetectVideoSourceAndQualityInput,
  type DetectVideoSourceAndQualityOutput,
} from "@/ai/flows/detect-video-source-and-quality";

type ActionResult = {
  data?: DetectVideoSourceAndQualityOutput;
  error?: string;
};

export async function fetchVideoMetadataAction(
  input: DetectVideoSourceAndQualityInput
): Promise<ActionResult> {
  try {
    const data = await detectVideoSourceAndQuality(input);
    return { data };
  } catch (error) {
    console.error("Error detecting video source:", error);
    if (error instanceof Error) {
      return {
        error: "Could not analyze the video URL. Please check the URL and try again.",
      };
    }
    return {
      error: "An unexpected error occurred while processing the video URL.",
    };
  }
}
