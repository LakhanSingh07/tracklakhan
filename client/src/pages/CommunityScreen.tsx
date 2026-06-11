import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MobileLayout, StatusBar, HomeIndicator } from "@/components/MobileLayout";
import { BottomNav } from "@/components/BottomNav";
import { supabase } from "@/lib/supabase";
import { useApp } from "@/lib/appContext";

import { CommunityHome } from "@/components/community/CommunityHome";
import { CommunityGroups } from "@/components/community/CommunityGroups";
import { CommunityCreatePost } from "@/components/community/CommunityCreatePost";
import { CommunityPostDetail } from "@/components/community/CommunityPostDetail";
import { CommunityExperts } from "@/components/community/CommunityExperts";
import { CommunitySetup } from "@/components/community/CommunitySetup";
import { CommunityCreateGroup } from "@/components/community/CommunityCreateGroup";
import { CommunityCreatePage } from "@/components/community/CommunityCreatePage";
import { CommunityGroupDetail } from "@/components/community/CommunityGroupDetail";
import { CommunityPageDetail } from "@/components/community/CommunityPageDetail";
import { Lock, X, ArrowLeft } from "lucide-react";

export type CommunityTab = "For You" | "Groups" | "Ask" | "Experts" | "Saved";
export type ReactionType = "same_here" | "helpful" | "support" | "thank_you" | "following";

export interface CommunityGroup {
  id: number;
  name: string;
  description: string;
  avatar_color: string;
  type: string;
  created_by: string;
  member_count: number;
  created_at: string;
  joined?: boolean;
}

export interface ExpertPage {
  id: number;
  name: string;
  bio: string;
  category: string;
  avatar_color: string;
  created_by: string;
  follower_count: number;
  created_at: string;
  followed?: boolean;
}

export interface CommunityPost {
  id: number;
  user_id: string | null;
  content: string;
  image_url: string | null;
  type: string;
  topic: string | null;
  group_id: number | null;
  page_id: number | null;
  is_anonymous: boolean;
  reaction_count: number;
  comment_count: number;
  created_at: string;

  // client-joined fields
  authorName?: string;
  authorAvatarColor?: string;
  groupName?: string;
  groupColor?: string;
  hasExpertReply?: boolean;
}

export interface CommunityComment {
  id: number;
  post_id: number;
  user_id: string | null;
  body: string;
  parent_comment_id: number | null;
  is_anonymous: boolean;
  created_at: string;

  // client-joined fields
  authorName?: string;
  authorAvatarColor?: string;
  role?: string | null;
  isExpert?: boolean;
}

export const CommunityScreen = () => {
  const { user, authUser } = useApp();
  const [activeTab, setActiveTab] = useState<CommunityTab>("For You");
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [groups, setGroups] = useState<CommunityGroup[]>([]);
  const [pages, setPages] = useState<ExpertPage[]>([]);
  const [comments, setComments] = useState<CommunityComment[]>([]);

  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<CommunityGroup | null>(null);
  const [selectedPage, setSelectedPage] = useState<ExpertPage | null>(null);
  const [communityUser, setCommunityUser] = useState<any | null>(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showCreatePage, setShowCreatePage] = useState(false);
  const [showComposer, setShowComposer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const [joinedGroupIds, setJoinedGroupIds] = useState<Set<number>>(new Set());
  const [savedPostIds, setSavedPostIds] = useState<Set<number>>(new Set());
  const [followedPageIds, setFollowedPageIds] = useState<Set<number>>(new Set());
  const [userReactions, setUserReactions] = useState<Map<number, string>>(new Map());
  const [blockedUserIds, setBlockedUserIds] = useState<Set<string>>(new Set());

  // Privacy overlay
  const [showPrivacy, setShowPrivacy] = useState(false);

  // Report overlays
  const [reportPostId, setReportPostId] = useState<number | null>(null);
  const [reportCommentId, setReportCommentId] = useState<number | null>(null);
  const [reportReason, setReportReason] = useState("Harassment or bullying");
  const [reportDetails, setReportDetails] = useState("");

  const displayName = (user.name || authUser?.user_metadata?.full_name || "FlowAI Member").trim();

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  };

  // Load community profile
  const loadProfile = async () => {
    if (!supabase || !authUser) return;
    try {
      const { data, error } = await supabase
        .from("community_users")
        .select("*")
        .eq("id", authUser.id)
        .maybeSingle();

      if (error) throw error;
      setCommunityUser(data);
    } catch (err) {
      console.error("Profile load failed:", err);
    }
  };

  const handleRegisterProfile = async (nickname: string, avatarUrl: string) => {
    if (!supabase || !authUser) return;
    const { data, error } = await supabase
      .from("community_users")
      .insert({
        id: authUser.id,
        nickname: nickname,
        avatar_color: avatarUrl
      })
      .select("*")
      .single();

    if (error) throw error;
    setCommunityUser(data);
    showToast("Profile created! Welcome to Saheli.");
    loadCommunity();
  };

  // Main data loader
  const loadCommunity = async () => {
    if (!supabase || !authUser) {
      setLoading(false);
      setError("Active session required.");
      return;
    }

    try {
      setError("");
      setLoading(true);

      // 1. Fetch groups & pages
      const [groupsRes, pagesRes, groupMembersRes, savedRes, reactionsRes, blocksRes, followersRes] = await Promise.all([
        supabase.from("community_groups").select("*").order("name", { ascending: true }),
        supabase.from("community_pages").select("*").order("name", { ascending: true }),
        supabase.from("community_group_members").select("group_id").eq("user_id", authUser.id),
        supabase.from("community_saved_posts").select("post_id").eq("user_id", authUser.id),
        supabase.from("community_reactions").select("post_id, reaction_type").eq("user_id", authUser.id),
        supabase.from("community_blocks").select("blocked_user_id").eq("blocker_user_id", authUser.id),
        supabase.from("community_page_followers").select("page_id").eq("user_id", authUser.id),
      ]);

      if (groupsRes.error) {
        throw new Error("Tables not ready. Ensure supabase-saheli-community-migration.sql has been run.");
      }

      const fetchedGroups = (groupsRes.data || []) as CommunityGroup[];
      const fetchedPages = (pagesRes.data || []) as ExpertPage[];

      const joinedIds = new Set((groupMembersRes.data || []).map((m: any) => m.group_id));
      const savedIds = new Set((savedRes.data || []).map((s: any) => s.post_id));
      const followedIds = new Set((followersRes.data || []).map((f: any) => f.page_id));
      const reactionsMap = new Map((reactionsRes.data || []).map((r: any) => [r.post_id, r.reaction_type]));
      const blockedIds = new Set((blocksRes.data || []).map((b: any) => b.blocked_user_id));

      setJoinedGroupIds(joinedIds);
      setSavedPostIds(savedIds);
      setFollowedPageIds(followedIds);
      setUserReactions(reactionsMap);
      setBlockedUserIds(blockedIds);

      setGroups(fetchedGroups);
      setPages(fetchedPages);

      // 2. Fetch posts
      const { data: postsData, error: postsError } = await supabase
        .from("community_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (postsError) throw postsError;

      const rawPosts = (postsData || []) as CommunityPost[];

      // Filter out blocked users
      const activePosts = rawPosts.filter(p => !p.user_id || !blockedIds.has(p.user_id));

      // 3. Resolve nicknames and group names in memory
      const userIds = Array.from(new Set(activePosts.map(p => p.user_id).filter(Boolean))) as string[];
      const { data: usersData } = userIds.length
        ? await supabase.from("community_users").select("*").in("id", userIds)
        : { data: [] };

      const usersMap = new Map((usersData || []).map((u: any) => [u.id, u]));
      const groupsMap = new Map(fetchedGroups.map(g => [g.id, g]));
      const expertUserIds = new Set(fetchedPages.map(p => p.created_by));

      // Fetch comments for all these posts (in a bulk query if needed, or check expert replies)
      // To determine hasExpertReply, we check if there are comments from expertUserIds on this post
      const postIds = activePosts.map(p => p.id);
      const { data: commentsCheck } = postIds.length
        ? await supabase.from("community_comments").select("post_id, user_id").in("post_id", postIds)
        : { data: [] };

      const expertPostIds = new Set(
        (commentsCheck || [])
          .filter((c: any) => c.user_id && expertUserIds.has(c.user_id))
          .map((c: any) => c.post_id)
      );

      const resolvedPosts = activePosts.map(post => {
        const author = post.user_id ? usersMap.get(post.user_id) : null;
        const group = post.group_id ? groupsMap.get(post.group_id) : null;
        return {
          ...post,
          authorName: author?.nickname || "FlowAI Member",
          authorAvatarColor: author?.avatar_color || "#9ca3af",
          groupName: group?.name || "General",
          groupColor: group?.avatar_color || "#db2777",
          hasExpertReply: expertPostIds.has(post.id),
        };
      });

      setPosts(resolvedPosts);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load community.");
    } finally {
      setLoading(false);
    }
  };

  // Load comments for the active post
  const loadComments = async (postId: number) => {
    if (!supabase) return;
    try {
      const { data: commentsRes, error: commentsErr } = await supabase
        .from("community_comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (commentsErr) throw commentsErr;

      const rawComments = (commentsRes || []) as CommunityComment[];
      const userIds = Array.from(new Set(rawComments.map(c => c.user_id).filter(Boolean))) as string[];

      const { data: usersRes } = userIds.length
        ? await supabase.from("community_users").select("*").in("id", userIds)
        : { data: [] };

      const usersMap = new Map((usersRes || []).map((u: any) => [u.id, u]));

      // Also map pages to find expert titles
      const expertPagesMap = new Map(pages.map(p => [p.created_by, p]));

      const resolvedComments = rawComments.map(c => {
        const author = c.user_id ? usersMap.get(c.user_id) : null;
        const expertPage = c.user_id ? expertPagesMap.get(c.user_id) : null;
        return {
          ...c,
          authorName: author?.nickname || "FlowAI Member",
          authorAvatarColor: author?.avatar_color || "#9ca3af",
          role: expertPage?.category || null,
          isExpert: !!expertPage,
        };
      });

      setComments(resolvedComments);
    } catch (err) {
      console.error("Failed to load comments:", err);
    }
  };

  // Actions
  const handleJoinGroup = async (group: CommunityGroup) => {
    if (!supabase || !authUser) return;
    const joined = joinedGroupIds.has(group.id);
    try {
      if (joined) {
        await supabase
          .from("community_group_members")
          .delete()
          .eq("group_id", group.id)
          .eq("user_id", authUser.id);

        const newCount = Math.max(0, group.member_count - 1);
        await supabase.from("community_groups").update({ member_count: newCount }).eq("id", group.id);
        showToast(`Left ${group.name}`);
      } else {
        await supabase.from("community_group_members").insert({
          group_id: group.id,
          user_id: authUser.id,
          role: "member"
        });

        const newCount = group.member_count + 1;
        await supabase.from("community_groups").update({ member_count: newCount }).eq("id", group.id);
        showToast(`Joined ${group.name}`);
      }
      loadCommunity();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReactPost = async (post: CommunityPost, reaction: ReactionType) => {
    if (!supabase || !authUser) return;
    const currentReaction = userReactions.get(post.id);
    try {
      if (currentReaction === reaction) {
        await supabase
          .from("community_reactions")
          .delete()
          .eq("post_id", post.id)
          .eq("user_id", authUser.id);

        const newCount = Math.max(0, post.reaction_count - 1);
        await supabase.from("community_posts").update({ reaction_count: newCount }).eq("id", post.id);
      } else {
        await supabase.from("community_reactions").upsert(
          { post_id: post.id, user_id: authUser.id, reaction_type: reaction },
          { onConflict: "post_id,user_id,reaction_type" }
        );

        if (!currentReaction) {
          const newCount = post.reaction_count + 1;
          await supabase.from("community_posts").update({ reaction_count: newCount }).eq("id", post.id);
        }
      }
      loadCommunity();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSavePost = async (post: CommunityPost) => {
    if (!supabase || !authUser) return;
    const isSaved = savedPostIds.has(post.id);
    try {
      if (isSaved) {
        await supabase
          .from("community_saved_posts")
          .delete()
          .eq("post_id", post.id)
          .eq("user_id", authUser.id);
        showToast("Removed from Saved");
      } else {
        await supabase.from("community_saved_posts").insert({
          post_id: post.id,
          user_id: authUser.id
        });
        showToast("Saved Privately");
      }
      loadCommunity();
    } catch (err) {
      console.error(err);
    }
  };

  const handleFollowPage = async (page: ExpertPage) => {
    if (!supabase || !authUser) return;
    const followed = followedPageIds.has(page.id);
    try {
      if (followed) {
        await supabase
          .from("community_page_followers")
          .delete()
          .eq("page_id", page.id)
          .eq("user_id", authUser.id);

        const newCount = Math.max(0, page.follower_count - 1);
        await supabase.from("community_pages").update({ follower_count: newCount }).eq("id", page.id);
        showToast(`Unfollowed ${page.name}`);
      } else {
        await supabase.from("community_page_followers").insert({
          page_id: page.id,
          user_id: authUser.id
        });

        const newCount = page.follower_count + 1;
        await supabase.from("community_pages").update({ follower_count: newCount }).eq("id", page.id);
        showToast(`Following ${page.name}`);
      }
      loadCommunity();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePublishPost = async (postData: {
    type: string;
    groupId: number;
    title: string;
    body: string;
    isAnonymous: boolean;
    triggerWarning: string | null;
  }) => {
    if (!supabase || !authUser) return;
    try {
      let content = `${postData.title}\n\n${postData.body}`;
      if (postData.triggerWarning) {
        content = `[TW: ${postData.triggerWarning}]\n\n` + content;
      }

      const { data, error } = await supabase
        .from("community_posts")
        .insert({
          user_id: authUser.id,
          content: content,
          type: postData.type,
          topic: groups.find(g => g.id === postData.groupId)?.name || "General",
          group_id: postData.groupId,
          is_anonymous: postData.isAnonymous,
          reaction_count: 0,
          comment_count: 0
        })
        .select("*")
        .single();

      if (error) throw error;

      showToast("Post shared to community");
      setActiveTab("For You");
      loadCommunity();
    } catch (err) {
      console.error(err);
      showToast("Failed to publish post.");
    }
  };

  const handlePublishGroup = async (groupData: { name: string; description: string; avatarColor: string; type: string }) => {
    if (!supabase || !authUser) return;
    try {
      const { data, error } = await supabase
        .from("community_groups")
        .insert({
          name: groupData.name,
          description: groupData.description,
          avatar_color: groupData.avatarColor,
          type: groupData.type,
          created_by: authUser.id,
          member_count: 1
        })
        .select("*")
        .single();

      if (error) throw error;

      // Add creator as admin member
      await supabase.from("community_group_members").insert({
        group_id: data.id,
        user_id: authUser.id,
        role: "admin"
      });

      showToast("Group created successfully");
      setShowCreateGroup(false);
      setSelectedGroup(data);
      loadCommunity();
    } catch (err) {
      console.error(err);
      throw new Error("Failed to create group.");
    }
  };

  const handlePublishPage = async (pageData: { name: string; bio: string; category: string; avatarColor: string }) => {
    if (!supabase || !authUser) return;
    try {
      const { data, error } = await supabase
        .from("community_pages")
        .insert({
          name: pageData.name,
          bio: pageData.bio,
          category: pageData.category,
          avatar_color: pageData.avatarColor,
          created_by: authUser.id,
          follower_count: 1
        })
        .select("*")
        .single();

      if (error) throw error;

      // Add creator as follower
      await supabase.from("community_page_followers").insert({
        page_id: data.id,
        user_id: authUser.id
      });

      showToast("Expert page created successfully");
      setShowCreatePage(false);
      setSelectedPage(data);
      loadCommunity();
    } catch (err) {
      console.error(err);
      throw new Error("Failed to create expert page.");
    }
  };

  const handleAddComment = async (commentText: string, isAnon: boolean) => {
    if (!supabase || !authUser || !selectedPost) return;
    try {
      const { error } = await supabase.from("community_comments").insert({
        post_id: selectedPost.id,
        user_id: authUser.id,
        body: commentText,
        is_anonymous: isAnon
      });

      if (error) throw error;

      // Update post comment count
      await supabase
        .from("community_posts")
        .update({ comment_count: selectedPost.comment_count + 1 })
        .eq("id", selectedPost.id);

      showToast("Reply posted!");
      loadComments(selectedPost.id);
      loadCommunity();
    } catch (err) {
      console.error(err);
      showToast("Failed to reply.");
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!supabase || !authUser) return;
    try {
      const { error } = await supabase
        .from("community_posts")
        .delete()
        .eq("id", postId)
        .eq("user_id", authUser.id);

      if (error) throw error;

      showToast("Post deleted.");
      setSelectedPost(null);
      loadCommunity();
    } catch (err) {
      console.error(err);
      showToast("Could not delete post.");
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!supabase || !authUser || !selectedPost) return;
    try {
      const { error } = await supabase
        .from("community_comments")
        .delete()
        .eq("id", commentId)
        .eq("user_id", authUser.id);

      if (error) throw error;

      // Update post comment count
      await supabase
        .from("community_posts")
        .update({ comment_count: Math.max(0, selectedPost.comment_count - 1) })
        .eq("id", selectedPost.id);

      showToast("Comment deleted.");
      loadComments(selectedPost.id);
      loadCommunity();
    } catch (err) {
      console.error(err);
      showToast("Could not delete comment.");
    }
  };

  const handleBlockUser = async (userId: string) => {
    if (!supabase || !authUser) return;
    try {
      await supabase.from("community_blocks").insert({
        blocker_user_id: authUser.id,
        blocked_user_id: userId
      });
      showToast("Author blocked. Feed updated.");
      loadCommunity();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReportPost = async () => {
    if (!supabase || !authUser || !reportPostId) return;
    try {
      await supabase.from("community_reports").insert({
        reporter_user_id: authUser.id,
        target_type: "post",
        target_id: String(reportPostId),
        reason: reportReason,
        description: reportDetails
      });
      showToast("Post reported successfully.");
      setReportPostId(null);
      setReportDetails("");
    } catch (err) {
      console.error(err);
      showToast("Failed to report.");
    }
  };

  const handleReportComment = async () => {
    if (!supabase || !authUser || !reportCommentId) return;
    try {
      await supabase.from("community_reports").insert({
        reporter_user_id: authUser.id,
        target_type: "comment",
        target_id: String(reportCommentId),
        reason: reportReason,
        description: reportDetails
      });
      showToast("Comment reported successfully.");
      setReportCommentId(null);
      setReportDetails("");
    } catch (err) {
      console.error(err);
      showToast("Failed to report.");
    }
  };

  // Group Details Posts Filtered
  const groupPosts = useMemo(() => {
    if (!selectedGroup) return [];
    return posts.filter(p => p.group_id === selectedGroup.id);
  }, [posts, selectedGroup]);

  useEffect(() => {
    if (authUser) {
      loadProfile().then(() => loadCommunity());
    }
  }, [authUser?.id]);

  useEffect(() => {
    if (selectedPost) {
      loadComments(selectedPost.id);
    }
  }, [selectedPost?.id]);

  return (
    <MobileLayout gradient="linear-gradient(180deg, #FFF7FB 0%, #F7F2FF 52%, #F9FAFB 100%)">
      <div className="flex h-screen flex-col relative">
        <StatusBar />
        {loading && !communityUser && !selectedPost && !selectedGroup && !selectedPage && activeTab !== "Ask" ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-gray-400 mt-3">Connecting to community...</p>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500 text-lg mb-2">⚠️</div>
            <p className="text-sm font-bold text-gray-800">Connection Failed</p>
            <p className="text-xs text-gray-500 mt-1 mb-4 leading-relaxed">{error}</p>
            <button
              onClick={loadCommunity}
              className="px-6 py-2 rounded-full text-white text-xs font-bold shadow-sm"
              style={{ background: "linear-gradient(135deg, #e879f9, #8b5cf6)" }}
            >
              Retry Connection
            </button>
          </div>
        ) : !communityUser ? (
          <CommunitySetup defaultName={displayName} onSubmit={handleRegisterProfile} />
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {!selectedPost && !selectedGroup && !selectedPage && !showCreateGroup && !showCreatePage && activeTab !== "Ask" && (
              <div className="px-4 mt-2">
                <div className="flex gap-1 bg-white/60 rounded-2xl p-1 border border-gray-100/50 shadow-sm">
                  {(["For You", "Groups", "Ask", "Experts", "Saved"] as CommunityTab[]).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 text-[10px] font-semibold py-2 rounded-xl transition-all ${
                        activeTab === tab ? "text-white shadow-sm" : "text-gray-400 hover:text-gray-600"
                      }`}
                      style={activeTab === tab ? { background: "linear-gradient(135deg, #e879f9, #8b5cf6)" } : {}}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {selectedPost ? (
              <CommunityPostDetail
                post={selectedPost}
                comments={comments}
                savedPostIds={savedPostIds}
                userReactions={userReactions}
                onBack={() => setSelectedPost(null)}
                onReact={handleReactPost}
                onSave={handleSavePost}
                onAddComment={handleAddComment}
                currentUserId={authUser?.id || ""}
                onDeletePost={handleDeletePost}
                onDeleteComment={handleDeleteComment}
                onReportComment={(id) => setReportCommentId(id)}
              />
            ) : selectedGroup ? (
              <CommunityGroupDetail
                group={selectedGroup}
                posts={posts}
                joinedGroupIds={joinedGroupIds}
                savedPostIds={savedPostIds}
                userReactions={userReactions}
                currentUserId={authUser?.id || ""}
                onBack={() => setSelectedGroup(null)}
                onJoinGroup={handleJoinGroup}
                onSelectPost={setSelectedPost}
                onReact={handleReactPost}
                onSave={handleSavePost}
                onBlockUser={handleBlockUser}
                onReportPost={(id) => setReportPostId(id)}
                onOpenComposer={(group) => {
                  if (group) setSelectedGroup(group);
                  setActiveTab("Ask");
                }}
              />
            ) : selectedPage ? (
              <CommunityPageDetail
                page={selectedPage}
                posts={posts}
                followedPageIds={followedPageIds}
                savedPostIds={savedPostIds}
                userReactions={userReactions}
                currentUserId={authUser?.id || ""}
                onBack={() => setSelectedPage(null)}
                onFollowPage={handleFollowPage}
                onSelectPost={setSelectedPost}
                onReact={handleReactPost}
                onSave={handleSavePost}
                onBlockUser={handleBlockUser}
                onReportPost={(id) => setReportPostId(id)}
              />
            ) : showCreateGroup ? (
              <CommunityCreateGroup onBack={() => setShowCreateGroup(false)} onSubmit={handlePublishGroup} />
            ) : showCreatePage ? (
              <CommunityCreatePage onBack={() => setShowCreatePage(false)} onSubmit={handlePublishPage} />
            ) : activeTab === "Ask" ? (
              <CommunityCreatePost groups={groups} onPublish={handlePublishPost} onCancel={() => setActiveTab("For You")} />
            ) : activeTab === "Groups" ? (
              <CommunityGroups
                groups={groups}
                joinedGroupIds={joinedGroupIds}
                onJoinGroup={handleJoinGroup}
                onSelectGroup={setSelectedGroup}
                onCreateGroup={() => setShowCreateGroup(true)}
              />
            ) : activeTab === "Experts" ? (
              <CommunityExperts
                pages={pages}
                followedPageIds={followedPageIds}
                onFollowPage={handleFollowPage}
                onSelectPage={setSelectedPage}
                onCreatePage={() => setShowCreatePage(true)}
              />
            ) : (
              <CommunityHome
                posts={posts}
                groups={groups}
                joinedGroupIds={joinedGroupIds}
                savedPostIds={savedPostIds}
                userReactions={userReactions}
                displayName={communityUser?.nickname || displayName}
                onSelectPost={setSelectedPost}
                onSelectGroup={setSelectedGroup}
                onJoinGroup={handleJoinGroup}
                onReact={handleReactPost}
                onSave={handleSavePost}
                onOpenComposer={(group) => {
                  if (group) setSelectedGroup(group);
                  setActiveTab("Ask");
                }}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onBlockUser={handleBlockUser}
                onReportPost={(id) => setReportPostId(id)}
                currentUserId={authUser?.id || ""}
              />
            )}
          </div>
        )}
        <BottomNav />
        <HomeIndicator />
        <AnimatePresence>
          {showPrivacy && (
            <motion.div className="absolute inset-0 z-50 flex items-end bg-black/35" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div initial={{ y: 320 }} animate={{ y: 0 }} exit={{ y: 320 }} className="w-full rounded-t-[28px] bg-white p-5 shadow-2xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-950">Community Privacy</h2>
                  <button onClick={() => setShowPrivacy(false)} className="rounded-full bg-gray-100 p-2"><X size={18} /></button>
                </div>
                {["Show nickname: On", "Allow anonymous posting: On", "Show cycle health: Always Hidden"].map((item) => (
                  <div key={item} className="mt-3 flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
                    <span className="text-sm font-bold text-gray-700">{item}</span>
                    <Lock size={15} className="text-gray-400" />
                  </div>
                ))}
              </motion.div>
            </motion.div>
          )}
          {reportPostId && (
            <motion.div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 px-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92 }} className="w-full rounded-3xl bg-white p-5 shadow-2xl max-w-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-gray-950">Report Post</h2>
                  <button onClick={() => setReportPostId(null)} className="rounded-full bg-gray-100 p-2"><X size={18} /></button>
                </div>
                <p className="mt-2 text-xs leading-5 text-gray-500">Reports help protect our women's circle.</p>
                <select value={reportReason} onChange={(e) => setReportReason(e.target.value)} className="mt-4 w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-xs font-semibold outline-none">
                  <option value="Harassment or bullying">Harassment or bullying</option>
                  <option value="Unsafe medical advice">Unsafe medical advice</option>
                  <option value="Spam or scams">Spam or scams</option>
                  <option value="Inappropriate content">Inappropriate content</option>
                </select>
                <textarea value={reportDetails} onChange={(e) => setReportDetails(e.target.value)} placeholder="Tell us a bit more (optional)..." rows={3} className="mt-3 w-full resize-none rounded-2xl border border-gray-100 px-4 py-3 text-xs outline-none" />
                <button onClick={handleReportPost} className="mt-4 w-full rounded-2xl bg-red-500 py-3 text-xs font-bold text-white shadow-md active:scale-98">Submit Report</button>
              </motion.div>
            </motion.div>
          )}
          {reportCommentId && (
            <motion.div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 px-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92 }} className="w-full rounded-3xl bg-white p-5 shadow-2xl max-w-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-gray-950">Report Comment</h2>
                  <button onClick={() => setReportCommentId(null)} className="rounded-full bg-gray-100 p-2"><X size={18} /></button>
                </div>
                <p className="mt-2 text-xs leading-5 text-gray-500">Reports help protect our women's circle.</p>
                <select value={reportReason} onChange={(e) => setReportReason(e.target.value)} className="mt-4 w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-xs font-semibold outline-none">
                  <option value="Harassment or bullying">Harassment or bullying</option>
                  <option value="Unsafe medical advice">Unsafe medical advice</option>
                  <option value="Spam or scams">Spam or scams</option>
                  <option value="Inappropriate content">Inappropriate content</option>
                </select>
                <textarea value={reportDetails} onChange={(e) => setReportDetails(e.target.value)} placeholder="Tell us a bit more (optional)..." rows={3} className="mt-3 w-full resize-none rounded-2xl border border-gray-100 px-4 py-3 text-xs outline-none" />
                <button onClick={handleReportComment} className="mt-4 w-full rounded-2xl bg-red-500 py-3 text-xs font-bold text-white shadow-md active:scale-98">Submit Report</button>
              </motion.div>
            </motion.div>
          )}
          {toast && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }} className="absolute bottom-20 left-6 right-6 z-[70] rounded-2xl bg-gray-950 px-4 py-3 text-center text-xs font-bold text-white shadow-xl">{toast}</motion.div>
          )}
        </AnimatePresence>
      </div>
    </MobileLayout>
  );
};
