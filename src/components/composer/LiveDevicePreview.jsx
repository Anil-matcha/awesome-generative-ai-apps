"use client";

import { useState } from "react";
import { FaYoutube, FaInstagram, FaLinkedin } from "react-icons/fa";
import { FaXTwitter, FaThreads } from "react-icons/fa6";
import { SiTiktok } from "react-icons/si";
import { 
  FiHeart, 
  FiMessageCircle, 
  FiShare2, 
  FiBookmark, 
  FiRepeat, 
  FiMoreHorizontal, 
  FiPlay, 
  FiThumbsUp, 
  FiThumbsDown,
  FiSend
} from "react-icons/fi";

export default function LiveDevicePreview({
  platform = "youtube",
  title = "",
  description = "",
  tags = "",
  mediaUrl = "",
  accountName = "Creator Studio",
}) {
  const [activePreviewTab, setActivePreviewTab] = useState(platform);

  const displayTitle = title || "Your engaging post title goes here...";
  const displayDescription = description || "Write an engaging description, hook your audience, and add hashtags to boost reach!";
  const displayMedia = mediaUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60";
  const displayAccount = accountName || "Creator Studio";
  const handle = "@" + displayAccount.toLowerCase().replace(/[^a-z0-9_]/g, "");

  const previewTabs = [
    { key: "youtube", name: "YouTube", Icon: FaYoutube, color: "text-red-500", activeStyle: "bg-red-500/20 text-red-400 border border-red-500/40 shadow-sm shadow-red-500/20" },
    { key: "tiktok", name: "TikTok", Icon: SiTiktok, color: "text-cyan-400", activeStyle: "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm shadow-cyan-500/20" },
    { key: "instagram", name: "Instagram", Icon: FaInstagram, color: "text-pink-500", activeStyle: "bg-pink-500/20 text-pink-400 border border-pink-500/40 shadow-sm shadow-pink-500/20" },
    { key: "x_twitter", name: "X", Icon: FaXTwitter, color: "text-sky-400", activeStyle: "bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-sm shadow-sky-500/20" },
    { key: "linkedin", name: "LinkedIn", Icon: FaLinkedin, color: "text-blue-500", activeStyle: "bg-blue-500/20 text-blue-400 border border-blue-500/40 shadow-sm shadow-blue-500/20" },
    { key: "threads", name: "Threads", Icon: FaThreads, color: "text-purple-400", activeStyle: "bg-purple-500/20 text-purple-400 border border-purple-500/40 shadow-sm shadow-purple-500/20" },
  ];

  return (
    <div className="flex flex-col h-full bg-zinc-950/50 rounded-xl border border-zinc-800 p-3.5 sm:p-4 overflow-hidden">
      {/* Header & Platform Switcher Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-zinc-800/80 gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50 animate-pulse" />
          <span className="text-[11px] font-semibold text-zinc-300">
            Live Feed Mockup
          </span>
        </div>
        <div className="flex items-center gap-1 bg-zinc-900/90 p-1 rounded-lg border border-zinc-800 flex-wrap">
          {previewTabs.map((tab) => {
            const Icon = tab.Icon;
            const isActive = activePreviewTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActivePreviewTab(tab.key)}
                className={`p-1 px-2 rounded-md text-[11px] font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                  isActive
                    ? tab.activeStyle
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                }`}
                title={`Preview on ${tab.name}`}
              >
                <Icon className={`text-xs ${isActive ? "text-current" : tab.color}`} />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Device Mockup Canvas */}
      <div className="flex-1 flex items-center justify-center min-h-[400px] overflow-hidden w-full">
        {/* YOUTUBE MOCKUP */}
        {activePreviewTab === "youtube" && (
          <div className="w-full max-w-[320px] mx-auto bg-zinc-900/90 rounded-xl border border-zinc-800 overflow-hidden text-zinc-100">
            {/* Video Thumbnail */}
            <div className="relative aspect-video bg-black overflow-hidden group">
              <img
                src={displayMedia}
                alt="YouTube Thumbnail"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-red-600/90 text-white flex items-center justify-center">
                  <FiPlay className="text-base ml-0.5 fill-current" />
                </div>
              </div>
              <span className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[9px] font-mono px-1 py-0.5 rounded">
                12:45
              </span>
            </div>

            {/* Video Metadata */}
            <div className="p-3 space-y-2.5">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-300 font-medium flex items-center justify-center shrink-0 text-xs border border-zinc-700">
                  {displayAccount.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-medium text-zinc-100 line-clamp-2 leading-snug">
                    {displayTitle}
                  </h4>
                  <p className="text-[10px] text-zinc-500 mt-0.5 flex items-center gap-1.5">
                    <span className="text-zinc-400">{displayAccount}</span>
                    <span>•</span>
                    <span>1.2K views</span>
                  </p>
                </div>
              </div>

              {/* Description Preview */}
              <div className="bg-zinc-950/60 p-2 rounded-lg text-[11px] text-zinc-400 border border-zinc-800/60 leading-relaxed line-clamp-3">
                {displayDescription}
                {tags && (
                  <p className="text-zinc-500 font-mono mt-1 text-[10px]">
                    {tags.split(",").map(t => `#${t.trim()}`).join(" ")}
                  </p>
                )}
              </div>

              {/* Engagement Bar */}
              <div className="flex items-center justify-between pt-0.5 text-zinc-400 text-xs">
                <div className="flex items-center gap-1 bg-zinc-800/60 px-2 py-0.5 rounded-md text-[11px]">
                  <FiThumbsUp className="text-[10px]" />
                  <span>248</span>
                  <span className="mx-1 text-zinc-600">|</span>
                  <FiThumbsDown className="text-[10px]" />
                </div>
                <div className="flex items-center gap-1 bg-zinc-800/60 px-2 py-0.5 rounded-md text-[11px]">
                  <FiShare2 className="text-[10px]" />
                  <span>Share</span>
                </div>
                <div className="flex items-center gap-1 bg-zinc-800/60 px-2 py-0.5 rounded-md text-[11px]">
                  <FiBookmark className="text-[10px]" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TIKTOK MOCKUP */}
        {activePreviewTab === "tiktok" && (
          <div className="relative w-[250px] h-[420px] mx-auto bg-black rounded-2xl border border-zinc-800 overflow-hidden flex flex-col justify-between p-3">
            {/* Background Media */}
            <img
              src={displayMedia}
              alt="TikTok Media"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90" />

            {/* Top Navigation */}
            <div className="relative z-10 flex items-center justify-center gap-4 text-[11px] font-medium text-white/70 pt-1">
              <span>Following</span>
              <span className="text-white border-b-2 border-white pb-0.5">For You</span>
            </div>

            {/* Right Action Icons */}
            <div className="absolute right-2.5 bottom-14 z-10 flex flex-col items-center gap-3 text-white">
              <div className="relative mb-1">
                <div className="w-7 h-7 rounded-full bg-zinc-800 border border-white overflow-hidden flex items-center justify-center font-bold text-xs">
                  {displayAccount.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <div className="w-6 h-6 rounded-full bg-black/40 flex items-center justify-center">
                  <FiHeart className="text-xs text-red-500 fill-red-500" />
                </div>
                <span className="text-[9px] font-mono">14.2K</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <div className="w-6 h-6 rounded-full bg-black/40 flex items-center justify-center">
                  <FiMessageCircle className="text-xs" />
                </div>
                <span className="text-[9px] font-mono">892</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <div className="w-6 h-6 rounded-full bg-black/40 flex items-center justify-center">
                  <FiBookmark className="text-xs" />
                </div>
                <span className="text-[9px] font-mono">4.1K</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <div className="w-6 h-6 rounded-full bg-black/40 flex items-center justify-center">
                  <FiShare2 className="text-xs" />
                </div>
                <span className="text-[9px] font-mono">340</span>
              </div>
            </div>

            {/* Bottom Caption & Audio */}
            <div className="relative z-10 text-white space-y-1 pr-10 pb-1">
              <span className="text-[11px] font-medium">{handle}</span>
              <p className="text-[10px] leading-snug line-clamp-2 text-zinc-200">
                {displayTitle} - {displayDescription}
              </p>
              {tags && (
                <p className="text-[10px] text-cyan-300 font-mono">
                  {tags.split(",").map(t => `#${t.trim()}`).join(" ")}
                </p>
              )}
              <div className="flex items-center gap-1 text-[9px] text-zinc-400 pt-0.5">
                <span>🎵</span>
                <span className="truncate">{displayAccount} • Original Sound</span>
              </div>
            </div>
          </div>
        )}

        {/* INSTAGRAM MOCKUP */}
        {activePreviewTab === "instagram" && (
          <div className="w-full max-w-[320px] mx-auto bg-zinc-900/90 rounded-xl border border-zinc-800 overflow-hidden text-zinc-100">
            {/* Post Header */}
            <div className="flex items-center justify-between p-2.5 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-medium text-[10px]">
                  {displayAccount.charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className="text-[11px] font-medium block">{handle.replace("@", "")}</span>
                  <span className="text-[9px] text-zinc-500">Original Audio</span>
                </div>
              </div>
              <FiMoreHorizontal className="text-zinc-500 text-xs" />
            </div>

            {/* Media Canvas */}
            <div className="aspect-square bg-black relative overflow-hidden">
              <img
                src={displayMedia}
                alt="Instagram Media"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Engagement Icons */}
            <div className="p-2.5 space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <FiHeart className="hover:text-red-400 cursor-pointer" />
                  <FiMessageCircle className="cursor-pointer" />
                  <FiSend className="cursor-pointer" />
                </div>
                <FiBookmark className="cursor-pointer" />
              </div>
              <span className="text-[11px] font-medium block text-zinc-300">1,842 likes</span>
              <p className="text-[11px] text-zinc-300 leading-snug line-clamp-2">
                <span className="font-medium mr-1.5 text-zinc-100">{handle.replace("@", "")}</span>
                {displayTitle} - {displayDescription}
              </p>
              {tags && (
                <p className="text-[10px] text-zinc-500 font-mono">
                  {tags.split(",").map(t => `#${t.trim()}`).join(" ")}
                </p>
              )}
            </div>
          </div>
        )}

        {/* X / TWITTER MOCKUP */}
        {activePreviewTab === "x_twitter" && (
          <div className="w-full max-w-[320px] mx-auto bg-zinc-950 rounded-xl border border-zinc-800 p-3.5 text-zinc-100 space-y-2">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center font-medium text-xs shrink-0 border border-zinc-700">
                {displayAccount.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 truncate">
                    <span className="text-[11px] font-medium truncate">{displayAccount}</span>
                    <span className="text-[10px] text-zinc-500 truncate">{handle}</span>
                  </div>
                  <FiMoreHorizontal className="text-zinc-500 shrink-0 text-xs" />
                </div>

                {/* Tweet Body */}
                <p className="text-[11px] text-zinc-200 mt-1 leading-relaxed whitespace-pre-line line-clamp-3">
                  {displayTitle}
                  {"\n"}
                  {displayDescription}
                </p>

                {tags && (
                  <p className="text-[10px] text-zinc-500 font-mono mt-1">
                    {tags.split(",").map(t => `#${t.trim()}`).join(" ")}
                  </p>
                )}

                {/* Media Embed */}
                {displayMedia && (
                  <div className="mt-2 rounded-lg overflow-hidden border border-zinc-800 aspect-video bg-zinc-900">
                    <img
                      src={displayMedia}
                      alt="Tweet Media"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Action Bar */}
                <div className="flex items-center justify-between mt-2 text-zinc-500 text-[11px] max-w-[220px]">
                  <div className="flex items-center gap-1 hover:text-zinc-300 cursor-pointer">
                    <FiMessageCircle className="text-xs" />
                    <span>32</span>
                  </div>
                  <div className="flex items-center gap-1 hover:text-zinc-300 cursor-pointer">
                    <FiRepeat className="text-xs" />
                    <span>18</span>
                  </div>
                  <div className="flex items-center gap-1 hover:text-zinc-300 cursor-pointer">
                    <FiHeart className="text-xs" />
                    <span>142</span>
                  </div>
                  <div className="flex items-center gap-1 hover:text-zinc-300 cursor-pointer">
                    <FiBookmark className="text-xs" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LINKEDIN MOCKUP */}
        {activePreviewTab === "linkedin" && (
          <div className="w-full max-w-[320px] mx-auto bg-zinc-900/90 rounded-xl border border-zinc-800 p-3.5 text-zinc-100 space-y-2">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center font-medium text-xs border border-zinc-700">
                  {displayAccount.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h5 className="text-[11px] font-medium leading-tight">{displayAccount}</h5>
                  <p className="text-[9px] text-zinc-500 leading-tight">Creator</p>
                </div>
              </div>
              <FiMoreHorizontal className="text-zinc-500 text-xs" />
            </div>

            {/* Post Content */}
            <p className="text-[11px] text-zinc-300 leading-relaxed line-clamp-3">
              <span className="font-medium text-zinc-100">{displayTitle}</span>
              {" "}
              {displayDescription}
            </p>

            {tags && (
              <p className="text-[10px] text-zinc-500 font-mono">
                {tags.split(",").map(t => `#${t.trim()}`).join(" ")}
              </p>
            )}

            {/* Media */}
            {displayMedia && (
              <div className="rounded-lg overflow-hidden border border-zinc-800 aspect-video bg-black">
                <img
                  src={displayMedia}
                  alt="LinkedIn Media"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Engagement */}
            <div className="pt-2 border-t border-zinc-800 flex items-center justify-around text-zinc-400 text-[10px]">
              <div className="flex items-center gap-1 hover:text-zinc-200 cursor-pointer py-0.5">
                <FiThumbsUp className="text-xs" />
                <span>Like</span>
              </div>
              <div className="flex items-center gap-1 hover:text-zinc-200 cursor-pointer py-0.5">
                <FiMessageCircle className="text-xs" />
                <span>Comment</span>
              </div>
              <div className="flex items-center gap-1 hover:text-zinc-200 cursor-pointer py-0.5">
                <FiRepeat className="text-xs" />
                <span>Repost</span>
              </div>
              <div className="flex items-center gap-1 hover:text-zinc-200 cursor-pointer py-0.5">
                <FiSend className="text-xs" />
                <span>Send</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
