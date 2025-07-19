// icons/svgs/stroke/media

import type React from "react"
import type { SVGProps } from "react"

export const IconPhotoImagePortraitStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M20 10.04c-1.31.049-2.258.159-3.1.406A11 11 0 0 0 9.447 17.9c-.304 1.032-.4 2.224-.431 4.052M20 10.039V10c0-2.8 0-4.2-.545-5.27a5 5 0 0 0-2.185-2.185C16.2 2 14.8 2 12 2s-4.2 0-5.27.545A5 5 0 0 0 4.545 4.73C4 5.8 4 7.2 4 10v4c0 2.8 0 4.2.545 5.27a5 5 0 0 0 2.185 2.185c.597.304 1.296.439 2.285.498M20 10.039V14c0 2.8 0 4.2-.545 5.27a5 5 0 0 1-2.185 2.185C16.2 22 14.8 22 12 22c-1.238 0-2.202 0-2.985-.047M9.5 8.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconPhotoImagePortraitStroke
