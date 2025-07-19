// icons/svgs/stroke/communication

import type React from "react"
import type { SVGProps } from "react"

export const IconEnvelopeArrowDownStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M17.428 18.592c.635.846 1.371 1.61 2.192 2.275a.6.6 0 0 0 .38.135m2.571-2.41a13 13 0 0 1-2.19 2.275.6.6 0 0 1-.381.135m0 0v-6M13.686 20H10c-2.8 0-4.2 0-5.27-.545a5 5 0 0 1-2.185-2.185C2 16.2 2 14.8 2 12c0-1.994 0-3.278.197-4.238m19.606 0-5.508 3.505c-1.557.99-2.335 1.486-3.171 1.678a5 5 0 0 1-2.248 0c-.836-.192-1.614-.688-3.171-1.678L2.197 7.762m19.606 0a4 4 0 0 0-.348-1.032 5 5 0 0 0-2.185-2.185C18.2 4 16.8 4 14 4h-4c-2.8 0-4.2 0-5.27.545A5 5 0 0 0 2.545 6.73a4 4 0 0 0-.348 1.032m19.606 0c.181.883.196 2.04.197 3.773"
				fill="none"
			/>
		</svg>
	)
}

export default IconEnvelopeArrowDownStroke
