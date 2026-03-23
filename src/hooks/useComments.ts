"use client";

import { useState, useEffect } from "react";
import { Comment } from "@/types";
import {
  subscribeToComments,
  addComment,
  deleteComment,
} from "@/services/commentService";

export function useComments(articleId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!articleId) return;

    const unsubscribe = subscribeToComments(articleId, (newComments) => {
      setComments(newComments);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [articleId]);

  const submitComment = async (
    userId: string,
    userName: string,
    userPhotoURL: string,
    content: string
  ) => {
    setSubmitting(true);
    try {
      await addComment(articleId, userId, userName, userPhotoURL, content);
    } finally {
      setSubmitting(false);
    }
  };

  const removeComment = async (commentId: string) => {
    await deleteComment(commentId, articleId);
  };

  return { comments, loading, submitting, submitComment, removeComment };
}
