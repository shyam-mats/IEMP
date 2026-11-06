"use client";

import React, { useState } from "react";
import {
  Presentation as PresentationIcon,
  Download,
  Eye,
  Search,
  Plus,
  Clock,
  User,
  Tag,
  Layers,
  FileText,
  X,
  ExternalLink,
} from "lucide-react";
import { Presentation, User as UserType } from "@/lib/api";

interface PPTCatalogViewProps {
  presentations: Presentation[];
  currentUser: UserType | null;
  onDownload: (id: number) => Promise<void>;
  onUpload: (data: any) => Promise<void>;
}

export const PPTCatalogView: React.FC<PPTCatalogViewProps> = ({
  presentations,
  currentUser,
  onDownload,
  onUpload,
}) => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [previewPPT, setPreviewPPT] = useState<Presentation | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Upload state
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCategory, setNewCategory] = useState("Technical Presentations");
  const [newVersion, setNewVersion] = useState("v1.0");
  const [newSlideCount, setNewSlideCount] = useState("20");

  const categories = [
    "All",
    "Technical Presentations",
    "Product Demonstrations",
    "Customer Presentations",
    "Training",
    "Internal Reviews",
  ];

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    try {
      await onUpload({
        title: newTitle,
        description: newDesc,
        category: newCategory,
        version: newVersion,
        slide_count: parseInt(newSlideCount) || 15,
        size_mb: 5.2,
        download_url: `/storage/decks/${newTitle.toLowerCase().replace(/\s+/g, "-")}.pptx`,
        tags: ["Architecture", "Engineering", "Presentation"],
      });
      setIsUploadModalOpen(false);
      setNewTitle("");
      setNewDesc("");
    } catch (err: any) {
      alert(`Upload failed: ${err.message}`);
    }
  };

  const filteredDecks = presentations.filter((deck) => {
    const matchesSearch =
      deck.title.toLowerCase().includes(search.toLowerCase()) ||
      (deck.description && deck.description.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory =
      selectedCategory === "All" || deck.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white">
              PPT & Architecture Catalog
            </h1>
            <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-xs font-semibold text-purple-400 border border-purple-500/20">
              {presentations.length} Cataloged Decks
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Search, preview, and download authorized architecture decks, compliance briefs, and product demos.
          </p>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-xs shadow-lg shadow-purple-500/20 transition cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Catalog Presentation
        </button>
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
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
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
            placeholder="Search presentations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none text-white text-xs w-full focus:outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Presentations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
        {filteredDecks.map((deck) => (
          <div
            key={deck.id}
            className="glass-panel glass-panel-hover rounded-2xl border border-slate-800 overflow-hidden flex flex-col justify-between"
          >
            <div>
              {/* Thumbnail / Header Preview */}
              <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                <img
                  src={
                    deck.thumbnail_url ||
                    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80"
                  }
                  alt={deck.title}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105 opacity-80 hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <span className="rounded-md bg-slate-950/80 backdrop-blur-md px-2 py-0.5 text-[10px] font-semibold text-purple-300 border border-purple-500/30">
                    {deck.version}
                  </span>
                  <span className="rounded-md bg-slate-950/80 backdrop-blur-md px-2 py-0.5 text-[10px] font-semibold text-slate-300 border border-slate-700">
                    {deck.slide_count} Slides
                  </span>
                </div>

                <div className="absolute bottom-3 left-4 right-4">
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block mb-1">
                    {deck.category}
                  </span>
                  <h3 className="font-bold text-white text-base leading-snug line-clamp-2">
                    {deck.title}
                  </h3>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-4 space-y-3">
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                  {deck.description}
                </p>

                {/* Tags */}
                {deck.tags && deck.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {deck.tags.map((t, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-800"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3 text-cyan-400" />
                    <span>{deck.uploader_name}</span>
                  </div>
                  <div>
                    <span>{deck.size_mb} MB</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 pt-0 flex items-center justify-between gap-2">
              <button
                onClick={() => setPreviewPPT(deck)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
              >
                <Eye className="h-3.5 w-3.5 text-cyan-400" />
                Quick Preview
              </button>

              <button
                onClick={() => onDownload(deck.id)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-bold border border-purple-500/30 transition cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                Download PPTX
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Slide Preview Modal */}
      {previewPPT && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                  {previewPPT.category} ({previewPPT.version})
                </span>
                <h3 className="font-bold text-white text-lg">
                  {previewPPT.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Presented by {previewPPT.uploader_name} ({previewPPT.uploader_email})
                </p>
              </div>
              <button
                onClick={() => setPreviewPPT(null)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mock Slide Viewport */}
            <div className="relative aspect-video rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex flex-col items-center justify-center text-center p-8">
              <img
                src={previewPPT.thumbnail_url}
                alt={previewPPT.title}
                className="absolute inset-0 h-full w-full object-cover opacity-20"
              />
              <div className="relative z-10 space-y-2 max-w-md">
                <PresentationIcon className="h-12 w-12 text-purple-400 mx-auto" />
                <h4 className="font-bold text-white text-base">
                  {previewPPT.title}
                </h4>
                <p className="text-xs text-slate-300">
                  {previewPPT.description}
                </p>
                <div className="pt-2 text-[11px] text-cyan-400 font-mono">
                  Slide 1 of {previewPPT.slide_count} • {previewPPT.size_mb} MB
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">
                Download will be registered in the platform audit log.
              </span>
              <button
                onClick={() => {
                  onDownload(previewPPT.id);
                  setPreviewPPT(null);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 transition cursor-pointer"
              >
                <Download className="h-4 w-4" />
                Download Presentation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">
                Catalog New Presentation
              </h3>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Presentation Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q4 Cloud Security & Zero-Trust Architecture"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Technical Presentations">Technical Presentations</option>
                    <option value="Product Demonstrations">Product Demonstrations</option>
                    <option value="Customer Presentations">Customer Presentations</option>
                    <option value="Training">Training</option>
                    <option value="Internal Reviews">Internal Reviews</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Version</label>
                  <input
                    type="text"
                    value={newVersion}
                    onChange={(e) => setNewVersion(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Description</label>
                <textarea
                  rows={2}
                  placeholder="Summary of topics covered..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/20 transition"
                >
                  Save & Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
