"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, Link as LinkIcon } from "lucide-react";

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
import { useToast } from "@/hooks/use-toast";

import { fetchVideoMetadataAction } from "@/app/actions";
import type { DetectVideoSourceAndQualityOutput } from "@/ai/flows/detect-video-source-and-quality";
import { VideoInfoCard } from "./video-info-card";
import { Skeleton } from "./ui/skeleton";

const FormSchema = z.object({
  videoUrl: z.string().url({ message: "Please enter a valid URL." }),
});

export function VideoDownloader() {
  const [videoInfo, setVideoInfo] =
    useState<DetectVideoSourceAndQualityOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      videoUrl: "",
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    setVideoInfo(null);
    try {
      const result = await fetchVideoMetadataAction(data);
      if (result.error) {
        throw new Error(result.error);
      }
      setVideoInfo(result.data);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "An unknown error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  }

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
                name="videoUrl"
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
                              Fetching
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

      {isLoading && (
        <Card className="mt-6 border-none">
          <CardHeader>
            <Skeleton className="h-7 w-2/5 rounded-md" />
            <Skeleton className="h-4 w-1/3 rounded-md" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-16 rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-12 w-full rounded-md" />
          </CardFooter>
        </Card>
      )}

      {videoInfo && !isLoading && (
        <div className="mt-6">
          <VideoInfoCard
            videoInfo={videoInfo}
            videoUrl={form.getValues("videoUrl")}
          />
        </div>
      )}
    </div>
  );
}
