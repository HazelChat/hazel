// icons/svgs/contrast/general

import type React from "react"
import type { SVGProps } from "react"

export const IconUfo1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12 15c5.523 0 10-1.79 10-4 0-1.552-2.21-2.897-5.44-3.56a6.7 6.7 0 0 1 .404 3.1C15.5 10.832 13.807 11 12 11c-1.806 0-3.501-.168-4.964-.46a6.7 6.7 0 0 1 .403-3.1C4.21 8.102 2 9.447 2 11c0 2.21 4.477 4 10 4Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M16.56 7.44C15.779 5.411 14.03 4 12 4S8.222 5.412 7.44 7.44m9.12 0C19.79 8.102 22 9.447 22 11c0 2.21-4.477 4-10 4S2 13.21 2 11c0-1.552 2.21-2.897 5.44-3.56m9.12 0a6.7 6.7 0 0 1 .404 3.1C15.5 10.831 13.807 11 12 11c-1.806 0-3.501-.168-4.964-.46a6.7 6.7 0 0 1 .403-3.1M4 17l-1 2m9-1v3m8-4 1 2"
			/>
		</svg>
	)
}

export default IconUfo1
