"use client";

import React, { useState } from "react";
import {
  Film,
  Play,
  Search,
  Clock,
  Eye,
  Plus,
  User,
  X,
  Sparkles,
} from "lucide-react";
import { Video, User as UserType } from "@/lib/api";

interface VideoCatalogViewProps {
  videos: Video[];
  currentUser: UserType | null;
  onViewVideo: (id: number) => Promise<void>;
}

export const VideoCatalogView: React.FC<VideoCatalogViewProps> = ({
  videos,
  currentUser,
  onViewVideo,
}) => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [playingVideo, setPlayingVideo] = useState<Video | null>(null);

  const categories = [
    "All",
    "Technical Demonstrations",
    "Product Demonstrations",
    "Training",
  ];

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handlePlayClick = (video: Video) => {
    setPlayingVideo(video);
    onViewVideo(video.id);
  };

  const filteredVideos = videos.filter((vid) => {
    const matchesSearch =
      vid.title.toLowerCase().includes(search.toLowerCase()) ||
      (vid.description && vid.description.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory =
      selectedCategory === "All" || vid.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white">
              Internal Video Library
            </h1>
            <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-xs font-semibold text-rose-400 border border-rose-500/20">
              {videos.length} Videos Available
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Browse training sessions, system architecture walkthroughs, and end-to-end sandbox demonstrations.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer font-medium ${
                selectedCategory === cat
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="glass-panel p-2 rounded-xl border border-slate-800 flex items-center gap-2 min-w-[220px]">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search video tutorials..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none text-white text-xs w-full focus:outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredVideos.map((video) => (
          <div
            key={video.id}
            onClick={() => handlePlayClick(video)}
            className="glass-panel glass-panel-hover rounded-2xl border border-slate-800 overflow-hidden flex flex-col justify-between cursor-pointer group"
          >
            <div>
              {/* Video Thumbnail with Hover Play Button */}
              <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                <img
                  src={
                    video.thumbnail_url ||
                    "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&auto=format&fit=crop&q=80"
                  }
                  alt={video.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/20 transition flex items-center justify-center">
                  <div className="h-12 w-12 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition ring-4 ring-rose-500/30">
                    <Play className="h-5 w-5 fill-white text-white ml-0.5" />
                  </div>
                </div>

                <div className="absolute bottom-2.5 right-2.5 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded text-[11px] font-mono text-white flex items-center gap-1 border border-slate-800">
                  <Clock className="h-3 w-3 text-rose-400" />
                  {formatDuration(video.duration_seconds)}
                </div>
              </div>

              {/* Body */}
              <div className="p-4 space-y-2">
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">
                  {video.category}
                </span>

                <h3 className="font-bold text-white text-sm line-clamp-2 group-hover:text-rose-300 transition leading-snug">
                  {video.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {video.description}
                </p>
              </div>
            </div>

            <div className="p-4 pt-0 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 mt-2">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3 text-cyan-400" />
                {video.uploader_name}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3 text-slate-500" />
                {video.view_count} views
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* HTML5 Video Modal Player */}
      {playingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
                  {playingVideo.category}
                </span>
                <h3 className="font-bold text-white text-lg">
                  {playingVideo.title}
                </h3>
              </div>
              <button
                onClick={() => setPlayingVideo(null)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Video Player */}
            <div className="relative aspect-video rounded-xl bg-black overflow-hidden border border-slate-800 shadow-2xl">
              <video
                src={playingVideo.video_url}
                controls
                autoPlay
                className="h-full w-full object-contain"
              >
                Your browser does not support HTML5 video streaming.
              </video>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {playingVideo.description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
