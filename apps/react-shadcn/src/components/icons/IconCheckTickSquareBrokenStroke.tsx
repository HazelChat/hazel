// icons/svgs/stroke/general

import type React from "react"
import type { SVGProps } from "react"

export const IconCheckTickSquareBrokenStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M20.995 10.34C21 10.833 21 11.382 21 12c0 2.796 0 4.194-.457 5.296a6 6 0 0 1-3.247 3.247C16.194 21 14.796 21 12 21s-4.193 0-5.296-.457a6 6 0 0 1-3.247-3.247C3 16.194 3 14.796 3 12s0-4.193.457-5.296a6 6 0 0 1 3.247-3.247C7.807 3 9.204 3 12 3c2.552 0 3.939 0 5 .347m4.035 2.056-.793.541a25.64 25.64 0 0 0-7.799 8.447l-.359.629L8.61 11"
				fill="none"
			/>
		</svg>
	)
}

export default IconCheckTickSquareBrokenStroke
