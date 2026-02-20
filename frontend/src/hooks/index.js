import { useState, useEffect, useCallback } from "react";
import axios from "../api/axios";
import { toast } from "../utils/toast";

// Generic fetch hook
export function useFetch(url, options = {}) {
  const { immediate = true, onError } = options;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(url);
      setData(res.data);
    } catch (err) {
      setError(err);
      if (onError) onError(err);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    if (immediate) fetch();
  }, [fetch, immediate]);

  return { data, loading, error, refetch: fetch };
}

// Posts hook for home/account/search pages
export function usePosts(url) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async (fetchUrl = url) => {
    if (!fetchUrl) return;
    setLoading(true);
    try {
      const res = await axios.get(fetchUrl);
      setPosts(res.data || []);
    } catch (err) {
      console.error("Error fetching posts:", err);
      if (err.response?.status === 401) {
        toast.error("You must be logged in to view posts.");
      } else {
        toast.error("Failed to load posts. Please try again.");
      }
    } finally {
      setTimeout(() => setLoading(false), 400);
    }
  }, [url]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { posts, loading, refetch: fetchPosts };
}

// Comments hook
export function useComments(postId) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/pub/${postId}/comments`);
      setComments(res.data);
      setHasFetched(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load comments.");
    } finally {
      setLoading(false);
    }
  }, [postId]);

  const addComment = useCallback(async (content) => {
    try {
      const response = await axios.post(`/pub/${postId}/comment`, { content });
      if (response.status === 200) {
        // Optimistic update
        setComments((prev) => [
          ...prev,
          {
            _id: Date.now().toString(),
            content,
            username: response.data?.username || "you",
            ...response.data,
          },
        ]);
        return true;
      }
    } catch (err) {
      console.error("Error adding comment:", err);
      if (err.response?.status === 401) {
        toast.error("You must be logged in to comment.");
      } else {
        toast.error(err.response?.data?.error || "Failed to add comment.");
      }
      return false;
    }
  }, [postId]);

  const deleteComment = useCallback(async (commentId) => {
    // Optimistic removal
    setComments((prev) => prev.filter((c) => c._id !== commentId));
    try {
      await axios.post(`/pub/${postId}/comment/${commentId}/delete`);
    } catch (err) {
      console.error("Error deleting comment:", err);
      toast.error(err.response?.data?.error || "Failed to delete comment.");
      fetchComments(); // revert on failure
    }
  }, [postId, fetchComments]);

  return { comments, loading, hasFetched, fetchComments, addComment, deleteComment };
}
