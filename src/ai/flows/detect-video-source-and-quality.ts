'use server';
/**
 * @fileOverview Detects the video source and available download qualities from a given URL.
 *
 * - detectVideoSourceAndQuality - A function that handles the video source and quality detection process.
 * - DetectVideoSourceAndQualityInput - The input type for the detectVideoSourceAndQuality function.
 * - DetectVideoSourceAndQualityOutput - The return type for the detectVideoSourceAndQuality function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectVideoSourceAndQualityInputSchema = z.object({
  videoUrl: z.string().url().describe('The URL of the video to analyze.'),
});
export type DetectVideoSourceAndQualityInput = z.infer<
  typeof DetectVideoSourceAndQualityInputSchema
>;

const VideoMetadataSchema = z.object({
  source: z.string().describe('The source of the video (e.g., YouTube, Vimeo).'),
  qualities: z
    .array(z.string())
    .describe('The available download qualities for the video (e.g., 1080p, 720p, 360p).'),
  format: z.string().optional().describe('The video format (e.g., mp4, avi).'),
});

const DetectVideoSourceAndQualityOutputSchema = z.object({
  metadata: VideoMetadataSchema.describe('The metadata of the video.'),
});

export type DetectVideoSourceAndQualityOutput = z.infer<
  typeof DetectVideoSourceAndQualityOutputSchema
>;

async function getVideoMetadata(url: string): Promise<VideoMetadataSchema> {
  // Placeholder implementation: Replace with actual metadata extraction logic.
  // This could involve calling a separate service or using a library to parse the video URL and retrieve metadata.
  // For now, return mock data.
  console.log(`Fetching metadata for: ${url}`);
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network request.

  // Basic validation to ensure URL is present
  if (!url) {
    throw new Error('URL cannot be empty');
  }

  // Enhanced validation using regex to check for common video platform URL patterns
  const youtubeRegex = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)(?:&.*)?$/;
  const vimeoRegex = /^(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(\d+)(?:\?.*)?$/;
  const dailymotionRegex = /^(?:https?:\/\/)?(?:www\.)?dailymotion\.com\/video\/([\w-]+)(?:\?.*)?$/;

  if (youtubeRegex.test(url)) {
    return {
      source: 'YouTube',
      qualities: ['1080p', '720p', '360p'],
      format: 'mp4',
    };
  } else if (vimeoRegex.test(url)) {
    return {
      source: 'Vimeo',
      qualities: ['720p', '480p', '360p'],
      format: 'mp4',
    };
  } else if (dailymotionRegex.test(url)) {
    return {
      source: 'Dailymotion',
      qualities: ['720p', '480p', '360p'],
      format: 'mp4',
    };
  } else {
    // Generic fallback
    return {
      source: 'Generic',
      qualities: ['720p', '480p', '360p'],
      format: 'mp4',
    };
  }
}

const detectVideoSourceAndQualityTool = ai.defineTool({
  name: 'getVideoMetadata',
  description: 'Retrieves metadata for a given video URL, including source and available qualities.',
  inputSchema: DetectVideoSourceAndQualityInputSchema,
  outputSchema: VideoMetadataSchema,
},
async (input) => {
  return await getVideoMetadata(input.videoUrl);
}
);

const detectVideoSourceAndQualityPrompt = ai.definePrompt({
  name: 'detectVideoSourceAndQualityPrompt',
  tools: [detectVideoSourceAndQualityTool],
  input: {schema: DetectVideoSourceAndQualityInputSchema},
  output: {schema: DetectVideoSourceAndQualityOutputSchema},
  prompt: `Extract video source and qualities. Use the getVideoMetadata tool to get the video metadata from the following URL: {{{videoUrl}}}.`,
});

const detectVideoSourceAndQualityFlow = ai.defineFlow(
  {
    name: 'detectVideoSourceAndQualityFlow',
    inputSchema: DetectVideoSourceAndQualityInputSchema,
    outputSchema: DetectVideoSourceAndQualityOutputSchema,
  },
  async input => {
    const {output} = await detectVideoSourceAndQualityPrompt(input);
    return output!;
  }
);

export async function detectVideoSourceAndQuality(
  input: DetectVideoSourceAndQualityInput
): Promise<DetectVideoSourceAndQualityOutput> {
  return detectVideoSourceAndQualityFlow(input);
}
