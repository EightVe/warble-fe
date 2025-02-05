
import CreatePost from "../functions/CreatePost";
import GetGlobalPosts from "../functions/GetGlobalPosts";

export default function MainContent() {
  return (
    <div className="flex-1 p-4 pb-20 xl:pb-4 bg-[#edeef0]">
      <div className="flex items-center justify-center flex-col">
        <CreatePost />
        <GetGlobalPosts />
      </div>
    </div>
  );
}
