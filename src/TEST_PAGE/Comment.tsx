import { useState } from "react";
import { MessageCircle, ChevronDown, ChevronUp } from "lucide-react";

interface CommentProps {
  id: number;
  author: string;
  text: string;
  replies?: CommentProps[];
}

const Comment = ({ id, author, text, replies = [] }: CommentProps) => {
  const [showReplies, setShowReplies] = useState(false);
  
  return (
    <div className="mt-4 border-l-4 border-gray-300 pl-4">
      <div className="flex flex-col bg-white p-3 rounded-lg shadow-sm">
        <p className="font-semibold text-gray-900">{author}</p>
        <p className="text-gray-700 mt-1">{text}</p>
        <div className="flex items-center mt-2 space-x-2 text-gray-500 text-sm">
          {replies.length > 0 && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="flex items-center gap-1 hover:text-blue-500"
            >
              {showReplies ? <ChevronUp size={14} /> : <ChevronDown size={14} />} 
              {showReplies ? "Hide Replies" : `View Replies (${replies.length})`}
            </button>
          )}
          <button className="flex items-center gap-1 hover:text-blue-500">
            <MessageCircle size={14} /> Reply
          </button>
        </div>
      </div>
      {showReplies && (
        <div className="ml-6 mt-3 space-y-3">
          {replies.map((reply) => (
            <Comment key={reply.id} {...reply} />
          ))}
        </div>
      )}
    </div>
  );
};

const LinkedInComment = () => {
  const comments: CommentProps[] = [
    {
      id: 1,
      author: "John Doe",
      text: "This is a great post!",
      replies: [
        {
          id: 2,
          author: "Jane Smith",
          text: "Totally agree!",
          replies: [
            {
              id: 3,
              author: "Mark Lee",
              text: "Same thoughts here!",
            },
          ],
        },
      ],
    },
  ];

  return (
    <div className="max-w-lg mx-auto p-6 bg-gray-100 rounded-lg">
      <h2 className="text-lg font-bold text-gray-800">Comments</h2>
      <div className="mt-4 space-y-4">
        {comments.map((comment) => (
          <Comment key={comment.id} {...comment} />
        ))}
      </div>
    </div>
  );
};

export default LinkedInComment;
