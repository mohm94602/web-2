"use client";

import { z } from "zod";

// Define the input schema for the video download flow.
export const DownloadVideoInputSchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL." }),
});
export type DownloadVideoInput = z.infer<typeof DownloadVideoInputSchema>;

// Define the output schema for the video download flow.
const FormatSchema = z.object({
  quality: z.string(),
  type: z.string(),
  size: z.string().optional(),
  url: z.string(),
});

export const DownloadVideoOutputSchema = z.object({
  title: z.string(),
  platform: z.string(),
  thumbnail: z.string().optional(),
  formats: z.array(FormatSchema),
});
export type DownloadVideoOutput = z.infer<typeof DownloadVideoOutputSchema>;
