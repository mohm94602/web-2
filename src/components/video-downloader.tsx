"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Loader2, Link as LinkIcon, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

import { fetchVideoMetadataAction } from "@/app/actions";
import {
  DownloadVideoInputSchema,
  type DownloadVideoOutput,
  type DownloadVideoInput,
} from "@/ai/flows/download-video-flow";
import { VideoInfoCard } from "./video-info-card";
import { Skeleton } from "./ui/skeleton";

export function VideoDownloader() {
  const [videoInfo, setVideoInfo] = useState<DownloadVideoOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<DownloadVideoInput>({
    resolver: zodResolver(DownloadVideoInputSchema),
    defaultValues: {
      url: "",
    },
  });

  const onSubmit: SubmitHandler<DownloadVideoInput> = async (data) => {
    setIsLoading(true);
    setVideoInfo(null);
    setError(null);
    try {
      const result = await fetchVideoMetadataAction(data);
      if (result.error) {
        throw new Error(result.error);
      }
      if (result.data) {
        setVideoInfo(result.data);
      } else {
        throw new Error("Received no data from the server.");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error Fetching Video",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <Card className="shadow-2xl shadow-primary/10 border-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline text-foreground">
            <LinkIcon className="h-6 w-6 text-primary" />
            Paste Video URL
          </CardTitle>
          <CardDescription>
            Enter the URL of the video you want to download.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative flex items-center">
                        <Input
                          placeholder="https://example.com/video/..."
                          {...field}
                          className="pr-36 text-base h-12"
                        />
                        <Button
                          type="submit"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-9"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Fetching...
                            </>
                          ) : (
                            "Fetch Video"
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <div className="mt-6">
        {isLoading && (
          <Card className="border-none animate-pulse">
            <CardHeader>
              <Skeleton className="h-7 w-3/5 rounded-md" />
              <Skeleton className="h-4 w-2/5 rounded-md" />
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                 <Skeleton className="h-[90px] w-[120px] rounded-lg" />
                 <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-full rounded-md" />
                    <Skeleton className="h-4 w-3/4 rounded-md" />
                 </div>
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-12 w-full rounded-md" />
            </CardFooter>
          </Card>
        )}

        {error && !isLoading && (
           <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {videoInfo && !isLoading && (
          <VideoInfoCard
            key={videoInfo.thumbnail} // Use a key to force re-mount on new video
            videoInfo={videoInfo}
            videoUrl={form.getValues("url")}
          />
        )}
      </div>
    </div>
  );
}
