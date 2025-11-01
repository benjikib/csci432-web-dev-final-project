import { useState, useEffect, useRef } from "react";
import { useAuth0 } from "@auth0/auth0-react";

export default function MotionDetailsComments() {
  const [comments, setComments] = useState([
    {
      id: 1,
      text: "Hello! This is a test message to see how the chat looks.",
      sender: "JohnDoe"
    }
  ]);
  const [newComment, setNewComment] = useState("");
  const chatEndRef = useRef(null);
  const { user, isAuthenticated } = useAuth0();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setComments((prev) => [
      ...prev,
      { id: Date.now(), text: newComment, sender: "user" },
    ]);

    setNewComment("");
  };

  // Automatically scroll to the latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  return (
        <div className="mx-auto bg-superlight-green shadow-md rounded-lg p-4 flex flex-col h-110">
                <h2 className="text-lg font-semibold mb-3 text-gray-800">Chat</h2>

                {/* Chat area */}
                <div className="flex-grow overflow-y-auto bg-white border border-lighter-green/30 rounded-md p-3 space-y-3">
                
                {comments.length === 0 ? (
                        <p className="text-gray-600 text-sm text-center mt-10">
                        No messages yet. Say hello!
                        </p>
                ) : (
                        comments.map((comment) => (
                        <div key={comment.id} className={`flex items-center gap-2 ${comment.sender === "user" ? "justify-end" : "justify-start"}`}>
                                {comment.sender !== "user" && (
                                        <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0 overflow-hidden self-start mt-6">
                                                <div className="w-full h-full flex items-center justify-center text-gray-600">
                                                        {comment.sender ? comment.sender.charAt(0).toUpperCase() : 'U'}
                                                </div>
                                        </div>
                                )}
                                <div className="flex flex-col max-w-[85%]">
                                        <span className={`text-xs text-gray-500 mb-1 px-1 ${comment.sender === "user" ? "text-end" : "text-start"}`}>
                                                {comment.sender === "user" 
                                                        ? (isAuthenticated ? (user.name || 'You') : 'You')
                                                        : (comment.sender || 'User')
                                                }
                                        </span>
                                        <div
                                                className={`px-3 py-2 rounded-xl w-full whitespace-pre-wrap break-words ${
                                                        comment.sender === "user"
                                                        ? "bg-lighter-green text-white rounded-br-none"
                                                        : "bg-gray-200 text-gray-800 rounded-bl-none"
                                                }`}
                                        >
                                                {comment.text}
                                        </div>
                                </div>
                                {comment.sender === "user" && (
                                        <div className="w-8 h-8 rounded-full bg-lighter-green flex-shrink-0 overflow-hidden self-start mt-6">
                                                <div className="w-full h-full flex items-center justify-center text-white text-xs">
                                                        You
                                                </div>
                                        </div>
                                )}
                        </div>
                        ))
                )}

                <div ref={chatEndRef} />
                </div>

                {/* Input area */}
                <form onSubmit={handleSubmit} className="flex mt-3">
                        <input
                                type="text"
                                placeholder="Type a message..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                className="flex-grow border border-lighter-green rounded-md p-2 focus:outline-none bg-white text-gray-800"
                                autoComplete="off"
                        />

                        <button type="submit" className="ml-2">
                                Send
                        </button>
                </form>
        </div>
  );
}

// import { useState, useRef, useEffect } from "react";

// export default function MotionDetailsComments() {
//   const [comments, setComments] = useState([]);
//   const [newComment, setNewComment] = useState("");

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!newComment.trim()) return;

//     setComments((prev) => [
//       ...prev,
//       {
//         id: Date.now(),
//         text: newComment,
//       },
//     ]);

//     setNewComment("");
//   };

//   const handleDelete = (id) => {
//     setComments((prev) => prev.filter((comment) => comment.id !== id));
//   };

//   const chatRef = useRef(null);

//   // auto-scroll to bottom when comments change
//   useEffect(() => {
//     if (chatRef.current) {
//       chatRef.current.scrollTop = chatRef.current.scrollHeight;
//     }
//   }, [comments]);

//   return (
//     <div className="w-full mx-auto bg-superlight-green shadow-md rounded-lg p-4">
//       <h2 className="text-lg font-semibold mb-3 text-gray-800">Comments</h2>

//       {/* Chat area */}
//       <div
//         ref={chatRef}
//         className="chat-box mb-3 p-2 space-y-2 overflow-y-auto"
//         style={{ maxHeight: 320 }}
//       >
//         {comments.length === 0 ? (
//           <div className="text-gray-600 text-sm">No comments yet. Be the first to comment!</div>
//         ) : (
//           comments.map((comment) => (
//             <div key={comment.id} className="flex items-start gap-3">
//               <div className="w-8 h-8 rounded-full bg-lighter-green flex items-center justify-center text-white font-bold text-sm">
//                 U
//               </div>
//               <div className="flex-1">
//                 <div className="bg-white p-3 rounded-md text-gray-800 border border-lighter-green/20">
//                   {comment.text}
//                 </div>
//                 <div className="mt-1 text-xs text-gray-500 flex items-center gap-2">
//                   <span>{new Date(comment.id).toLocaleString()}</span>
//                   <button
//                     onClick={() => handleDelete(comment.id)}
//                     className="text-lighter-green text-xs hover:text-darker-green"
//                     aria-label="Delete comment"
//                   >
//                     Delete
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ))
//         )}
//       </div>

//       {/* Input area */}
//       <form onSubmit={handleSubmit} className="flex gap-2">
//         <input
//           type="text"
//           placeholder="Write a comment..."
//           value={newComment}
//           onChange={(e) => setNewComment(e.target.value)}
//           className="flex-grow border rounded-md p-2 focus:outline-none bg-white text-gray-800 border-lighter-green"
//         />
//         <button
//           type="submit"
//           className="bg-lighter-green text-white px-4 py-2 rounded-md hover:bg-darker-green"
//         >
//           Send
//         </button>
//       </form>
//     </div>
//   );
// }

