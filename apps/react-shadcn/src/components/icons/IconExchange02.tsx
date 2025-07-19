// icons/svgs/solid/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconExchange02: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M17.028 5.075a1 1 0 0 0-1.578-.89 21.6 21.6 0 0 0-4.074 3.78 1.62 1.62 0 0 0 0 2.07 21.6 21.6 0 0 0 4.074 3.78 1 1 0 0 0 1.578-.89l-.165-2.2A23 23 0 0 1 16.82 10H20a1 1 0 1 0 0-2h-3.18q.015-.363.043-.725z"
				fill="currentColor"
			/>
			<path
				d="M6.972 11.075a1 1 0 0 1 1.578-.89 21.6 21.6 0 0 1 4.074 3.78 1.62 1.62 0 0 1 0 2.07 21.6 21.6 0 0 1-4.074 3.78 1 1 0 0 1-1.578-.89l.165-2.2q.028-.362.043-.725H4a1 1 0 1 1 0-2h3.18q-.015-.363-.043-.725z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconExchange02
