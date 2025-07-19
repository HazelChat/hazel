// icons/svgs/stroke/communication

import type React from "react"
import type { SVGProps } from "react"

export const IconSendPlaneSlantStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="m9.54 14.46-5.477-2.985c-1.429-.78-1.414-2.834.025-3.574a51.4 51.4 0 0 1 12.558-4.507c1.254-.274 2.687-.83 3.739.221 1.052 1.052.495 2.485.221 3.74A51.4 51.4 0 0 1 16.1 19.911c-.74 1.44-2.794 1.454-3.574.025zm0 0 3.308-3.308"
				fill="none"
			/>
		</svg>
	)
}

export default IconSendPlaneSlantStroke
