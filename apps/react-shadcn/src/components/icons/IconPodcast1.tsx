// icons/svgs/contrast/media

import type React from "react"
import type { SVGProps } from "react"

export const IconPodcast1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g fill="currentColor" opacity=".28">
				<path fill="currentColor" d="M10.633 17.897a1.442 1.442 0 1 1 2.735 0L12 22z" />
				<path fill="currentColor" d="M11 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z" />
			</g>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M8 14a5 5 0 1 1 8 0m1 4.483a9 9 0 1 0-10 0M12 22l1.367-4.103a1.441 1.441 0 1 0-2.735 0zm0-10a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"
			/>
		</svg>
	)
}

export default IconPodcast1
