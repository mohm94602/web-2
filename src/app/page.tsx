import { VideoDownloader } from "@/components/video-downloader";
import { DownloadCloud } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center p-4 sm:p-8 md:p-12 lg:p-24">
      <div className="flex flex-col items-center gap-4 mb-8 text-center">
        <div className="bg-primary rounded-full p-4 shadow-lg">
          <DownloadCloud className="h-10 w-10 text-primary-foreground" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-foreground">
          SocialSaver
        </h1>
        <p className="text-lg text-muted-foreground max-w-md">
          Paste the URL of a social media video to download it in your desired
          quality.
        </p>
      </div>
      <VideoDownloader />
    </main>
  );
}
