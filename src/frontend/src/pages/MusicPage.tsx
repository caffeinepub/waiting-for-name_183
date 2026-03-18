import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  ChevronDown,
  ChevronUp,
  Crown,
  ExternalLink,
  Music,
  Pause,
  Play,
  Plus,
  Radio,
  SkipBack,
  SkipForward,
  Star,
  Trash2,
  Upload,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string; // "3:42"
  audioUrl: string; // data-url or external url
  coverUrl: string; // data-url or external url
  genre: string;
  releaseYear: string;
}

interface Album {
  id: string;
  title: string;
  artist: string;
  year: string;
  coverUrl: string;
  trackIds: string[];
  description: string;
}

interface StreamingLink {
  platform: string;
  url: string;
  icon: string;
  color: string;
}

interface ArtistSubmission {
  id: string;
  name: string;
  email: string;
  genre: string;
  bio: string;
  links: string;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
}

const STORAGE_KEYS = {
  tracks: "megatrx_music_tracks",
  albums: "megatrx_music_albums",
  streaming: "megatrx_music_streaming",
  submissions: "megatrx_music_submissions",
};

const DEFAULT_STREAMING: StreamingLink[] = [
  { platform: "Spotify", url: "", icon: "🎵", color: "#1DB954" },
  { platform: "Apple Music", url: "", icon: "🎶", color: "#FA2D48" },
  { platform: "SoundCloud", url: "", icon: "☁️", color: "#FF5500" },
  { platform: "YouTube Music", url: "", icon: "▶️", color: "#FF0000" },
  { platform: "Tidal", url: "", icon: "🌊", color: "#00FFFF" },
  { platform: "Amazon Music", url: "", icon: "📦", color: "#00A8E1" },
  { platform: "Deezer", url: "", icon: "🎧", color: "#EF5466" },
  { platform: "Bandcamp", url: "", icon: "🎸", color: "#1DA0C3" },
];

