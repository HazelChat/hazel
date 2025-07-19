// icons/svgs/solid/chart-&-graph

import type React from "react"
import type { SVGProps } from "react"

export const IconPiechartRose: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<path
				d="M13.191 2.08a1 1 0 0 0-1.196.981v7.94a1 1 0 0 0 1 1h7.94a1 1 0 0 0 .98-1.197 11.15 11.15 0 0 0-8.724-8.724Z"
				fill="currentColor"
			/>
			<path
				d="M9.995 6.66a1 1 0 0 0-1.3-.954A7.66 7.66 0 0 0 3.7 10.7a1 1 0 0 0 .954 1.3h4.34a1 1 0 0 0 1-1z"
				fill="currentColor"
			/>
			<path
				d="M19.631 14h-6.636a1 1 0 0 0-1 1v6.637a1 1 0 0 0 1.225.975 9.88 9.88 0 0 0 7.386-7.387A1 1 0 0 0 19.63 14Z"
				fill="currentColor"
			/>
			<path
				d="M3.5 14a1 1 0 0 0-.966 1.258 8.77 8.77 0 0 0 6.204 6.204 1 1 0 0 0 1.257-.966V15a1 1 0 0 0-1-1z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconPiechartRose
