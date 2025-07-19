// icons/svgs/duo-solid/users

import type React from "react"
import type { SVGProps } from "react"

export const IconCommunityDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M2.656 10.618A5.7 5.7 0 0 1 7.328 8.19c1.932 0 3.639.959 4.673 2.426a5.7 5.7 0 0 1 4.672-2.426c1.93 0 3.638.959 4.672 2.426M2.656 21a5.7 5.7 0 0 1 4.672-2.426c1.932 0 3.639.958 4.673 2.426a5.7 5.7 0 0 1 4.672-2.426c1.93 0 3.638.958 4.672 2.426"
				opacity=".28"
			/>
			<path fill="currentColor" d="M7.328 2a3.596 3.596 0 1 0 0 7.191 3.596 3.596 0 0 0 0-7.191Z" />
			<path fill="currentColor" d="M16.672 2a3.596 3.596 0 1 0 0 7.191 3.596 3.596 0 0 0 0-7.191Z" />
			<path fill="currentColor" d="M7.328 12.383a3.596 3.596 0 1 0 0 7.19 3.596 3.596 0 0 0 0-7.19Z" />
			<path fill="currentColor" d="M16.672 12.383a3.596 3.596 0 1 0 0 7.19 3.596 3.596 0 0 0 0-7.19Z" />
		</svg>
	)
}

export default IconCommunityDuoSolid
