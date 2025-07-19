import { ArrowDown, ArrowLeft, ArrowUp, CornerDownLeft, Settings01 } from "@untitledui/icons"
import { Button } from "@/components/base/buttons/button"
import { cx } from "@/utils/cx"
import { CommandMenuNavigationIcon } from "./command-menu-navigation-icon"

interface CommandMenuFooterProps {
	className?: string
}

export const CommandMenuFooter = ({ className }: CommandMenuFooterProps) => (
	<footer
		className={cx(
			"absolute inset-x-0 bottom-0 flex items-center justify-between gap-x-3 bg-alpha-white/80 p-2 pl-4.5 ring-1 ring-secondary_alt backdrop-blur-lg max-md:hidden",
			className,
		)}
	>
		<div className="flex gap-4">
			<div className="flex items-center gap-2">
				<div className="flex gap-1.5">
					<CommandMenuNavigationIcon type="icon" icon={ArrowUp} />
					<CommandMenuNavigationIcon type="icon" icon={ArrowDown} />
				</div>
				<span className="text-sm font-semibold text-quaternary">to navigate</span>
			</div>
			<div className="flex items-center gap-2">
				<CommandMenuNavigationIcon type="icon" icon={CornerDownLeft} />
				<span className="text-sm font-semibold text-quaternary">to select</span>
			</div>
			<div className="flex items-center gap-2">
				<CommandMenuNavigationIcon type="text" label="esc" />
				<span className="text-sm font-semibold text-quaternary">to close</span>
			</div>
			<div className="flex items-center gap-2">
				<CommandMenuNavigationIcon type="icon" icon={ArrowLeft} />
				<span className="text-sm font-semibold text-quaternary">return to parent</span>
			</div>
		</div>
		<Button size="sm" color="tertiary" iconLeading={Settings01} />
	</footer>
)
