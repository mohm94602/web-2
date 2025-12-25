"use server";

import { downloadVideo } from "@/ai/flows/download-video-flow";
import { type DownloadVideoInput, type DownloadVideoOutput } from "@/ai/flows/schemas";

type ActionResult = {
  data?: DownloadVideoOutput;
  error?: string;
};

export async function fetchVideoMetadataAction(
  input: DownloadVideoInput
): Promise<ActionResult> {
  try {
    const data = await downloadVideo(input);
    // Ensure there's at least one format before returning success
    if (!data.formats || data.formats.length === 0) {
       return { error: "No downloadable formats were found for this video." };
    }
    return { data };
  } catch (error) {
    console.error("Error in fetchVideoMetadataAction:", error);
    if (error instanceof Error) {
      // Provide more user-friendly error messages
      if (error.message.includes('RAPIDAPI_KEY')) {
         return { error: "The API key is not configured on the server." };
      }
      if (error.message.includes('429')) {
         return { error: "The API rate limit has been exceeded. Please try again later." };
      }
      return {
        error: error.message,
      };
    }
    return {
      error: "An unexpected error occurred while processing the video URL.",
    };
  }
}
