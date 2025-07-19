// icons/svgs/stroke/media

import type React from "react"
import type { SVGProps } from "react"

export const IconPodcastStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M8 14a5 5 0 1 1 8 0m1 4.483a9 9 0 1 0-10 0M12 22l1.367-4.103a1.441 1.441 0 1 0-2.735 0zm0-10a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconPodcastStroke
