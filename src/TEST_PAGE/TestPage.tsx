import { useSocket } from "@/contexts/SocketContext";
import LinkedInComment from "./Comment";

export default function TestPage() {
  const { onlineUsers = [] } = useSocket(); // Ensure default empty array

  console.log("🔥 Rendering Online Users:", onlineUsers); // Debugging

  // Categorizing users
  const onlineCount = onlineUsers.filter(user => user.status === "online").length;
  const awayCount = onlineUsers.filter(user => user.status === "away").length;
  const offlineCount = onlineUsers.filter(user => user.status === "offline").length;

  return (
    <div>
      <h3>Online Users</h3>
      <p>🟢 Online: {onlineCount} | 🟡 Away: {awayCount} | 🔴 Offline: {offlineCount}</p>
      
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
      
      <LinkedInComment />
    </div>
  );
}
