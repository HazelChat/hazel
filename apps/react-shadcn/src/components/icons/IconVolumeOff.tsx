// icons/svgs/solid/media

import type React from "react"
import type { SVGProps } from "react"

export const IconVolumeOff: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M22.707 2.707a1 1 0 0 0-1.414-1.414l-3.33 3.33c-.336-2.22-2.952-3.411-4.87-2.041l-2.813 2.01a3.9 3.9 0 0 1-1.514.655A5.93 5.93 0 0 0 4 11.06v1.918c0 1.54.592 2.963 1.579 4.028l-4.286 4.286a1 1 0 1 0 1.414 1.414z"
				fill="currentColor"
			/>
			<path
				d="M18 12.648a1 1 0 0 0-1.707-.707l-6.05 6.05a1 1 0 0 0 .125 1.521l2.724 1.946C15.147 22.925 18 21.457 18 18.932z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconVolumeOff
