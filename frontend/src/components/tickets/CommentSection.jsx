import { useState } from 'react';
import { addComment, updateComment, deleteComment } from '../../api/ticketApi';
import { useAuth } from '../../context/AuthContext';

export default function CommentSection({ ticketId, comments, onRefresh }) {
  const { user } = useAuth();
  const [newComment, setNewComment]   = useState('');
  const [editingId, setEditingId]     = useState(null);
  const [editContent, setEditContent] = useState('');
  const [submitting, setSubmitting]   = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      await addComment(ticketId, { content: newComment });
      setNewComment('');
      onRefresh();
    } catch (err) {
      alert('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (commentId) => {
    if (!editContent.trim()) return;
    try {
      await updateComment(ticketId, commentId, { content: editContent });
      setEditingId(null);
      onRefresh();
    } catch {
      alert('Failed to update comment');
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await deleteComment(ticketId, commentId);
      onRefresh();
    } catch {
      alert('Failed to delete comment');
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        Comments ({comments.length})
      </h3>

      <div className="space-y-3 mb-4">
        {comments.map((c) => (
          <div key={c.id} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
            {editingId === c.id ? (
              <div className="space-y-2">
                <textarea
                  className="w-full border rounded px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  rows={3}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdate(c.id)}
                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-gray-700">{c.authorName}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{c.content}</p>

                {/* Edit — own comments only | Delete — own comments OR admin */}
                {(user?.sub === c.authorId || user?.roles?.includes('ADMIN')) && (
                  <div className="flex gap-2 mt-2">
                    {user?.sub === c.authorId && (
                      <button
                        onClick={() => { setEditingId(c.id); setEditContent(c.content); }}
                        className="text-xs text-blue-500 hover:underline"
                      >
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-sm text-gray-400 italic">No comments yet.</p>
        )}
      </div>

      {/* Add new comment */}
      <form onSubmit={handleAdd} className="space-y-2">
        <textarea
          className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          rows={3}
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button
          type="submit"
          disabled={submitting || !newComment.trim()}
          className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Posting...' : 'Post comment'}
        </button>
      </form>
    </div>
  );
}