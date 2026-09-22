"use client";

import { useState, useRef, useEffect } from "react";
import { 
  FaYoutube, 
  FaInstagram, 
  FaFacebook,
  FaLinkedin, 
  FaPinterest, 
  FaChevronDown, 
  FaChevronUp,
  FaCheck,
  FaMagic
} from "react-icons/fa";
import { FaXTwitter, FaThreads } from "react-icons/fa6";
import { SiTiktok } from "react-icons/si";
import { 
  FiX, 
  FiCalendar, 
  FiClock, 
  FiUploadCloud, 
  FiTrash2, 
  FiSend, 
  FiLink,
  FiCheckCircle,
  FiInfo
} from "react-icons/fi";
import LiveDevicePreview from "./LiveDevicePreview";
import AiPostWriter from "./AiPostWriter";

const PLATFORMS = [
  { key: "youtube", name: "YouTube", Icon: FaYoutube, color: "text-red-500", activeStyle: "bg-red-500/15 border-red-500/60 text-white shadow-sm shadow-red-500/20", limit: 5000 },
  { key: "tiktok", name: "TikTok", Icon: SiTiktok, color: "text-cyan-400", activeStyle: "bg-cyan-500/15 border-cyan-400/60 text-white shadow-sm shadow-cyan-500/20", limit: 2200 },
  { key: "instagram", name: "Instagram", Icon: FaInstagram, color: "text-pink-500", activeStyle: "bg-pink-500/15 border-pink-500/60 text-white shadow-sm shadow-pink-500/20", limit: 2200 },
  { key: "x_twitter", name: "X (Twitter)", Icon: FaXTwitter, color: "text-sky-400", activeStyle: "bg-sky-500/15 border-sky-400/60 text-white shadow-sm shadow-sky-500/20", limit: 280 },
  { key: "facebook", name: "Facebook", Icon: FaFacebook, color: "text-blue-600", activeStyle: "bg-blue-600/15 border-blue-600/60 text-white shadow-sm shadow-blue-600/20", limit: 63206 },
  { key: "linkedin", name: "LinkedIn", Icon: FaLinkedin, color: "text-blue-500", activeStyle: "bg-blue-500/15 border-blue-500/60 text-white shadow-sm shadow-blue-500/20", limit: 3000 },
  { key: "threads", name: "Threads", Icon: FaThreads, color: "text-purple-400", activeStyle: "bg-purple-500/15 border-purple-400/60 text-white shadow-sm shadow-purple-500/20", limit: 500 },
  { key: "pinterest", name: "Pinterest", Icon: FaPinterest, color: "text-rose-500", activeStyle: "bg-rose-500/15 border-rose-500/60 text-white shadow-sm shadow-rose-500/20", limit: 500 },
];

const YOUTUBE_CATEGORIES = [
  { label: "People & Blogs", value: "22" },
  { label: "Film & Animation", value: "1" },
  { label: "Autos & Vehicles", value: "2" },
  { label: "Music", value: "10" },
  { label: "Gaming", value: "20" },
  { label: "Comedy", value: "23" },
  { label: "Entertainment", value: "24" },
  { label: "Education", value: "27" },
  { label: "Science & Technology", value: "28" },
];

const POPULAR_HASHTAGS = ["#trending", "#ai", "#tech", "#innovation", "#growth", "#viral", "#creators"];

