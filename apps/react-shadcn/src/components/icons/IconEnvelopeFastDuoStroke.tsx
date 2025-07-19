// icons/svgs/duo-stroke/communication

import type React from "react"
import type { SVGProps } from "react"

export const IconEnvelopeFastDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M4 20h10c2.8 0 4.2 0 5.27-.545a5 5 0 0 0 2.185-2.185C22 16.2 22 14.8 22 12c0-1.994 0-3.278-.197-4.239"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M11 20H4m-3-8h1m0 4h5m3-12h4c2.8 0 4.2 0 5.27.545a5 5 0 0 1 2.185 2.185c.157.308.269.643.348 1.032l-5.508 3.505c-1.557.99-2.335 1.486-3.171 1.678a5 5 0 0 1-2.248 0c-.836-.192-1.614-.688-3.171-1.678l-4.587-2.92c-.555-.352-.872-1.031-.573-1.617A5 5 0 0 1 4.73 4.545C5.8 4 7.2 4 10 4Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconEnvelopeFastDuoStroke
