import { useState } from "react";

export default function MotionDetailsComments() {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    // Add new comment
    setComments([
      ...comments,
      {
        id: Date.now(),
        text: newComment,
      },
    ]);

    setNewComment("");
  };

  const handleDelete = (id) => {
    setComments(comments.filter((comment) => comment.id !== id));
  };

  return (
    <div className="max-w-md mx-auto bg-superlight-green shadow-md rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-3 text-gray-800">Comments</h2>

      <form onSubmit={handleSubmit} className="flex mb-3">
        <input
          type="text"
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="flex-grow border rounded-l-md p-2 focus:outline-none bg-white text-gray-800 border-lighter-green"
        />
        <button
          type="submit"
          className="bg-lighter-green text-white px-3 py-2 rounded-r-md hover:bg-darker-green"
        >
          Post
        </button>
      </form>

      <ul className="space-y-2">
        {comments.length === 0 ? (
          <p className="text-gray-600 text-sm">No comments yet.</p>
        ) : (
          comments.map((comment) => (
            <li
              key={comment.id}
              className="flex justify-between items-center border rounded-md p-2 bg-white border-lighter-green/20"
            >
              <span className="text-gray-800">{comment.text}</span>
              <button
                onClick={() => handleDelete(comment.id)}
                className="text-lighter-green text-sm hover:text-darker-green"
              >
                Delete
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
