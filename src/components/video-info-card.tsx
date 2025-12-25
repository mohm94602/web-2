"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Youtube, Video, Film } from "lucide-react";
import type { DetectVideoSourceAndQualityOutput } from "@/ai/flows/detect-video-source-and-quality";
import { Label } from "./ui/label";

type VideoInfoCardProps = {
  videoInfo: DetectVideoSourceAndQualityOutput;
  videoUrl: string;
};

const SourceIcon = ({ source }: { source: string }) => {
  const lowerSource = source.toLowerCase();
  if (lowerSource.includes("youtube")) {
    return <Youtube className="h-7 w-7 text-red-600" />;
  }
  if (lowerSource.includes("vimeo")) {
    return (
      <svg
        className="h-7 w-7"
        fill="#00adef"
        viewBox="0 0 256 256"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M246.61 65.17c-4.9-19.4-20.1-27.2-34.5-27.2-22.3 0-33.3 12.1-42.3 35.1-8.5 21.8-15.8 44.8-26.9 44.8-4.2 0-9.2-5.7-10.4-14-1.3-9.5 5.5-19.1 14.8-20.9 9.3-1.8 15.3-7.9 15.8-16.7.5-8.8-5.3-14.7-14-14.7-13.6 0-27.1 7.2-25.9 30.3.8 14.6 9.2 32.4-22.1 32.4-20.3 0-32.4-17.6-32.4-17.6-5.1-10.1-14.3-30.8-37.4-30-7.3.3-12.2 4.4-11.6 12.3 2.1 27.2 48.3 73.1 82.3 73.1 29.5 0 35.6-26.4 35.6-26.4 7.6 15.2 21.3 26.6 40.5 26.6 22 0 40.8-22.3 45.8-41.9 6.9-27.4 3.3-46.6-4.6-57.9z" />
      </svg>
    );
  }
  if (lowerSource.includes("dailymotion")) {
    return <Film className="h-7 w-7" />;
  }
  return <Video className="h-7 w-7" />;
};

export function VideoInfoCard({ videoInfo, videoUrl }: VideoInfoCardProps) {
  const { metadata } = videoInfo;
  const [selectedQuality, setSelectedQuality] = useState<string>(
    metadata.qualities[0]
  );

  const handleDownload = () => {
    // In a real app, this would trigger a backend download process.
    // For this example, we simulate a download by opening the source video.
    const link = document.createElement("a");
    link.href = videoUrl; // Placeholder to the original video URL
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    // The 'download' attribute is unlikely to work for cross-origin resources
    // without specific server headers, but we include it for completeness.
    // It will likely just open the link in a new tab.
    link.download = `SocialSaver_${metadata.source}_${selectedQuality}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="shadow-lg transition-all duration-500 ease-in-out transform hover:shadow-xl hover:-translate-y-1 border-none animate-in fade-in-0 zoom-in-95">
      <CardHeader>
        <div className="flex items-center gap-3">
          <SourceIcon source={metadata.source} />
          <div>
            <CardTitle className="font-headline text-2xl text-foreground">
              {metadata.source} Video Ready
            </CardTitle>
            <CardDescription>Select quality and start your download.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="quality-select" className="text-sm font-medium">
            Quality
          </Label>
          <Select value={selectedQuality} onValueChange={setSelectedQuality}>
            <SelectTrigger id="quality-select" className="w-full h-11">
              <SelectValue placeholder="Select a quality" />
            </SelectTrigger>
            <SelectContent>
              {metadata.qualities.map((quality) => (
                <SelectItem key={quality} value={quality}>
                  {quality} {metadata.format && `(.${metadata.format})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleDownload}
          className="w-full ml-auto"
          size="lg"
        >
          <Download className="mr-2 h-5 w-5" />
          Download {selectedQuality}
        </Button>
      </CardFooter>
    </Card>
  );
}
