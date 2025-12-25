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
import { Download, Youtube, Video, Film, Music, AlertTriangle } from "lucide-react";
import { Label } from "./ui/label";
import Image from "next/image";
import { type DownloadVideoOutput } from "@/ai/flows/download-video-flow";

type VideoInfoCardProps = {
  videoInfo: DownloadVideoOutput;
  videoUrl: string; // The original URL is kept for fallback download logic
};

const SourceIcon = ({ source }: { source: string }) => {
  const lowerSource = source.toLowerCase();
  if (lowerSource.includes("youtube")) {
    return <Youtube className="h-7 w-7 text-red-600" />;
  }
   if (lowerSource.includes("vimeo")) {
    return <svg className="h-7 w-7" fill="#00adef" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M246.61 65.17c-4.9-19.4-20.1-27.2-34.5-27.2-22.3 0-33.3 12.1-42.3 35.1-8.5 21.8-15.8 44.8-26.9 44.8-4.2 0-9.2-5.7-10.4-14-1.3-9.5 5.5-19.1 14.8-20.9 9.3-1.8 15.3-7.9 15.8-16.7.5-8.8-5.3-14.7-14-14.7-13.6 0-27.1 7.2-25.9 30.3.8 14.6 9.2 32.4-22.1 32.4-20.3 0-32.4-17.6-32.4-17.6-5.1-10.1-14.3-30.8-37.4-30-7.3.3-12.2 4.4-11.6 12.3 2.1 27.2 48.3 73.1 82.3 73.1 29.5 0 35.6-26.4 35.6-26.4 7.6 15.2 21.3 26.6 40.5 26.6 22 0 40.8-22.3 45.8-41.9 6.9-27.4 3.3-46.6-4.6-57.9z"/></svg>;
  }
  if (lowerSource.includes("dailymotion")) {
    return <Film className="h-7 w-7" />;
  }
  if (lowerSource.includes('tiktok') || lowerSource.includes('instagram')) {
    return <Video className="h-7 w-7 text-pink-500" />;
  }
  return <Video className="h-7 w-7" />;
};


export function VideoInfoCard({ videoInfo, videoUrl }: VideoInfoCardProps) {
  const { title, platform, thumbnail, formats } = videoInfo;
  const [selectedFormatUrl, setSelectedFormatUrl] = useState<string>(
    formats[0]?.url || ""
  );

  const handleDownload = () => {
    // This approach triggers a download in the browser.
    // It's client-side, so no server bandwidth is used for the download itself.
    const url = selectedFormatUrl || videoUrl; // Fallback to original URL if somehow none is selected
    
    // Using fetch to get the blob is more reliable for initiating downloads,
    // especially for cross-origin resources.
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        return response.blob();
      })
      .then(blob => {
        const selectedFormat = formats.find(f => f.url === selectedFormatUrl);
        const fileName = `${platform}_${title.slice(0, 20)}_${selectedFormat?.quality || 'video'}.${selectedFormat?.type || 'mp4'}`.replace(/[^a-zA-Z0-9_.-]/g, '_');

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href); // Clean up the object URL
      })
      .catch(err => {
        console.error("Download failed:", err);
        // If fetch fails (e.g., CORS issues), fall back to opening in a new tab.
        window.open(url, '_blank');
      });
  };

  const getQualityLabel = (format: (typeof formats)[0]) => {
    let labelParts: string[] = [];
    if (format.quality && format.quality.toLowerCase() !== 'audio') {
        labelParts.push(format.quality);
    } else if (format.quality?.toLowerCase() === 'audio') {
        labelParts.push("Audio");
    }

    if (format.type) labelParts.push(`.${format.type}`);
    if (format.size) labelParts.push(`(${format.size})`);
    
    return labelParts.join(' ');
  };
  
  const getIconForFormat = (format: (typeof formats)[0]) => {
      if (format.quality?.toLowerCase() === 'audio') {
          return <Music className="mr-2 h-4 w-4 text-blue-400" />
      }
      return <Video className="mr-2 h-4 w-4 text-green-400" />
  }

  return (
    <Card className="shadow-lg transition-all duration-500 ease-in-out transform hover:shadow-xl hover:-translate-y-1 border-none animate-in fade-in-0 zoom-in-95">
      <CardHeader>
        <div className="flex items-start gap-4">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={title}
              width={120}
              height={90}
              className="rounded-lg object-cover bg-muted"
              unoptimized // Required for external URLs that aren't in next.config.js
            />
          ) : (
            <div className="w-[120px] h-[90px] bg-muted rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <SourceIcon source={platform} />
              <CardTitle className="font-headline text-xl text-foreground leading-tight">
                {title}
              </CardTitle>
            </div>
            <CardDescription>
              Select a format to start your download.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="quality-select" className="text-sm font-medium">
            Available Formats
          </Label>
          <Select
            value={selectedFormatUrl}
            onValueChange={setSelectedFormatUrl}
          >
            <SelectTrigger id="quality-select" className="w-full h-11">
              <SelectValue placeholder="Select a format" />
            </SelectTrigger>
            <SelectContent>
              {formats.map((format, index) => (
                <SelectItem key={`${format.url}-${index}`} value={format.url}>
                 <div className="flex items-center">
                    {getIconForFormat(format)}
                    {getQualityLabel(format)}
                  </div>
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
          disabled={!selectedFormatUrl}
        >
          <Download className="mr-2 h-5 w-5" />
          Download Now
        </Button>
      </CardFooter>
    </Card>
  );
}
