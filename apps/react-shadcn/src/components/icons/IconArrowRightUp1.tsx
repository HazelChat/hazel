// icons/svgs/contrast/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconArrowRightUp1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				fill="currentColor"
				d="M18.409 6.432c.286 2.589.235 5.21-.152 7.797l-4.03-4.455-4.456-4.03a30.2 30.2 0 0 1 7.797-.153.95.95 0 0 1 .84.84Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="m14.227 9.774 4.03 4.455c.387-2.588.438-5.208.152-7.797a.95.95 0 0 0-.84-.84 30.2 30.2 0 0 0-7.797.151zm0 0L5.409 18.59"
			/>
		</svg>
	)
}

export default IconArrowRightUp1
