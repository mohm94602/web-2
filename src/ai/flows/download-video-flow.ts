'use server';
/**
 * @fileOverview A flow to fetch video download information using the social-download-all-in-one API.
 *
 * - downloadVideo - A function that handles fetching video metadata and download links.
 * - DownloadVideoInput - The input type for the downloadVideo function.
 * - DownloadVideoOutput - The return type for the downloadVideo function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Input Schema: Matches the user's form input.
export const DownloadVideoInputSchema = z.object({
  url: z.string().url().describe('The URL of the video to download.'),
});
export type DownloadVideoInput = z.infer<typeof DownloadVideoInputSchema>;

// Output Schema: Defines the structure of the data we want to return to the client.
const FormatSchema = z.object({
  quality: z.string().optional().describe('The quality of the video, e.g., "720p".'),
  type: z.string().optional().describe('The file type, e.g., "mp4".'),
  size: z.string().optional().describe('The file size, e.g., "24.5 MB".'),
  url: z.string().url().describe('The direct download URL for the media.'),
});

export const DownloadVideoOutputSchema = z.object({
  title: z.string().describe('The title of the video.'),
  platform: z.string().describe('The platform the video is from, e.g., "YouTube".'),
  thumbnail: z.string().url().describe('URL of the video thumbnail image.'),
  formats: z
    .array(FormatSchema)
    .describe('An array of available download formats.'),
});
export type DownloadVideoOutput = z.infer<typeof DownloadVideoOutputSchema>;

// This function will be called by the Server Action. It wraps the Genkit flow.
export async function downloadVideo(
  input: DownloadVideoInput
): Promise<DownloadVideoOutput> {
  return downloadVideoFlow(input);
}

// Defines a Genkit tool to interact with the RapidAPI service.
const fetchVideoFromRapidAPI = ai.defineTool(
  {
    name: 'fetchVideoFromRapidAPI',
    description: 'Fetches video download information from the social-download-all-in-one RapidAPI.',
    inputSchema: DownloadVideoInputSchema,
    outputSchema: z.any(), // We accept any JSON response from the API first.
  },
  async (input) => {
    const apiKey = process.env.RAPIDAPI_KEY;
    if (!apiKey) {
      throw new Error('RAPIDAPI_KEY environment variable is not set. Please add it to your .env file.');
    }

    const response = await fetch(
      'https://social-download-all-in-one.p.rapidapi.com/v1/social/autodetect',
      {
        method: 'POST',
        headers: {
          'x-rapidapi-key': apiKey,
          'x-rapidapi-host': 'social-download-all-in-one.p.rapidapi.com',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: input.url }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('RapidAPI Error:', errorBody);
      throw new Error(`API request failed with status ${response.status}. Please check the console for details.`);
    }

    const jsonResponse = await response.json();
    if (jsonResponse.status !== 'success' || !jsonResponse.body) {
      throw new Error(jsonResponse.message || 'The API returned an error or an empty body.');
    }

    return jsonResponse;
  }
);


const downloadVideoFlow = ai.defineFlow(
  {
    name: 'downloadVideoFlow',
    inputSchema: DownloadVideoInputSchema,
    outputSchema: DownloadVideoOutputSchema,
  },
  async (input) => {
    // Call the tool to get the raw API response.
    const apiResponse = await fetchVideoFromRapidAPI(input);

    // The actual data is in the 'body' property of the response
    const result = apiResponse.body;
    
    // Extract formats, preferring 'medias' over older 'links' array
    const medias = result.medias || result.links || [];

    const formats = medias
      .map((item: any) => {
        // Filter out items without a URL or with very small sizes (likely invalid files)
        if (!item.url || (item.size && parseFloat(item.size) < 0.01)) {
          return null;
        }
        return {
          quality: item.quality || (item.audio ? 'Audio' : 'Video'), // Mark as audio if quality is missing but audio flag is present
          type: item.type || 'mp4',
          size: item.formattedSize || item.size,
          url: item.url,
        };
      })
      .filter((item: any): item is z.infer<typeof FormatSchema> => !!item); // Remove null entries and type guard

    if (formats.length === 0) {
      throw new Error("No downloadable media links were found in the API response.");
    }

    // Ensure thumbnail is a valid URL, otherwise provide a fallback or empty string.
    let thumbnailUrl = '';
    try {
        if (result.thumbnail) {
            new URL(result.thumbnail);
            thumbnailUrl = result.thumbnail;
        }
    } catch (e) {
        // Invalid thumbnail URL, leave it as an empty string.
    }

    return {
      title: result.title || 'Untitled Video',
      platform: result.source || 'Unknown Platform',
      thumbnail: thumbnailUrl,
      formats: formats,
    };
  }
);
