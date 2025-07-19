// icons/svgs/duo-stroke/general

import type React from "react"
import type { SVGProps } from "react"

export const IconUfoDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M16.56 7.44C19.79 8.102 22 9.447 22 11c0 2.21-4.477 4-10 4S2 13.21 2 11c0-1.552 2.21-2.897 5.44-3.56"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="m4 17-1 2m9-1v3m8-4 1 2M12 4c3.349 0 5.275 3.532 4.964 6.54-1.463.292-3.157.46-4.964.46-1.806 0-3.501-.168-4.964-.46C6.726 7.531 8.651 4 12 4Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconUfoDuoStroke
