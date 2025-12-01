import { useState, useEffect, useRef } from "react";
import { createNotification, getNotificationsForTarget } from '../services/notificationApi';
import { getCurrentUser } from '../services/userApi';

export default function MotionDetailsComments({ committeeId, motionId }) {
        const [comments, setComments] = useState([]);
        const [newComment, setNewComment] = useState("");
        const [currentUser, setCurrentUser] = useState(null);
        const chatEndRef = useRef(null);

        // Load current user and existing messages for this motion
        useEffect(() => {
                let mounted = true;
                async function load() {
                        try {
                                const cur = await getCurrentUser().catch(() => null);
                                if (!mounted) return;
                                setCurrentUser(cur && cur.user ? cur.user : null);

                                if (!motionId) return;
                                const res = await getNotificationsForTarget('motion', motionId);
                                if (!mounted) return;
                                if (res && res.notifications) {
                                        const mapped = res.notifications.map(n => ({
                                                id: n._id,
                                                text: n.message,
                                                senderName: n.requesterName || (n.requesterId ? String(n.requesterId) : 'User'),
                                                requesterId: n.requesterId ? String(n.requesterId) : null,
                                                createdAt: n.createdAt
                                        }));
                                        setComments(mapped);
                                }
                        } catch (e) {
                                console.error('Failed to load messages:', e);
                        }
                }
                load();
                return () => { mounted = false; };
        }, [motionId]);

        // Automatically scroll to the latest message
        useEffect(() => {
                chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, [comments]);

        const handleSubmit = async (e) => {
                e.preventDefault();
                if (!newComment.trim()) return;

                try {
                        const payload = {
                                type: 'message',
                                targetType: 'motion',
                                targetId: motionId,
                                committeeId: committeeId,
                                message: newComment
                        };

                        const res = await createNotification(payload);
                        const note = res && res.notification ? res.notification : null;
                        const added = note ? {
                                id: note._id,
                                text: note.message,
                                senderName: note.requesterName,
                                requesterId: note.requesterId ? String(note.requesterId) : null,
                                createdAt: note.createdAt
                        } : {
                                id: Date.now(),
                                text: newComment,
                                senderName: currentUser ? (currentUser.name || 'You') : 'You',
                                requesterId: currentUser ? (currentUser.id || currentUser._id) : null,
                                createdAt: new Date()
                        };

                        setComments(prev => [...prev, added]);
                        setNewComment("");
                } catch (err) {
                        console.error('Failed to send message:', err);
                        alert('Failed to send message');
                }
        };

        return (
                <div className="mx-auto bg-superlight-green shadow-md rounded-lg p-4 flex flex-col h-110">
                        <h2 className="text-lg font-semibold mb-3 text-gray-800">Chat</h2>

                        {/* Chat area */}
                        <div className="flex-grow overflow-y-auto bg-white border border-lighter-green/30 rounded-md p-3 space-y-3">
                                {comments.length === 0 ? (
                                        <p className="text-gray-600 text-sm text-center mt-10">No messages yet. Say hello!</p>
                                ) : (
                                        comments.map((comment) => {
                                                const isMine = currentUser && String(currentUser.id || currentUser._id || currentUser._id) === String(comment.requesterId);
                                                return (
                                                        <div key={comment.id} className={`flex items-center gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}>
                                                                {!isMine && (
                                                                        <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0 overflow-hidden self-start mt-6">
                                                                                <div className="w-full h-full flex items-center justify-center text-gray-600">{comment.senderName ? comment.senderName.charAt(0).toUpperCase() : 'U'}</div>
                                                                        </div>
                                                                )}
                                                                <div className="flex flex-col max-w-[85%]">
                                                                        <span className={`text-xs text-gray-500 mb-1 px-1 ${isMine ? 'text-end' : 'text-start'}`}>{isMine ? (currentUser && (currentUser.name || 'You')) : (comment.senderName || 'User')}</span>
                                                                        <div className={`px-3 py-2 rounded-xl w-full whitespace-pre-wrap break-words ${isMine ? 'bg-lighter-green text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
                                                                                {comment.text}
                                                                        </div>
                                                                </div>
                                                                {isMine && (
                                                                        <div className="w-8 h-8 rounded-full bg-lighter-green flex-shrink-0 overflow-hidden self-start mt-6">
                                                                                <div className="w-full h-full flex items-center justify-center text-white text-xs">You</div>
                                                                        </div>
                                                                )}
                                                        </div>
                                                );
                                        })
                                )}

                                <div ref={chatEndRef} />
                        </div>

                        {/* Input area */}
                        <form onSubmit={handleSubmit} className="flex mt-3">
                                <input type="text" placeholder="Type a message..." value={newComment} onChange={(e) => setNewComment(e.target.value)} className="flex-grow border border-lighter-green rounded-md p-2 focus:outline-none bg-white text-gray-800" autoComplete="off" />

                                <button type="submit" className="ml-2">Send</button>
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

