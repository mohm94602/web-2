"use server";

import { ai } from "@/ai/genkit";
import { DownloadVideoInputSchema, DownloadVideoOutputSchema, type DownloadVideoInput, type DownloadVideoOutput } from "./schemas";

// The main flow function that calls the RapidAPI.
const downloadVideoFlow = ai.defineFlow(
  {
    name: "downloadVideoFlow",
    inputSchema: DownloadVideoInputSchema,
    outputSchema: DownloadVideoOutputSchema,
  },
  async ({ url }) => {
    if (!process.env.RAPIDAPI_KEY) {
      throw new Error("RAPIDAPI_KEY is not defined in environment variables.");
    }

    const response = await fetch(
      "https://social-download-all-in-one.p.rapidapi.com/v1/social/download",
      {
        method: "POST",
        headers: {
          "x-rapidapi-key": process.env.RAPIDAPI_KEY,
          "x-rapidapi-host": "social-download-all-in-one.p.rapidapi.com",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      }
    );

    if (!response.ok) {
       if (response.status === 429) {
        throw new Error("API rate limit exceeded. Please try again later.");
      }
      const errorBody = await response.text();
      throw new Error(`API call failed with status ${response.status}: ${errorBody}`);
    }

    const data = await response.json();
    
    // The API response structure seems to be nested under `data.media`
    const media = data.data?.medias?.[0];

    if (!media) {
      throw new Error("No media found in the API response.");
    }
    
    const formats = (media.formats || []).map((f: any) => ({
        quality: f.quality || 'N/A',
        type: f.extension || 'mp4',
        size: f.formattedSize || undefined,
        url: f.url,
    })).filter((f: any) => f.url && f.url.startsWith('http')); // Ensure URL is valid

    return {
      title: media.title || "Untitled Video",
      platform: media.source || "Unknown Platform",
      thumbnail: media.thumbnail || undefined,
      formats: formats,
    };
  }
);


// Exported wrapper function to be used by server actions.
export async function downloadVideo(
  input: DownloadVideoInput
): Promise<DownloadVideoOutput> {
  return await downloadVideoFlow(input);
}
