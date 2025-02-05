import { useSocket } from "@/contexts/SocketContext";

export default function TestPage() {
  const { onlineUsers = [] } = useSocket(); // Ensure default empty array

  console.log("🔥 Rendering Online Users:", onlineUsers); // Debugging

  return (
    <div>
      <h3>Online Users</h3>
      {onlineUsers.length === 0 ? (
        <p>No users online</p>
      ) : (
        <ul>
          {onlineUsers.map((user) => (
            <li key={user.userId}>
              {user.userId} - 
              {user.status === "online" ? "🟢 Online" : 
               user.status === "away" ? "🟡 Away" : 
               "🔴 Offline"}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}