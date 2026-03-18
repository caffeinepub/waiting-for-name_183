import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";
import {
  AlertTriangle,
  ArrowLeft,
  Flag,
  Heart,
  Image as ImageIcon,
  MessageCircle,
  Plus,
  Shield,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Community {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: string;
  memberCount: number;
  postCount: number;
}

interface Post {
  id: string;
  communityId: string;
  authorName: string;
  authorId: string;
  text: string;
  imageBase64?: string;
  likes: string[];
  createdAt: string;
}

interface Comment {
  id: string;
  postId: string;
  authorName: string;
  authorId: string;
  text: string;
  likes: string[];
  createdAt: string;
}

interface Ban {
  userId: string;
  bannedAt: string;
  reason: string;
}

interface Report {
  id: string;
  type: "post" | "comment";
  targetId: string;
  reportedBy: string;
  reason: string;
  createdAt: string;
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const SEED_COMMUNITIES: Community[] = [
  {
    id: "c1",
    name: "MEGATRX Fans",
    description:
      "The official fan hub — share your MEGATRX merch, designs, and more.",
    createdBy: "admin",
    createdAt: new Date().toISOString(),
    memberCount: 142,
    postCount: 38,
  },
  {
    id: "c2",
    name: "Design Talk",
    description: "Discuss graphic design trends, tips, and inspiration.",
    createdBy: "admin",
    createdAt: new Date().toISOString(),
    memberCount: 89,
    postCount: 24,
  },
  {
    id: "c3",
    name: "Marketplace",
    description: "Buy, sell, and trade custom designs and merchandise.",
    createdBy: "admin",
    createdAt: new Date().toISOString(),
    memberCount: 61,
    postCount: 15,
  },
];

// ─── localStorage helpers ─────────────────────────────────────────────────────

function load<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, val: T): void {
  localStorage.setItem(key, JSON.stringify(val));
}

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CommunityPage() {
  const { isLoggedIn, currentUser } = useAuth();
  const { openModal } = useAuthModal();
  const isAdmin =
    typeof window !== "undefined" &&
    localStorage.getItem("megatrx_admin_authenticated") === "true";

  const [communities, setCommunities] = useState<Community[]>(() => {
    const saved = load<Community[]>("community_communities", []);
    if (saved.length === 0) {
      save("community_communities", SEED_COMMUNITIES);
      return SEED_COMMUNITIES;
    }
    return saved;
  });
  const [activeCommunity, setActiveCommunity] = useState<Community | null>(
    null,
  );
  const [showModeration, setShowModeration] = useState(false);

  // Create community dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  function handleCreateCommunity() {
    if (!newName.trim()) return;
    const community: Community = {
      id: uid(),
      name: newName.trim(),
      description: newDesc.trim(),
      createdBy: currentUser?.name ?? "member",
      createdAt: new Date().toISOString(),
      memberCount: 1,
      postCount: 0,
    };
    const updated = [community, ...communities];
    setCommunities(updated);
    save("community_communities", updated);
    setNewName("");
    setNewDesc("");
    setCreateOpen(false);
    toast.success(`Community "${community.name}" created!`);
  }

  if (activeCommunity) {
    return (
      <PostFeed
        community={activeCommunity}
        onBack={() => setActiveCommunity(null)}
        isAdmin={isAdmin}
        isLoggedIn={isLoggedIn}
        currentUser={currentUser}
        openAuthModal={openModal}
        communities={communities}
        setCommunities={(c) => {
          setCommunities(c);
          save("community_communities", c);
        }}
      />
    );
  }

  return (
    <div className="w-full">
      {/* Hero */}
      <section className="py-12 sm:py-16 border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-3 py-1 mb-4">
                <Users className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-mono uppercase tracking-wider text-primary">
                  MEGATRX Community
                </span>
              </div>
              <h1 className="text-4xl sm:text-6xl font-bold tracking-tighter">
                MEGA<span className="text-primary">TRX</span> Community
              </h1>
              <p className="text-muted-foreground font-body mt-2">
                Connect, share, and create with fellow MEGATRX members.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowModeration(!showModeration)}
                  className="gap-2 font-mono text-xs border-amber-400/50 text-amber-400 hover:bg-amber-400/10"
                  data-ocid="community.moderation.toggle"
                >
                  <Shield className="w-4 h-4" />
                  Moderation
                </Button>
              )}
              {isLoggedIn ? (
                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                  <DialogTrigger asChild>
                    <Button
                      className="gap-2 font-mono"
                      data-ocid="community.create.open_modal_button"
                    >
                      <Plus className="w-4 h-4" />
                      Create Community
                    </Button>
                  </DialogTrigger>
                  <DialogContent data-ocid="community.create.dialog">
                    <DialogHeader>
                      <DialogTitle className="font-mono">
                        New Community
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                      <div className="space-y-1.5">
                        <Label className="font-mono text-xs uppercase text-muted-foreground">
                          Name
                        </Label>
                        <Input
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          placeholder="Community name"
                          data-ocid="community.create.name.input"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="font-mono text-xs uppercase text-muted-foreground">
                          Description
                        </Label>
                        <Textarea
                          value={newDesc}
                          onChange={(e) => setNewDesc(e.target.value)}
                          placeholder="What's this community about?"
                          rows={3}
                          data-ocid="community.create.description.textarea"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setCreateOpen(false)}
                        data-ocid="community.create.cancel_button"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreateCommunity}
                        disabled={!newName.trim()}
                        data-ocid="community.create.submit_button"
                      >
                        Create
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              ) : (
                <Button
                  onClick={() => openModal("signin")}
                  className="gap-2 font-mono"
                  data-ocid="community.login.button"
                >
                  <Plus className="w-4 h-4" />
                  Create Community
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Login prompt */}
      {!isLoggedIn && (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3 bg-primary/10 border border-primary/30 rounded-lg px-4 py-3">
            <AlertTriangle className="w-4 h-4 text-primary shrink-0" />
            <p className="text-sm font-mono">
              <button
                type="button"
                onClick={() => openModal("signin")}
                className="text-primary underline"
                data-ocid="community.login_prompt.button"
              >
                Sign in
              </button>{" "}
              to post, like, and comment in communities.
            </p>
          </div>
        </div>
      )}

      {/* Moderation panel (admin only) */}
      {isAdmin && showModeration && (
        <ModerationPanel onClose={() => setShowModeration(false)} />
      )}

      {/* Communities grid */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {communities.length === 0 ? (
            <div
              className="text-center py-16 text-muted-foreground"
              data-ocid="community.list.empty_state"
            >
              <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="font-mono">
                No communities yet. Create the first one!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {communities.map((c, i) => (
                <Card
                  key={c.id}
                  className="border border-border hover:border-primary/40 transition-colors group cursor-pointer"
                  data-ocid={`community.item.${i + 1}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
                        <span className="text-xl">{c.name.charAt(0)}</span>
                      </div>
                      <Badge variant="outline" className="font-mono text-xs">
                        {c.memberCount} members
                      </Badge>
                    </div>
                    <h3 className="font-bold text-lg mt-2">{c.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {c.description}
                    </p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground font-mono">
                        {c.postCount} posts
                      </span>
                      <Button
                        size="sm"
                        onClick={() => setActiveCommunity(c)}
                        data-ocid={`community.enter.button.${i + 1}`}
                        className="font-mono text-xs"
                      >
                        Enter
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

// ─── Post Feed ────────────────────────────────────────────────────────────────

interface PostFeedProps {
  community: Community;
  onBack: () => void;
  isAdmin: boolean;
  isLoggedIn: boolean;
  currentUser: { name?: string; email?: string } | null;
  openAuthModal: (tab?: "signin" | "register") => void;
  communities: Community[];
  setCommunities: (c: Community[]) => void;
}

function PostFeed({
  community,
  onBack,
  isAdmin,
  isLoggedIn,
  currentUser,
  openAuthModal,
  communities,
  setCommunities,
}: PostFeedProps) {
  const [posts, setPosts] = useState<Post[]>(() =>
    load<Post[]>("community_posts", []).filter(
      (p) => p.communityId === community.id,
    ),
  );
  const [newPostText, setNewPostText] = useState("");
  const [newPostImage, setNewPostImage] = useState<string | undefined>();
  const [posting, setPosting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const bans = load<Ban[]>("community_bans", []);
  const currentUserId = currentUser?.email ?? "guest";
  const isBanned = bans.some((b) => b.userId === currentUserId);

  function saveAllPosts(updated: Post[]) {
    const allPosts = load<Post[]>("community_posts", []).filter(
      (p) => p.communityId !== community.id,
    );
    save("community_posts", [...allPosts, ...updated]);
  }

  function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setNewPostImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function handlePost() {
    if (!newPostText.trim() || !isLoggedIn) return;
    if (isBanned) {
      toast.error("Your account has been suspended.");
      return;
    }
    setPosting(true);
    await new Promise((r) => setTimeout(r, 200));
    const post: Post = {
      id: uid(),
      communityId: community.id,
      authorName: currentUser?.name ?? "Anonymous",
      authorId: currentUserId,
      text: newPostText.trim(),
      imageBase64: newPostImage,
      likes: [],
      createdAt: new Date().toISOString(),
    };
    const updated = [post, ...posts];
    setPosts(updated);
    saveAllPosts(updated);
    // Increment post count
    const updatedCommunities = communities.map((c) =>
      c.id === community.id ? { ...c, postCount: c.postCount + 1 } : c,
    );
    setCommunities(updatedCommunities);
    setNewPostText("");
    setNewPostImage(undefined);
    setPosting(false);
  }

  function handleLike(postId: string) {
    if (!isLoggedIn) {
      openAuthModal("signin");
      return;
    }
    const updated = posts.map((p) => {
      if (p.id !== postId) return p;
      const liked = p.likes.includes(currentUserId);
      return {
        ...p,
        likes: liked
          ? p.likes.filter((l) => l !== currentUserId)
          : [...p.likes, currentUserId],
      };
    });
    setPosts(updated);
    saveAllPosts(updated);
  }

  function handleDeletePost(postId: string) {
    const updated = posts.filter((p) => p.id !== postId);
    setPosts(updated);
    saveAllPosts(updated);
    toast.success("Post deleted.");
  }

  return (
    <div className="w-full">
      {/* Header */}
      <section className="py-8 border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            className="gap-2 font-mono text-xs text-muted-foreground mb-4"
            onClick={onBack}
            data-ocid="community.back.button"
          >
            <ArrowLeft className="w-4 h-4" />
            All Communities
          </Button>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tighter">
            {community.name}
          </h1>
          <p className="text-muted-foreground font-body mt-1">
            {community.description}
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-2xl">
        {/* Composer */}
        {isLoggedIn ? (
          isBanned ? (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 text-sm text-red-400 font-mono">
              Your account has been suspended.
            </div>
          ) : (
            <Card
              className="border border-border mb-8"
              data-ocid="community.post.editor"
            >
              <CardContent className="pt-4 space-y-3">
                <Textarea
                  value={newPostText}
                  onChange={(e) => setNewPostText(e.target.value)}
                  placeholder="Share something with the community..."
                  rows={3}
                  data-ocid="community.post.textarea"
                />
                {newPostImage && (
                  <img
                    src={newPostImage}
                    alt="preview"
                    className="rounded-lg max-h-48 object-cover"
                  />
                )}
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-mono"
                    data-ocid="community.post.upload_button"
                  >
                    <ImageIcon className="w-4 h-4" />
                    Add Image
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImagePick}
                  />
                  <Button
                    size="sm"
                    onClick={handlePost}
                    disabled={posting || !newPostText.trim()}
                    data-ocid="community.post.submit_button"
                    className="font-mono text-xs"
                  >
                    Post
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        ) : (
          <div className="flex items-center gap-3 bg-primary/10 border border-primary/30 rounded-lg px-4 py-3 mb-6">
            <p className="text-sm font-mono">
              <button
                type="button"
                onClick={() => openAuthModal("signin")}
                className="text-primary underline"
                data-ocid="community.post.login.button"
              >
                Sign in
              </button>{" "}
              to post in this community.
            </p>
          </div>
        )}

        {/* Posts */}
        {posts.length === 0 ? (
          <div
            className="text-center py-16 text-muted-foreground"
            data-ocid="community.posts.empty_state"
          >
            <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-mono">No posts yet. Be the first!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post, i) => (
              <PostCard
                key={post.id}
                post={post}
                index={i}
                isAdmin={isAdmin}
                isLoggedIn={isLoggedIn}
                currentUserId={currentUserId}
                onLike={() => handleLike(post.id)}
                onDelete={() => handleDeletePost(post.id)}
                openAuthModal={openAuthModal}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Post Card ────────────────────────────────────────────────────────────────

interface PostCardProps {
  post: Post;
  index: number;
  isAdmin: boolean;
  isLoggedIn: boolean;
  currentUserId: string;
  onLike: () => void;
  onDelete: () => void;
  openAuthModal: (tab?: "signin" | "register") => void;
}

function PostCard({
  post,
  index,
  isAdmin,
  isLoggedIn,
  currentUserId,
  onLike,
  onDelete,
  openAuthModal,
}: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>(() =>
    load<Comment[]>("community_comments", []).filter(
      (c) => c.postId === post.id,
    ),
  );
  const [commentText, setCommentText] = useState("");
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");

  const liked = post.likes.includes(currentUserId);
  const initials = post.authorName.slice(0, 2).toUpperCase();

  function saveComments(updated: Comment[]) {
    const all = load<Comment[]>("community_comments", []).filter(
      (c) => c.postId !== post.id,
    );
    save("community_comments", [...all, ...updated]);
  }

  function handleAddComment() {
    if (!commentText.trim() || !isLoggedIn) return;
    const comment: Comment = {
      id: uid(),
      postId: post.id,
      authorName: "You",
      authorId: currentUserId,
      text: commentText.trim(),
      likes: [],
      createdAt: new Date().toISOString(),
    };
    const updated = [...comments, comment];
    setComments(updated);
    saveComments(updated);
    setCommentText("");
  }

  function handleReport() {
    if (!reportReason.trim()) return;
    const reports = load<Report[]>("community_reports", []);
    const report: Report = {
      id: uid(),
      type: "post",
      targetId: post.id,
      reportedBy: currentUserId,
      reason: reportReason.trim(),
      createdAt: new Date().toISOString(),
    };
    save("community_reports", [...reports, report]);
    setReportOpen(false);
    setReportReason("");
    toast.success("Report submitted. Thank you!");
  }

  return (
    <Card
      className="border border-border"
      data-ocid={`community.post.item.${index + 1}`}
    >
      <CardContent className="pt-4 space-y-3">
        {/* Author */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="text-xs bg-primary/20 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold">{post.authorName}</p>
              <p className="text-xs text-muted-foreground font-mono">
                {new Date(post.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {isAdmin && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                onClick={onDelete}
                data-ocid={`community.post.delete_button.${index + 1}`}
              >
                <Flag className="w-3.5 h-3.5" />
              </Button>
            )}
            {isLoggedIn && (
              <Dialog open={reportOpen} onOpenChange={setReportOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    data-ocid={`community.post.report.open_modal_button.${index + 1}`}
                  >
                    <Flag className="w-3.5 h-3.5" />
                  </Button>
                </DialogTrigger>
                <DialogContent data-ocid="community.report.dialog">
                  <DialogHeader>
                    <DialogTitle className="font-mono">Report Post</DialogTitle>
                  </DialogHeader>
                  <Textarea
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    placeholder="Describe the issue..."
                    rows={3}
                    data-ocid="community.report.reason.textarea"
                  />
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setReportOpen(false)}
                      data-ocid="community.report.cancel_button"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleReport}
                      disabled={!reportReason.trim()}
                      data-ocid="community.report.submit_button"
                    >
                      Submit Report
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Content */}
        <p className="text-sm leading-relaxed">{post.text}</p>
        {post.imageBase64 && (
          <img
            src={post.imageBase64}
            alt="post"
            className="rounded-lg max-h-64 object-cover w-full"
          />
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 pt-1">
          <button
            type="button"
            onClick={onLike}
            className={`flex items-center gap-1.5 text-sm font-mono transition-colors ${
              liked
                ? "text-red-400"
                : "text-muted-foreground hover:text-red-400"
            }`}
            data-ocid={`community.post.like.toggle.${index + 1}`}
          >
            <Heart className={`w-4 h-4 ${liked ? "fill-red-400" : ""}`} />
            {post.likes.length}
          </button>
          <button
            type="button"
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 text-sm font-mono text-muted-foreground hover:text-foreground transition-colors"
            data-ocid={`community.post.comments.toggle.${index + 1}`}
          >
            <MessageCircle className="w-4 h-4" />
            {comments.length} comments
          </button>
        </div>

        {/* Comments */}
        {showComments && (
          <div className="pt-2 border-t border-border space-y-3">
            <ScrollArea className="max-h-48">
              {comments.length === 0 ? (
                <p className="text-xs text-muted-foreground font-mono py-2">
                  No comments yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {comments.map((c) => (
                    <div key={c.id} className="flex gap-2">
                      <Avatar className="w-6 h-6 shrink-0">
                        <AvatarFallback className="text-[10px] bg-muted">
                          {c.authorName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-muted/30 rounded-lg px-3 py-2 flex-1">
                        <p className="text-xs font-semibold">{c.authorName}</p>
                        <p className="text-xs text-muted-foreground">
                          {c.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            {isLoggedIn ? (
              <div className="flex gap-2">
                <Input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="text-sm h-8"
                  onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                  data-ocid={`community.comment.input.${index + 1}`}
                />
                <Button
                  size="sm"
                  onClick={handleAddComment}
                  disabled={!commentText.trim()}
                  className="h-8 font-mono text-xs"
                  data-ocid={`community.comment.submit_button.${index + 1}`}
                >
                  Post
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal("signin")}
                className="text-xs text-primary underline font-mono"
                data-ocid="community.comment.login.button"
              >
                Sign in to comment
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Moderation Panel ─────────────────────────────────────────────────────────

function ModerationPanel({ onClose }: { onClose: () => void }) {
  const [reports, setReports] = useState<Report[]>(() =>
    load<Report[]>("community_reports", []),
  );

  function handleDeleteReported(report: Report) {
    if (report.type === "post") {
      const posts = load<Post[]>("community_posts", []).filter(
        (p) => p.id !== report.targetId,
      );
      save("community_posts", posts);
    } else {
      const comments = load<Comment[]>("community_comments", []).filter(
        (c) => c.id !== report.targetId,
      );
      save("community_comments", comments);
    }
    const updated = reports.filter((r) => r.id !== report.id);
    setReports(updated);
    save("community_reports", updated);
    toast.success("Content removed.");
  }

  function handleBanUser(report: Report) {
    const bans = load<Ban[]>("community_bans", []);
    const newBan: Ban = {
      userId: report.reportedBy,
      bannedAt: new Date().toISOString(),
      reason: report.reason,
    };
    save("community_bans", [...bans, newBan]);
    const updated = reports.filter((r) => r.id !== report.id);
    setReports(updated);
    save("community_reports", updated);
    toast.success("User banned.");
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-8">
      <Card
        className="border-2 border-amber-400/30 bg-amber-400/5"
        data-ocid="community.moderation.panel"
      >
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400" />
            <h3 className="font-mono text-sm uppercase tracking-wider text-amber-400">
              Moderation
            </h3>
            {reports.length > 0 && (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                {reports.length} reports
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="font-mono text-xs"
            data-ocid="community.moderation.close_button"
          >
            Close
          </Button>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <p
              className="text-sm text-muted-foreground font-mono"
              data-ocid="community.moderation.empty_state"
            >
              No pending reports.
            </p>
          ) : (
            <div className="space-y-3">
              {reports.map((r, i) => (
                <div
                  key={r.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-background/50 rounded-lg p-3 border border-border"
                  data-ocid={`community.report.item.${i + 1}`}
                >
                  <div>
                    <p className="text-xs font-mono text-muted-foreground">
                      {r.type} reported by {r.reportedBy}
                    </p>
                    <p className="text-sm">{r.reason}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="destructive"
                      className="font-mono text-xs h-7"
                      onClick={() => handleDeleteReported(r)}
                      data-ocid={`community.report.delete_button.${i + 1}`}
                    >
                      Delete
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="font-mono text-xs h-7 border-red-400/50 text-red-400 hover:bg-red-400/10"
                      onClick={() => handleBanUser(r)}
                      data-ocid={`community.report.ban.button.${i + 1}`}
                    >
                      Ban User
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