const DEMO_TRACKS: Track[] = [
  {
    id: "demo-1",
    title: "MEGATRX Theme",
    artist: "MEGATRX",
    album: "MEGATRX Originals",
    duration: "3:42",
    audioUrl: "",
    coverUrl:
      "/assets/uploads/Rebellious-Lettermark-for-Music-Brand-MEGATRAX-3-1.PNG",
    genre: "Hip Hop",
    releaseYear: "2024",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function MusicPage() {
  const isAdmin = sessionStorage.getItem("megatrx_admin") === "true";

  const [tracks, setTracks] = useState<Track[]>(() =>
    load(STORAGE_KEYS.tracks, DEMO_TRACKS),
  );
  const [albums, setAlbums] = useState<Album[]>(() =>
    load(STORAGE_KEYS.albums, []),
  );
  const [streaming, setStreaming] = useState<StreamingLink[]>(() =>
    load(STORAGE_KEYS.streaming, DEFAULT_STREAMING),
  );
  const [submissions, setSubmissions] = useState<ArtistSubmission[]>(() =>
    load(STORAGE_KEYS.submissions, []),
  );

  // Player state
  const [currentTrackIdx, setCurrentTrackIdx] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // UI state
  const [activeTab, setActiveTab] = useState<
    "tracks" | "albums" | "artists" | "admin"
  >("tracks");
  const [showAddTrack, setShowAddTrack] = useState(false);
  const [showAddAlbum, setShowAddAlbum] = useState(false);
  const [showStreamingEdit, setShowStreamingEdit] = useState(false);
  const [expandedAlbum, setExpandedAlbum] = useState<string | null>(null);

  // Forms
  const [trackForm, setTrackForm] = useState({
    title: "",
    artist: "MEGATRX",
    album: "",
    genre: "Hip Hop",
    releaseYear: new Date().getFullYear().toString(),
    duration: "",
    audioUrl: "",
    coverUrl: "",
  });
  const [albumForm, setAlbumForm] = useState({
    title: "",
    artist: "MEGATRX",
    year: new Date().getFullYear().toString(),
    coverUrl: "",
    description: "",
    trackIds: [] as string[],
  });
  const [artistForm, setArtistForm] = useState({
    name: "",
    email: "",
    genre: "",
    bio: "",
    links: "",
  });
  const [streamingEdit, setStreamingEdit] = useState<StreamingLink[]>([]);

  // Persist
  useEffect(() => save(STORAGE_KEYS.tracks, tracks), [tracks]);
  useEffect(() => save(STORAGE_KEYS.albums, albums), [albums]);
  useEffect(() => save(STORAGE_KEYS.streaming, streaming), [streaming]);
  useEffect(() => save(STORAGE_KEYS.submissions, submissions), [submissions]);

  // Audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setCurrentTime(audio.currentTime);
    const onDuration = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      if (currentTrackIdx !== null && currentTrackIdx < tracks.length - 1) {
        setCurrentTrackIdx(currentTrackIdx + 1);
      } else {
        setIsPlaying(false);
      }
    };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onDuration);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onDuration);
      audio.removeEventListener("ended", onEnded);
    };
  }, [currentTrackIdx, tracks.length]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional - only re-run on track change
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || currentTrackIdx === null) return;
    const track = tracks[currentTrackIdx];
    if (!track?.audioUrl) return;
    audio.src = track.audioUrl;
    audio.volume = isMuted ? 0 : volume;
    if (isPlaying) audio.play().catch(() => {});
  }, [currentTrackIdx]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) audio.play().catch(() => {});
    else audio.pause();
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const playTrack = (idx: number) => {
    if (currentTrackIdx === idx) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrackIdx(idx);
      setIsPlaying(true);
    }
  };

  const handleSeek = (val: number[]) => {
    if (audioRef.current) audioRef.current.currentTime = val[0];
    setCurrentTime(val[0]);
  };

  const uploadFile = (file: File, cb: (url: string) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => cb(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const addTrack = () => {
    if (!trackForm.title) return;
    const newTrack: Track = {
      id: `track-${Date.now()}`,
      ...trackForm,
    };
    setTracks([...tracks, newTrack]);
    setTrackForm({
      title: "",
      artist: "MEGATRX",
      album: "",
      genre: "Hip Hop",
      releaseYear: new Date().getFullYear().toString(),
      duration: "",
      audioUrl: "",
      coverUrl: "",
    });
    setShowAddTrack(false);
  };

  const deleteTrack = (id: string) => {
    setTracks(tracks.filter((t) => t.id !== id));
  };

  const addAlbum = () => {
    if (!albumForm.title) return;
    const newAlbum: Album = { id: `album-${Date.now()}`, ...albumForm };
    setAlbums([...albums, newAlbum]);
    setAlbumForm({
      title: "",
      artist: "MEGATRX",
      year: new Date().getFullYear().toString(),
      coverUrl: "",
      description: "",
      trackIds: [],
    });
    setShowAddAlbum(false);
  };

  const deleteAlbum = (id: string) =>
    setAlbums(albums.filter((a) => a.id !== id));

  const submitArtist = () => {
    if (!artistForm.name || !artistForm.email) return;
    const sub: ArtistSubmission = {
      id: `sub-${Date.now()}`,
      ...artistForm,
      submittedAt: new Date().toISOString(),
      status: "pending",
    };
    setSubmissions([...submissions, sub]);
    setArtistForm({ name: "", email: "", genre: "", bio: "", links: "" });
    alert(
      "Your submission has been received! MEGATRX will review and contact you.",
    );
  };

  const saveStreaming = () => {
    setStreaming(streamingEdit);
    setShowStreamingEdit(false);
  };

  const activeLinks = streaming.filter((s) => s.url);
  const currentTrack =
    currentTrackIdx !== null ? tracks[currentTrackIdx] : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* biome-ignore lint/a11y/useMediaCaption: background audio player */}
      <audio ref={audioRef} />

      {/* Hero */}
      <section className="relative overflow-hidden py-16 sm:py-24 bg-gradient-to-b from-primary/10 to-background border-b border-border">
        <div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(45deg,currentColor_0px,currentColor_1px,transparent_1px,transparent_10px)]" />
        <div className="container mx-auto px-4 sm:px-6 relative">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <Badge className="mb-4 bg-primary/20 text-primary border-primary/40 font-mono text-xs uppercase tracking-widest">
                Record Label
              </Badge>
              <h1 className="text-4xl sm:text-6xl font-bold tracking-tighter mb-4">
                MEGA<span className="text-primary">TRX</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-xl">
                Original music, curated sounds, and artist collaborations.
                Stream, discover, and support independent artists under the
                MEGATRX label.
              </p>
              {activeLinks.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {activeLinks.map((link) => (
                    <a
                      key={link.platform}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border text-sm font-medium hover:border-primary/60 hover:text-primary transition-all"
                      data-ocid={`music.streaming_${link.platform.toLowerCase().replace(/ /g, "_")}.link`}
                    >
                      <span>{link.icon}</span>
                      {link.platform}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ))}
                </div>
              )}
              {activeLinks.length === 0 && isAdmin && (
                <p className="mt-4 text-sm text-muted-foreground italic">
                  Add your streaming links in the Admin tab below.
                </p>
              )}
            </div>
            <div className="w-40 h-40 sm:w-56 sm:h-56 rounded-2xl overflow-hidden border border-primary/30 shadow-[0_0_40px_rgba(var(--primary),0.2)] flex-shrink-0">
              <img
                src="/assets/uploads/Rebellious-Lettermark-for-Music-Brand-MEGATRAX-3-1.PNG"
                alt="MEGATRX"
                className="w-full h-full object-contain bg-black p-4"
                onError={(e) => {
                  e.currentTarget.src =
                    "/assets/uploads/Rebellious-Lettermark-for-Music-Brand-MEGATRAX-4-2.PNG";
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex gap-0 overflow-x-auto">
            {(["tracks", "albums", "artists"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-4 text-sm font-medium uppercase tracking-wider transition-colors border-b-2 whitespace-nowrap ${
                  activeTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
                data-ocid={`music.${tab}.tab`}
              >
                {tab}
              </button>
            ))}
            {isAdmin && (
              <button
                type="button"
                onClick={() => setActiveTab("admin")}
                className={`px-5 py-4 text-sm font-medium uppercase tracking-wider transition-colors border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === "admin"
                    ? "border-amber-400 text-amber-400"
                    : "border-transparent text-amber-400/60 hover:text-amber-400"
                }`}
                data-ocid="music.admin.tab"
              >
                <Crown className="w-3.5 h-3.5" />
                Admin
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8">
        {/* ── Tracks Tab ────────────────────────────────────────────────────── */}
        {activeTab === "tracks" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold tracking-tighter">
                All Tracks
              </h2>
              {isAdmin && (
                <Button
                  size="sm"
                  onClick={() => setShowAddTrack(true)}
                  data-ocid="music.add_track.button"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Track
                </Button>
              )}
            </div>

            {tracks.length === 0 && (
              <div
                className="text-center py-20 text-muted-foreground"
                data-ocid="music.tracks.empty_state"
              >
                <Music className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>
                  No tracks yet.{" "}
                  {isAdmin ? "Add your first track above." : "Check back soon."}
                </p>
              </div>
            )}

            <div className="space-y-2">
              {tracks.map((track, idx) => (
                <div
                  key={track.id}
                  className={`flex items-center gap-4 p-3 sm:p-4 rounded-lg border transition-all group ${
                    currentTrackIdx === idx
                      ? "border-primary/50 bg-primary/5"
                      : "border-border hover:border-primary/30 hover:bg-muted/30"
                  }`}
                  onClick={() => (track.audioUrl ? playTrack(idx) : undefined)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (track.audioUrl) playTrack(idx);
                    }
                  }}
                  tabIndex={track.audioUrl ? 0 : undefined}
                  data-ocid={`music.tracks.item.${idx + 1}`}
                >
                  {/* Cover */}
                  <div className="w-12 h-12 rounded flex-shrink-0 overflow-hidden bg-muted relative">
                    {track.coverUrl ? (
                      <img
                        src={track.coverUrl}
                        alt={track.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                    {/* Play overlay */}
                    {track.audioUrl && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                        {currentTrackIdx === idx && isPlaying ? (
                          <Pause className="w-5 h-5 text-white" />
                        ) : (
                          <Play className="w-5 h-5 text-white" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-medium truncate ${
                        currentTrackIdx === idx ? "text-primary" : ""
                      }`}
                    >
                      {track.title}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {track.artist}
                      {track.album ? ` · ${track.album}` : ""}
                    </p>
                  </div>

                  {/* Genre + year */}
                  <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground">
                    {track.genre && (
                      <Badge variant="outline" className="text-xs">
                        {track.genre}
                      </Badge>
                    )}
                    {track.releaseYear && <span>{track.releaseYear}</span>}
                    {track.duration && <span>{track.duration}</span>}
                    {!track.audioUrl && (
                      <span className="text-amber-400 text-xs italic">
                        No audio
                      </span>
                    )}
                  </div>

                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive w-8 h-8 flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTrack(track.id);
                      }}
                      data-ocid={`music.tracks.delete_button.${idx + 1}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Albums Tab ────────────────────────────────────────────────────── */}
        {activeTab === "albums" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold tracking-tighter">Albums</h2>
              {isAdmin && (
                <Button
                  size="sm"
                  onClick={() => setShowAddAlbum(true)}
                  data-ocid="music.add_album.button"
                >
                  <Plus className="w-4 h-4 mr-1" /> Create Album
                </Button>
              )}
            </div>

            {albums.length === 0 && (
              <div
                className="text-center py-20 text-muted-foreground"
                data-ocid="music.albums.empty_state"
              >
                <Radio className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>
                  No albums yet.{" "}
                  {isAdmin
                    ? "Create your first album above."
                    : "Check back soon."}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {albums.map((album, idx) => {
                const albumTracks = tracks.filter((t) =>
                  album.trackIds.includes(t.id),
                );
                const isExpanded = expandedAlbum === album.id;
                return (
                  <div
                    key={album.id}
                    className="border border-border rounded-xl overflow-hidden group"
                    data-ocid={`music.albums.item.${idx + 1}`}
                  >
                    {/* Cover */}
                    <div className="aspect-square bg-muted relative">
                      {album.coverUrl ? (
                        <img
                          src={album.coverUrl}
                          alt={album.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Music className="w-16 h-16 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    {/* Info */}
                    <div className="p-4">
                      <h3 className="font-bold text-lg">{album.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {album.artist} · {album.year}
                      </p>
                      {album.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {album.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-muted-foreground">
                          {albumTracks.length} tracks
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedAlbum(isExpanded ? null : album.id)
                          }
                          className="text-xs text-primary flex items-center gap-1 hover:underline"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="w-3 h-3" /> Hide
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-3 h-3" /> Tracks
                            </>
                          )}
                        </button>
                      </div>
                      {isExpanded && (
                        <div className="mt-3 space-y-1 border-t border-border pt-3">
                          {albumTracks.length === 0 && (
                            <p className="text-xs text-muted-foreground italic">
                              No tracks in this album yet.
                            </p>
                          )}
                          {albumTracks.map((t, ti) => (
                            <div
                              key={t.id}
                              className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary py-1"
                              onClick={() =>
                                t.audioUrl && playTrack(tracks.indexOf(t))
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && t.audioUrl)
                                  playTrack(tracks.indexOf(t));
                              }}
                              tabIndex={t.audioUrl ? 0 : undefined}
                            >
                              <span className="text-xs text-muted-foreground w-4">
                                {ti + 1}
                              </span>
                              <span className="flex-1 truncate">{t.title}</span>
                              {t.duration && (
                                <span className="text-xs text-muted-foreground">
                                  {t.duration}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 text-destructive hover:text-destructive w-full text-xs"
                          onClick={() => deleteAlbum(album.id)}
                          data-ocid={`music.albums.delete_button.${idx + 1}`}
                        >
                          <Trash2 className="w-3 h-3 mr-1" /> Delete Album
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Artists Tab ──────────────────────────────────────────────────── */}
        {activeTab === "artists" && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <Star className="w-10 h-10 text-primary mx-auto mb-3" />
              <h2 className="text-3xl font-bold tracking-tighter">
                Artist Collaboration
              </h2>
              <p className="text-muted-foreground mt-2">
                Want to be featured on the MEGATRX label? Submit your info and
                we'll review your music. Artists pay a flat placement fee to be
                featured.
              </p>
            </div>

            <div className="border border-border rounded-xl p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="block text-sm font-medium mb-1.5">
                    Artist Name *
                  </p>
                  <Input
                    placeholder="Your name or artist name"
                    value={artistForm.name}
                    onChange={(e) =>
                      setArtistForm({ ...artistForm, name: e.target.value })
                    }
                    data-ocid="music.artist_name.input"
                  />
                </div>
                <div>
                  <p className="block text-sm font-medium mb-1.5">Email *</p>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={artistForm.email}
                    onChange={(e) =>
                      setArtistForm({ ...artistForm, email: e.target.value })
                    }
                    data-ocid="music.artist_email.input"
                  />
                </div>
              </div>
              <div>
                <p className="block text-sm font-medium mb-1.5">Genre</p>
                <Input
                  placeholder="Hip Hop, R&B, Electronic..."
                  value={artistForm.genre}
                  onChange={(e) =>
                    setArtistForm({ ...artistForm, genre: e.target.value })
                  }
                  data-ocid="music.artist_genre.input"
                />
              </div>
              <div>
                <p className="block text-sm font-medium mb-1.5">Bio</p>
                <textarea
                  className="w-full min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  placeholder="Tell us about yourself and your music..."
                  value={artistForm.bio}
                  onChange={(e) =>
                    setArtistForm({ ...artistForm, bio: e.target.value })
                  }
                  data-ocid="music.artist_bio.textarea"
                />
              </div>
              <div>
                <p className="block text-sm font-medium mb-1.5">
                  Music Links (SoundCloud, Spotify, etc.)
                </p>
                <Input
                  placeholder="https://soundcloud.com/yourname"
                  value={artistForm.links}
                  onChange={(e) =>
                    setArtistForm({ ...artistForm, links: e.target.value })
                  }
                  data-ocid="music.artist_links.input"
                />
              </div>
              <Button
                className="w-full"
                onClick={submitArtist}
                data-ocid="music.artist_submit.button"
              >
                Submit for Review
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Placement fee applies upon approval. We'll contact you via email
                with details.
              </p>
            </div>
          </div>
        )}

        {/* ── Admin Tab ────────────────────────────────────────────────────── */}
        {activeTab === "admin" && isAdmin && (
          <div className="space-y-8">
            <div className="flex items-center gap-3 mb-4">
              <Crown className="w-6 h-6 text-amber-400" />
              <h2 className="text-2xl font-bold tracking-tighter">
                Music Admin
              </h2>
              <Badge className="bg-amber-400/20 text-amber-400 border-amber-400/40 text-xs">
                Admin Only
              </Badge>
            </div>

            {/* Streaming Links */}
            <div className="border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Streaming Platform Links</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setStreamingEdit([...streaming]);
                    setShowStreamingEdit(true);
                  }}
                  data-ocid="music.streaming_edit.button"
                >
                  Edit Links
                </Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {streaming.map((link) => (
                  <div
                    key={link.platform}
                    className={`p-3 rounded-lg border text-center text-sm ${
                      link.url
                        ? "border-primary/30 bg-primary/5"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    <div className="text-2xl mb-1">{link.icon}</div>
                    <div className="font-medium text-xs">{link.platform}</div>
                    <div className="text-xs mt-0.5">
                      {link.url ? "✓ Connected" : "Not set"}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Artist Submissions */}
            <div className="border border-border rounded-xl p-6">
              <h3 className="font-bold text-lg mb-4">
                Artist Submissions ({submissions.length})
              </h3>
              {submissions.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No submissions yet.
                </p>
              )}
              <div className="space-y-3">
                {submissions.map((sub, idx) => (
                  <div
                    key={sub.id}
                    className="border border-border rounded-lg p-4"
                    data-ocid={`music.submissions.item.${idx + 1}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">
                          {sub.name} — {sub.genre}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {sub.email}
                        </p>
                        {sub.bio && <p className="text-sm mt-1">{sub.bio}</p>}
                        {sub.links && (
                          <a
                            href={sub.links}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline"
                          >
                            {sub.links}
                          </a>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            sub.status === "approved"
                              ? "text-green-400 border-green-400/40"
                              : sub.status === "rejected"
                                ? "text-red-400 border-red-400/40"
                                : "text-amber-400 border-amber-400/40"
                          }`}
                        >
                          {sub.status}
                        </Badge>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7"
                            onClick={() =>
                              setSubmissions(
                                submissions.map((s) =>
                                  s.id === sub.id
                                    ? { ...s, status: "approved" }
                                    : s,
                                ),
                              )
                            }
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs h-7 text-destructive"
                            onClick={() =>
                              setSubmissions(
                                submissions.filter((s) => s.id !== sub.id),
                              )
                            }
                            data-ocid={`music.submissions.delete_button.${idx + 1}`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Player Bar ───────────────────────────────────────────────────────── */}
      {currentTrack && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t border-primary/30 shadow-[0_-4px_30px_rgba(0,0,0,0.5)]">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-3 sm:gap-6 py-3">
              {/* Track info */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded flex-shrink-0 overflow-hidden bg-muted">
                  {currentTrack.coverUrl ? (
                    <img
                      src={currentTrack.coverUrl}
                      alt={currentTrack.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">
                    {currentTrack.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {currentTrack.artist}
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <div className="flex items-center gap-2 sm:gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      currentTrackIdx !== null &&
                      currentTrackIdx > 0 &&
                      setCurrentTrackIdx(currentTrackIdx - 1)
                    }
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    data-ocid="music.player_prev.button"
                  >
                    <SkipBack className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/80 transition-colors"
                    data-ocid="music.player_play.button"
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4 ml-0.5" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      currentTrackIdx !== null &&
                      currentTrackIdx < tracks.length - 1 &&
                      setCurrentTrackIdx(currentTrackIdx + 1)
                    }
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    data-ocid="music.player_next.button"
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>
                </div>
                {/* Progress */}
                <div className="hidden sm:flex items-center gap-2 w-64">
                  <span className="text-xs text-muted-foreground w-8 text-right">
                    {formatTime(currentTime)}
                  </span>
                  <Slider
                    value={[currentTime]}
                    max={duration || 100}
                    step={1}
                    onValueChange={handleSeek}
                    className="flex-1"
                  />
                  <span className="text-xs text-muted-foreground w-8">
                    {formatTime(duration)}
                  </span>
                </div>
              </div>

              {/* Volume */}
              <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-muted-foreground hover:text-foreground"
                  data-ocid="music.player_mute.toggle"
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
                <Slider
                  value={[isMuted ? 0 : volume * 100]}
                  max={100}
                  step={1}
                  onValueChange={(v) => {
                    setVolume(v[0] / 100);
                    setIsMuted(false);
                  }}
                  className="w-20"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Track Dialog ─────────────────────────────────────────────────── */}
      <Dialog open={showAddTrack} onOpenChange={setShowAddTrack}>
        <DialogContent
          className="max-w-lg max-h-[90vh] overflow-y-auto"
          data-ocid="music.add_track.dialog"
        >
          <DialogHeader>
            <DialogTitle>Add Track</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <p className="block text-sm font-medium mb-1">Title *</p>
              <Input
                value={trackForm.title}
                onChange={(e) =>
                  setTrackForm({ ...trackForm, title: e.target.value })
                }
                placeholder="Track title"
                data-ocid="music.track_title.input"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="block text-sm font-medium mb-1">Artist</p>
                <Input
                  value={trackForm.artist}
                  onChange={(e) =>
                    setTrackForm({ ...trackForm, artist: e.target.value })
                  }
                  data-ocid="music.track_artist.input"
                />
              </div>
              <div>
                <p className="block text-sm font-medium mb-1">Album</p>
                <Input
                  value={trackForm.album}
                  onChange={(e) =>
                    setTrackForm({ ...trackForm, album: e.target.value })
                  }
                  data-ocid="music.track_album.input"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="block text-sm font-medium mb-1">Genre</p>
                <Input
                  value={trackForm.genre}
                  onChange={(e) =>
                    setTrackForm({ ...trackForm, genre: e.target.value })
                  }
                  data-ocid="music.track_genre.input"
                />
              </div>
              <div>
                <p className="block text-sm font-medium mb-1">Year</p>
                <Input
                  value={trackForm.releaseYear}
                  onChange={(e) =>
                    setTrackForm({ ...trackForm, releaseYear: e.target.value })
                  }
                  data-ocid="music.track_year.input"
                />
              </div>
              <div>
                <p className="block text-sm font-medium mb-1">Duration</p>
                <Input
                  placeholder="3:42"
                  value={trackForm.duration}
                  onChange={(e) =>
                    setTrackForm({ ...trackForm, duration: e.target.value })
                  }
                  data-ocid="music.track_duration.input"
                />
              </div>
            </div>
            <div>
              <p className="block text-sm font-medium mb-1">Audio File</p>
              <div className="flex gap-2">
                <Input
                  placeholder="https://... or upload below"
                  value={
                    trackForm.audioUrl.startsWith("data:")
                      ? "[Uploaded file]"
                      : trackForm.audioUrl
                  }
                  onChange={(e) =>
                    setTrackForm({ ...trackForm, audioUrl: e.target.value })
                  }
                />
                <label className="cursor-pointer flex-shrink-0">
                  <input
                    type="file"
                    accept="audio/*,.mp4,.m4a,.aac,.ogg"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f)
                        uploadFile(f, (url) =>
                          setTrackForm((prev) => ({ ...prev, audioUrl: url })),
                        );
                    }}
                  />
                  <Button type="button" variant="outline" size="icon" asChild>
                    <span>
                      <Upload className="w-4 h-4" />
                    </span>
                  </Button>
                </label>
              </div>
            </div>
            <div>
              <p className="block text-sm font-medium mb-1">Cover Image</p>
              <div className="flex gap-2">
                <Input
                  placeholder="https://..."
                  value={
                    trackForm.coverUrl.startsWith("data:")
                      ? "[Uploaded image]"
                      : trackForm.coverUrl
                  }
                  onChange={(e) =>
                    setTrackForm({ ...trackForm, coverUrl: e.target.value })
                  }
                />
                <label className="cursor-pointer flex-shrink-0">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f)
                        uploadFile(f, (url) =>
                          setTrackForm((prev) => ({ ...prev, coverUrl: url })),
                        );
                    }}
                  />
                  <Button type="button" variant="outline" size="icon" asChild>
                    <span>
                      <Upload className="w-4 h-4" />
                    </span>
                  </Button>
                </label>
              </div>
            </div>
            <Button
              className="w-full"
              onClick={addTrack}
              data-ocid="music.track_save.button"
            >
              Add Track
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Add Album Dialog ─────────────────────────────────────────────────── */}
      <Dialog open={showAddAlbum} onOpenChange={setShowAddAlbum}>
        <DialogContent
          className="max-w-lg max-h-[90vh] overflow-y-auto"
          data-ocid="music.add_album.dialog"
        >
          <DialogHeader>
            <DialogTitle>Create Album</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <p className="block text-sm font-medium mb-1">Album Title *</p>
              <Input
                value={albumForm.title}
                onChange={(e) =>
                  setAlbumForm({ ...albumForm, title: e.target.value })
                }
                placeholder="Album name"
                data-ocid="music.album_title.input"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="block text-sm font-medium mb-1">Artist</p>
                <Input
                  value={albumForm.artist}
                  onChange={(e) =>
                    setAlbumForm({ ...albumForm, artist: e.target.value })
                  }
                  data-ocid="music.album_artist.input"
                />
              </div>
              <div>
                <p className="block text-sm font-medium mb-1">Year</p>
                <Input
                  value={albumForm.year}
                  onChange={(e) =>
                    setAlbumForm({ ...albumForm, year: e.target.value })
                  }
                  data-ocid="music.album_year.input"
                />
              </div>
            </div>
            <div>
              <p className="block text-sm font-medium mb-1">Description</p>
              <textarea
                className="w-full min-h-[60px] rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="About this album..."
                value={albumForm.description}
                onChange={(e) =>
                  setAlbumForm({ ...albumForm, description: e.target.value })
                }
                data-ocid="music.album_description.textarea"
              />
            </div>
            <div>
              <p className="block text-sm font-medium mb-1">Cover Image</p>
              <div className="flex gap-2">
                <Input
                  placeholder="https://..."
                  value={
                    albumForm.coverUrl.startsWith("data:")
                      ? "[Uploaded image]"
                      : albumForm.coverUrl
                  }
                  onChange={(e) =>
                    setAlbumForm({ ...albumForm, coverUrl: e.target.value })
                  }
                />
                <label className="cursor-pointer flex-shrink-0">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f)
                        uploadFile(f, (url) =>
                          setAlbumForm((prev) => ({ ...prev, coverUrl: url })),
                        );
                    }}
                  />
                  <Button type="button" variant="outline" size="icon" asChild>
                    <span>
                      <Upload className="w-4 h-4" />
                    </span>
                  </Button>
                </label>
              </div>
            </div>
            <div>
              <p className="block text-sm font-medium mb-2">
                Add Tracks to Album
              </p>
              <div className="space-y-1 max-h-40 overflow-y-auto border border-border rounded-lg p-2">
                {tracks.length === 0 && (
                  <p className="text-xs text-muted-foreground p-2">
                    No tracks yet. Add tracks first.
                  </p>
                )}
                {tracks.map((t) => (
                  <label
                    key={t.id}
                    className="flex items-center gap-2 py-1 cursor-pointer hover:text-primary"
                  >
                    <input
                      type="checkbox"
                      checked={albumForm.trackIds.includes(t.id)}
                      onChange={(e) => {
                        setAlbumForm((prev) => ({
                          ...prev,
                          trackIds: e.target.checked
                            ? [...prev.trackIds, t.id]
                            : prev.trackIds.filter((id) => id !== t.id),
                        }));
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">
                      {t.title} — {t.artist}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <Button
              className="w-full"
              onClick={addAlbum}
              data-ocid="music.album_save.button"
            >
              Create Album
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Streaming Edit Dialog ─────────────────────────────────────────────── */}
      <Dialog open={showStreamingEdit} onOpenChange={setShowStreamingEdit}>
        <DialogContent
          className="max-w-lg max-h-[90vh] overflow-y-auto"
          data-ocid="music.streaming_edit.dialog"
        >
          <DialogHeader>
            <DialogTitle>Edit Streaming Links</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {streamingEdit.map((link, i) => (
              <div key={link.platform} className="flex items-center gap-3">
                <span className="text-xl w-8 text-center flex-shrink-0">
                  {link.icon}
                </span>
                <span className="text-sm font-medium w-28 flex-shrink-0">
                  {link.platform}
                </span>
                <Input
                  placeholder="https://..."
                  value={link.url}
                  onChange={(e) =>
                    setStreamingEdit(
                      streamingEdit.map((s, si) =>
                        si === i ? { ...s, url: e.target.value } : s,
                      ),
                    )
                  }
                />
              </div>
            ))}
            <Button
              className="w-full"
              onClick={saveStreaming}
              data-ocid="music.streaming_save.button"
            >
              Save Links
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