export default function PostComposerModal({
  isOpen,
  onClose,
  initialDate = null,
  initialPost = null,
  initialOpenAiWriter = false,
  onPostSaved,
}) {
  const [selectedPlatform, setSelectedPlatform] = useState("youtube");
  const [accountName, setAccountName] = useState("Creator Studio");
  const [accountId, setAccountId] = useState("101");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [privacy, setPrivacy] = useState("public");

  // YouTube options
  const [categoryId, setCategoryId] = useState("22");
  const [madeForKids, setMadeForKids] = useState(false);

  // TikTok options
  const [disableComment, setDisableComment] = useState(false);
  const [disableDuet, setDisableDuet] = useState(false);
  const [disableStitch, setDisableStitch] = useState(false);

  // Instagram / Facebook / Threads options
  const [placement, setPlacement] = useState("reels");
  const [shareToFeed, setShareToFeed] = useState(true);

  // Pinterest options
  const [destinationLink, setDestinationLink] = useState("");
  const [boardId, setBoardId] = useState("");

  // X (Twitter) options
  const [replySettings, setReplySettings] = useState("everyone");

  // Scheduling
  const [isScheduled, setIsScheduled] = useState(true);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("12:00");

  // UI state
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [aiWriterOpen, setAiWriterOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialOpenAiWriter) {
      setAiWriterOpen(true);
    }
  }, [initialOpenAiWriter, isOpen]);

  useEffect(() => {
    if (initialPost) {
      setSelectedPlatform(initialPost.platform || "youtube");
      setTitle(initialPost.title || "");
      setDescription(initialPost.description || "");
      setTags(initialPost.tags || "");
      setMediaUrl(initialPost.mediaUrl || "");
      setPrivacy(initialPost.privacy || "public");
      setAccountName(initialPost.accountName || "Creator Studio");
      if (initialPost.scheduledAt) {
        const d = new Date(initialPost.scheduledAt);
        setScheduledDate(d.toISOString().split("T")[0]);
        setScheduledTime(d.toTimeString().slice(0, 5));
        setIsScheduled(true);
      }
    } else if (initialDate) {
      const d = new Date(initialDate);
      setScheduledDate(d.toISOString().split("T")[0]);
      setScheduledTime("14:00");
      setIsScheduled(true);
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setScheduledDate(tomorrow.toISOString().split("T")[0]);
      setScheduledTime("12:00");
      setIsScheduled(true);
    }
  }, [initialDate, initialPost, isOpen]);

  const handleApplyAiContent = ({ title: newTitle, description: newDescription, tags: newTags }) => {
    if (newTitle) setTitle(newTitle);
    if (newDescription) setDescription(newDescription);
    if (newTags) setTags(newTags);
    setAiWriterOpen(false);
  };


  if (!isOpen) return null;

  const currentPlatformInfo = PLATFORMS.find(p => p.key === selectedPlatform) || PLATFORMS[0];
  const charLimit = currentPlatformInfo.limit;
  const currentChars = (description || "").length;

  const handleMediaUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        // Fallback to object URL or demo preview if upload API fails
        const localUrl = URL.createObjectURL(file);
        setMediaUrl(localUrl);
      } else {
        const data = await res.json();
        setMediaUrl(data.url || URL.createObjectURL(file));
      }
    } catch (err) {
      console.warn("Upload fallback used:", err);
      setMediaUrl(URL.createObjectURL(file));
    } finally {
      setUploading(false);
    }
  };

  const addHashtag = (tag) => {
    if (!description.includes(tag)) {
      setDescription(prev => prev ? `${prev} ${tag}` : tag);
    }
  };

  const handleSubmit = async (statusOverride = null) => {
    if (!mediaUrl) {
      setErrorMsg("Please upload or provide a media URL for your post.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      let combinedScheduledAt = null;
      if (isScheduled && scheduledDate && scheduledTime) {
        combinedScheduledAt = new Date(`${scheduledDate}T${scheduledTime}:00`).toISOString();
      }

      const payload = {
        platform: selectedPlatform,
        accountId: parseInt(accountId) || 101,
        accountName,
        title,
        description,
        tags,
        mediaUrl,
        privacy,
        scheduledAt: statusOverride === "draft" ? null : combinedScheduledAt,
        disableComment,
        disableDuet,
        disableStitch,
        categoryId,
        madeForKids,
        placement,
        shareToFeed,
        destinationLink,
        boardId,
        replySettings,
      };

      const url = initialPost?.id ? `/api/posts/${initialPost.id}` : "/api/posts";
      const method = initialPost?.id ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to schedule post.");
      }

      const savedPost = await res.json();
      if (onPostSaved) onPostSaved(savedPost);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm overflow-hidden">
      <div 
        className="relative w-full max-w-5xl bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-blue-600/30">
              P
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white tracking-wide uppercase">
                {initialPost ? "EDIT SCHEDULED POST" : "COMPOSE & SCHEDULE POST"}
              </h3>
              <p className="text-xs text-zinc-400">
                Multi-channel scheduling with real-time feed preview
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAiWriterOpen(!aiWriterOpen)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border ${
                aiWriterOpen
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-violet-400/40 shadow-md shadow-violet-500/30"
                  : "bg-gradient-to-r from-violet-600/15 to-indigo-600/15 text-violet-300 border-violet-500/30 hover:border-violet-500/60 hover:text-white"
              }`}
            >
              <FaMagic className="text-[10px] text-amber-300" />
              <span>Write with AI</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-md hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 flex items-center justify-center transition-colors cursor-pointer"
            >
              <FiX className="text-sm" />
            </button>
          </div>
        </div>

        {/* Modal Main Content - 2 Column Split */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-zinc-800">
          {/* LEFT COLUMN: Composer Form (7 cols) */}
          <div className="lg:col-span-7 p-5 space-y-4 overflow-y-auto overflow-x-hidden max-h-[calc(88vh-110px)]">
            {/* AI Post Writer Assistant (Collapsible) */}
            {aiWriterOpen && (
              <AiPostWriter
                platform={selectedPlatform}
                onApply={handleApplyAiContent}
                onClose={() => setAiWriterOpen(false)}
              />
            )}

            {errorMsg && (
              <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-md text-xs text-red-400 flex items-center gap-2">
                <FiInfo className="text-sm shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* 1. Channel Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-300 tracking-wider uppercase block">
                1. SELECT PUBLISHING CHANNEL
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PLATFORMS.map((plat) => {
                  const Icon = plat.Icon;
                  const isSelected = selectedPlatform === plat.key;
                  return (
                    <button
                      key={plat.key}
                      type="button"
                      onClick={() => setSelectedPlatform(plat.key)}
                      className={`p-1.5 px-2 rounded-md border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? plat.activeStyle
                          : "border-zinc-800/80 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                      }`}
                    >
                      <Icon className={`text-xs ${isSelected ? "text-current" : plat.color}`} />
                      <span className="text-[11px] truncate font-medium">
                        {plat.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Post Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300 tracking-wider uppercase block">
                2. POST TITLE / HEADLINE
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your post a strong, clickable title..."
                className="w-full bg-zinc-900/60 border border-zinc-800 rounded-md px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
              />
            </div>

            {/* 3. Caption & Content */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-zinc-300 tracking-wider uppercase">
                    3. CAPTION & DETAILS
                  </label>
                  {!aiWriterOpen && (
                    <button
                      type="button"
                      onClick={() => setAiWriterOpen(true)}
                      className="text-[11px] text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1 transition-colors cursor-pointer"
                      title="Write post with AI"
                    >
                      <FaMagic className="text-[9px] text-amber-300" />
                      <span>Write with AI</span>
                    </button>
                  )}
                </div>
                <span className={`text-[11px] font-mono ${currentChars > charLimit ? "text-red-400 font-semibold" : "text-zinc-500"}`}>
                  {currentChars} / {charLimit}
                </span>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Write your caption, hook, call to action, and hashtags..."
                className="w-full bg-zinc-900/60 border border-zinc-800 rounded-md p-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors resize-none leading-relaxed"
              />

              {/* Hashtag Quick Chips */}
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                <span className="text-[11px] text-zinc-400 flex items-center gap-1 mr-1 font-medium">
                  <FaMagic className="text-violet-400 text-[10px]" /> Tags:
                </span>
                {POPULAR_HASHTAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => addHashtag(tag)}
                    className="px-2 py-0.5 rounded bg-zinc-900/80 hover:bg-indigo-500/10 border border-zinc-800 hover:border-indigo-500/40 text-[11px] text-zinc-400 hover:text-indigo-300 transition-all cursor-pointer font-mono"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Media Attachment */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-300 tracking-wider uppercase block">
                4. MEDIA ATTACHMENT (VIDEO / IMAGE)
              </label>

              {mediaUrl ? (
                <div className="relative rounded-md overflow-hidden border border-zinc-800 bg-black aspect-video max-h-44 group">
                  <img
                    src={mediaUrl}
                    alt="Media preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setMediaUrl("")}
                      className="px-3 py-1.5 rounded-md bg-red-600/90 hover:bg-red-600 text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                    >
                      <FiTrash2 /> Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border border-dashed border-zinc-800 hover:border-zinc-700 bg-zinc-900/20 hover:bg-zinc-900/40 rounded-md p-4 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-1.5"
                  >
                    <div className="w-8 h-8 rounded-full bg-zinc-800/80 text-zinc-400 flex items-center justify-center">
                      <FiUploadCloud className="text-base" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-zinc-300">
                        {uploading ? "Uploading..." : "Click or drag & drop video/image"}
                      </p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">
                        MP4, MOV, JPG, PNG up to 100MB
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*,image/*"
                      onChange={handleMediaUpload}
                      className="hidden"
                    />
                  </div>

                  <div className="relative">
                    <FiLink className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs" />
                    <input
                      type="url"
                      value={mediaUrl}
                      onChange={(e) => setMediaUrl(e.target.value)}
                      placeholder="Or paste media URL directly (https://...)"
                      className="w-full bg-zinc-900/40 border border-zinc-800 rounded-md pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Platform Specific Settings Accordion */}
            <div className="border border-zinc-800 rounded-md overflow-hidden bg-zinc-900/20">
              <button
                type="button"
                onClick={() => setAdvancedOpen(!advancedOpen)}
                className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-medium text-zinc-300 hover:text-zinc-100 transition-colors cursor-pointer"
              >
                <span>Settings for {currentPlatformInfo.name}</span>
                {advancedOpen ? <FaChevronUp className="text-[10px]" /> : <FaChevronDown className="text-[10px]" />}
              </button>

              {advancedOpen && (
                <div className="p-3.5 pt-2 border-t border-zinc-800 space-y-3">
                  {selectedPlatform === "youtube" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-medium text-zinc-400 block mb-1">
                          Category
                        </label>
                        <select
                          value={categoryId}
                          onChange={(e) => setCategoryId(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700"
                        >
                          {YOUTUBE_CATEGORIES.map((c) => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-zinc-400 block mb-1">
                          Privacy
                        </label>
                        <select
                          value={privacy}
                          onChange={(e) => setPrivacy(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700"
                        >
                          <option value="public">Public</option>
                          <option value="unlisted">Unlisted</option>
                          <option value="private">Private</option>
                        </select>
                      </div>
                      <div className="sm:col-span-2 flex items-center gap-2 pt-1">
                        <input
                          type="checkbox"
                          id="kids"
                          checked={madeForKids}
                          onChange={(e) => setMadeForKids(e.target.checked)}
                          className="rounded border-zinc-700 bg-zinc-900 text-blue-500 focus:ring-0"
                        />
                        <label htmlFor="kids" className="text-xs text-zinc-400">
                          Made for Kids (COPPA compliant)
                        </label>
                      </div>
                    </div>
                  )}

                  {selectedPlatform === "tiktok" && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-zinc-300">
                        <span>Disable Comments</span>
                        <input
                          type="checkbox"
                          checked={disableComment}
                          onChange={(e) => setDisableComment(e.target.checked)}
                          className="rounded border-zinc-700 bg-zinc-900 text-blue-500"
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-zinc-300">
                        <span>Disable Duet</span>
                        <input
                          type="checkbox"
                          checked={disableDuet}
                          onChange={(e) => setDisableDuet(e.target.checked)}
                          className="rounded border-zinc-700 bg-zinc-900 text-blue-500"
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-zinc-300">
                        <span>Disable Stitch</span>
                        <input
                          type="checkbox"
                          checked={disableStitch}
                          onChange={(e) => setDisableStitch(e.target.checked)}
                          className="rounded border-zinc-700 bg-zinc-900 text-blue-500"
                        />
                      </div>
                    </div>
                  )}

                  {selectedPlatform === "instagram" && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] font-medium text-zinc-400 block mb-1">
                          Placement
                        </label>
                        <select
                          value={placement}
                          onChange={(e) => setPlacement(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700"
                        >
                          <option value="reels">Reels</option>
                          <option value="feed">Feed Post</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between text-xs text-zinc-300">
                        <span>Share Reels to Main Feed</span>
                        <input
                          type="checkbox"
                          checked={shareToFeed}
                          onChange={(e) => setShareToFeed(e.target.checked)}
                          className="rounded border-zinc-700 bg-zinc-900 text-pink-500"
                        />
                      </div>
                    </div>
                  )}

                  {selectedPlatform === "facebook" && (
                    <div className="space-y-2">
                      <div>
                        <label className="text-[11px] font-medium text-zinc-400 block mb-1">
                          Placement
                        </label>
                        <select
                          value={placement}
                          onChange={(e) => setPlacement(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700"
                        >
                          <option value="timeline">Timeline Post</option>
                          <option value="reels">Facebook Reels</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {selectedPlatform === "x_twitter" && (
                    <div className="space-y-2">
                      <div>
                        <label className="text-[11px] font-medium text-zinc-400 block mb-1">
                          Who can reply
                        </label>
                        <select
                          value={replySettings}
                          onChange={(e) => setReplySettings(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700"
                        >
                          <option value="everyone">Everyone</option>
                          <option value="following">Accounts you follow</option>
                          <option value="mentionedUsers">Only accounts you mention</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {selectedPlatform === "pinterest" && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] font-medium text-zinc-400 block mb-1">
                          Destination Link
                        </label>
                        <input
                          type="url"
                          value={destinationLink}
                          onChange={(e) => setDestinationLink(e.target.value)}
                          placeholder="https://yourwebsite.com/pin-link"
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-zinc-400 block mb-1">
                          Board ID / Name (Optional)
                        </label>
                        <input
                          type="text"
                          value={boardId}
                          onChange={(e) => setBoardId(e.target.value)}
                          placeholder="Default Board or ID"
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700"
                        />
                      </div>
                    </div>
                  )}

                  {(selectedPlatform === "linkedin" || selectedPlatform === "threads") && (
                    <p className="text-xs text-zinc-400">
                      Standard optimization and formatting will be automatically applied for {currentPlatformInfo.name}.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* 5. Scheduling Controls */}
            <div className="p-3.5 bg-zinc-900/40 border border-zinc-800 rounded-md space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <FiCalendar className="text-zinc-400 text-xs" />
                  <span className="text-xs font-bold text-zinc-300 tracking-wider uppercase">
                    5. SCHEDULE & PUBLISH OPTIONS
                  </span>
                </div>
                <div className="flex items-center bg-zinc-900 p-0.5 rounded-md border border-zinc-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setIsScheduled(false)}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                      !isScheduled ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Post Now
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsScheduled(true)}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                      isScheduled ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Schedule
                  </button>
                </div>
              </div>

              {isScheduled && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs" />
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full bg-zinc-900/60 border border-zinc-800 rounded-md pl-8 pr-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-600"
                    />
                  </div>
                  <div className="relative">
                    <FiClock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs" />
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full bg-zinc-900/60 border border-zinc-800 rounded-md pl-8 pr-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-600"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Real-Time Live Feed Mockup (5 cols) */}
          <div className="lg:col-span-5 p-4 sm:p-5 bg-zinc-950/40 flex flex-col overflow-y-auto overflow-x-hidden max-h-[calc(88vh-110px)]">
            <LiveDevicePreview
              platform={selectedPlatform}
              title={title}
              description={description}
              tags={tags}
              mediaUrl={mediaUrl}
              accountName={accountName}
            />
          </div>
        </div>

        {/* Modal Bottom Bar / Actions */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-800 bg-zinc-950">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-md text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit("draft")}
              className="px-3.5 py-1.5 rounded-md text-xs font-bold text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors cursor-pointer"
            >
              Save as Draft
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit()}
              className="px-4 py-1.5 rounded-md text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all cursor-pointer flex items-center gap-2 shadow-md shadow-blue-600/30 active:scale-95 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <FiSend className="text-xs" />
                  <span>{isScheduled ? "Schedule Post" : "Publish Now"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
