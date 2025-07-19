// icons/svgs/solid/general

import type React from "react"
import type { SVGProps } from "react"

export const IconSwipeLeftHand: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M16.749 2.906a1 1 0 1 0-.848-1.811c-.868.406-1.678.922-2.41 1.535a1.3 1.3 0 0 0-.303.363 1 1 0 0 0-.156.836q.03.214.133.415a11 11 0 0 0 1.628 2.348 1 1 0 0 0 1.483-1.341l-.116-.131c1.835.61 3.503 1.59 4.913 2.852a1 1 0 1 0 1.334-1.49 16 16 0 0 0-6.03-3.392 9 9 0 0 1 .372-.184Z"
				fill="currentColor"
			/>
			<path
				d="M10.871 3.832a3 3 0 1 0-5.795 1.553l1.901 7.097a4.16 4.16 0 0 0-4.662.589 1.79 1.79 0 0 0-.01 2.67l5.789 5.208c2.24 2.015 5.542 2.139 8.231 1.17 2.69-.97 5.134-3.17 5.433-6.236.154-1.592-.08-3.486-.907-4.982-.419-.758-1.006-1.442-1.8-1.906-.802-.47-1.756-.68-2.837-.575l-4.009.389z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconSwipeLeftHand
