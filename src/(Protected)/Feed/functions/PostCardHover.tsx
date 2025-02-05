import { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import CustomLink from "@/hooks/useLink";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button";
import { MessageSquare, UserPlus } from "lucide-react";
interface PostCardHoverProps {
  children: ReactNode;
  data: any;
}

export default function PostCardHover({ children , data}: PostCardHoverProps) {
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
        <span><CustomLink href={`/p/${data.username}`}>{children}</CustomLink></span>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="center" sideOffset={5} className="w-60 p-0 bg-[#fcfcfc] border-gray-300 shadow-none">
          <div className="flex flex-col space-y-2 p-4">
            <div className="flex items-center space-x-4">
            <CustomLink href={`/p/${data.username}`}>
              <Avatar>
                <AvatarImage src={data.avatar} />
                <AvatarFallback className="bg-[#ff57575f]"></AvatarFallback>
              </Avatar>
              </CustomLink>
              <div>
              <CustomLink href={`/p/${data.username}`}>           
                <p className="text-sm font-medium capitalize">{data.firstName} {data.lastName}</p>   </CustomLink>
                <CustomLink href={`/p/${data.username}`}>     <p className="text-xs text-gray-500 lowercase">@{data.username} </p></CustomLink>
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-600 flex-col">
              <span>Followers: 1.5K</span>
              <span>Following: 567</span>
            </div>
            <div className="flex items-center gap-2 justify-between w-full">
            <Button className="w-full sm:w-auto whitespace-nowrap bg-gradient-to-tr from-[#ff2941] to-[#ff078e] h-8 font-normal text-white text-[13px]" size="sm"> <UserPlus className="h-4 w-4" /> Follow</Button>
            <Button className="w-full sm:w-auto whitespace-nowrap bg-gradient-to-br from-[#ff2941af] to-[#ff078faf]  h-8 font-normal text-white text-[13px]" size="sm"> <MessageSquare className="h-4 w-4" /> Message</Button>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
