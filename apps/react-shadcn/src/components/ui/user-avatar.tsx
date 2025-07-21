import { cn } from "~/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "./avatar"

interface UserAvatarProps {
  className?: string
  avatarUrl?: string
  displayName: string
  status?: "online" | "offline"
}

export const UserAvatar = ({ className, avatarUrl, displayName, status }: UserAvatarProps) => {
  return (
    <div className="relative">
      <Avatar className={className}>
        <AvatarImage src={avatarUrl} />
        <AvatarFallback>{displayName[0]}</AvatarFallback>
      </Avatar>
      {status && (
        <div
          className={cn(
            "absolute bottom-0 right-0 h-2 w-2 rounded-full border-2 border-background",
            status === "online" ? "bg-green-500" : "bg-gray-400"
          )}
        />
      )}
    </div>
  )
}