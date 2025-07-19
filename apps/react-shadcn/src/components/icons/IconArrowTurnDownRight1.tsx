// icons/svgs/contrast/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconArrowTurnDownRight1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M15.141 20a25.2 25.2 0 0 0 4.684-4.505.79.79 0 0 0 0-.99A25.2 25.2 0 0 0 15.141 10c.16.935.241 1.402.303 1.87a24 24 0 0 1 0 6.26c-.062.468-.142.935-.303 1.87Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M15.649 15H12c-2.8 0-4.2 0-5.27-.545a5 5 0 0 1-2.185-2.185C4 11.2 4 9.8 4 7V4m11.649 11q0 1.57-.205 3.13c-.062.468-.142.935-.303 1.87a25.2 25.2 0 0 0 4.684-4.505.79.79 0 0 0 0-.99A25.2 25.2 0 0 0 15.141 10c.16.935.241 1.402.303 1.87q.204 1.56.205 3.13Z"
			/>
		</svg>
	)
}

export default IconArrowTurnDownRight1
