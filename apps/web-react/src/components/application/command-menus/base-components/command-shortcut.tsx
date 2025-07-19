import { ArrowRight } from "@untitledui/icons"
import { Fragment } from "react"
import { cx } from "@/utils/cx"

interface CommandShortcutProps {
	keys: string[]
	withThen?: boolean
	className?: string
}

export const CommandShortcut = ({ keys, withThen, className }: CommandShortcutProps) => {
	return (
		<div className={cx("flex items-center gap-x-1", className)}>
			{keys.map((key, index) => (
				<Fragment key={index}>
					{index !== 0 && (
						<div className="flex items-center gap-x-1 text-quaternary">
							{withThen && <span className="text-sm font-medium">then</span>}
							<ArrowRight size={16} strokeWidth={2.2} />
						</div>
					)}
					<div className="min-w-6 rounded-[4px] bg-secondary_alt px-1 py-0.5 text-center text-sm font-medium text-tertiary ring-1 ring-secondary ring-inset">
						{key.toUpperCase()}
					</div>
				</Fragment>
			))}
		</div>
	)
}
