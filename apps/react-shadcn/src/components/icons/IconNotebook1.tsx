// icons/svgs/contrast/general

import type React from "react"
import type { SVGProps } from "react"

export const IconNotebook1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M2 20.566v-15.5c2.995-1.71 6.975-1.1 10 0 3.025-1.1 7.005-1.71 10 0v15.5c-3.197-1.37-7.063-.401-10 .934-2.937-1.335-6.803-2.304-10-.934Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M12 21.5V5.066M12 21.5c2.937-1.335 6.803-2.304 10-.934v-15.5c-2.995-1.71-6.975-1.1-10 0M12 21.5c-2.937-1.335-6.803-2.304-10-.934v-15.5c2.995-1.71 6.975-1.1 10 0"
			/>
		</svg>
	)
}

export default IconNotebook1
