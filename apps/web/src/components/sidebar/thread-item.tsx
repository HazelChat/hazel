import { useAtomSet } from "@effect-atom/atom-react";
import type { Channel, ChannelMember } from "@hazel/db/schema";
import type { ChannelId } from "@hazel/schema";
import { Link } from "@tanstack/react-router";
import { Exit } from "effect";
import { useState } from "react";
import { toast } from "sonner";
import { generateThreadNameMutation } from "~/atoms/channel-atoms";
import IconBranch from "~/components/icons/icon-branch";
import IconDots from "~/components/icons/icon-dots";
import IconEdit from "~/components/icons/icon-edit";
import IconLeave from "~/components/icons/icon-leave";
import IconPenSparkle from "~/components/icons/icon-pen-sparkle";
import IconVolume from "~/components/icons/icon-volume";
import IconVolumeMute from "~/components/icons/icon-volume-mute";
import { RenameThreadModal } from "~/components/modals/rename-thread-modal";
import { Button } from "~/components/ui/button";
import { Menu, MenuContent, MenuItem, MenuLabel } from "~/components/ui/menu";
import { useChannelMemberActions } from "~/hooks/use-channel-member-actions";
import { useOrganization } from "~/hooks/use-organization";

interface ThreadItemProps {
	thread: Omit<Channel, "updatedAt"> & { updatedAt: Date | null };
	member: ChannelMember;
}

export function ThreadItem({ thread, member }: ThreadItemProps) {
	const { slug } = useOrganization();
	const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
	const [isGenerating, setIsGenerating] = useState(false);

	const { handleToggleMute, handleLeave } = useChannelMemberActions(
		member,
		"thread",
	);
	const generateName = useAtomSet(generateThreadNameMutation, {
		mode: "promiseExit",
	});

	const handleGenerateName = async () => {
		setIsGenerating(true);
		const exit = await generateName({
			payload: { channelId: thread.id as ChannelId },
		});
		setIsGenerating(false);

		if (Exit.isFailure(exit)) {
			toast.error("Failed to generate thread name");
		}
	};

	return (
		<div className="group/thread-item relative col-span-full grid grid-cols-[auto_1fr] items-center gap-2 pl-2">
			<IconBranch className="size-4 text-muted-fg" />
			<Link
				to="/$orgSlug/chat/$id"
				params={{ orgSlug: slug, id: thread.id }}
				className="truncate rounded-md px-2 pr-8 py-1.5 text-sm text-sidebar-fg hover:bg-sidebar-accent hover:text-sidebar-accent-fg"
				activeProps={{
					className: "bg-sidebar-accent font-medium text-sidebar-accent-fg",
				}}
			>
				{thread.name}
			</Link>
			<Menu>
				<Button
					intent="plain"
					className="absolute right-2 top-1/2 size-5 -translate-y-1/2 text-muted-fg opacity-0 group-hover/thread-item:opacity-100"
				>
					<IconDots className="size-5 sm:size-4" />
				</Button>
				<MenuContent placement="right top" className="w-42">
					<MenuItem onAction={handleToggleMute}>
						{member.isMuted ? (
							<IconVolume className="size-4" />
						) : (
							<IconVolumeMute className="size-4" />
						)}
						<MenuLabel>{member.isMuted ? "Unmute" : "Mute"}</MenuLabel>
					</MenuItem>
					<MenuItem onAction={handleGenerateName} isDisabled={isGenerating}>
						<IconPenSparkle className="size-4" />
						<MenuLabel>
							{isGenerating ? "Generating..." : "Generate name"}
						</MenuLabel>
					</MenuItem>
					<MenuItem onAction={() => setIsRenameModalOpen(true)}>
						<IconEdit className="size-4" />
						<MenuLabel>Rename thread</MenuLabel>
					</MenuItem>
					<MenuItem intent="danger" onAction={handleLeave}>
						<IconLeave />
						<MenuLabel className="text-destructive">Leave thread</MenuLabel>
					</MenuItem>
				</MenuContent>
			</Menu>
			<RenameThreadModal
				threadId={thread.id}
				isOpen={isRenameModalOpen}
				onOpenChange={setIsRenameModalOpen}
			/>
		</div>
	);
}
