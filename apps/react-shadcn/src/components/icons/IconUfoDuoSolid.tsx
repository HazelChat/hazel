// icons/svgs/duo-solid/general

import type React from "react"
import type { SVGProps } from "react"

export const IconUfoDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M8.372 7.8a1 1 0 0 0-1.134-1.34c-1.687.346-3.175.883-4.27 1.585C1.909 8.725 1 9.713 1 11c0 .916.468 1.687 1.099 2.284.628.594 1.484 1.083 2.459 1.473C6.512 15.54 9.144 16 12 16s5.488-.461 7.442-1.243c.975-.39 1.83-.879 2.46-1.473C22.531 12.687 23 11.916 23 11c0-1.287-.908-2.275-1.969-2.955-1.094-.702-2.582-1.239-4.269-1.585a1 1 0 0 0-1.134 1.34c.232.6.356 1.246.37 1.897C14.79 9.891 13.436 10 12 10s-2.79-.11-3.999-.303A5.6 5.6 0 0 1 8.372 7.8Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="m4 17-1 2m9-1v3m8-4 1 2M12 4c2.03 0 3.778 1.412 4.56 3.44a6.7 6.7 0 0 1 .404 3.1C15.5 10.831 13.807 11 12 11c-1.806 0-3.501-.168-4.964-.46a6.7 6.7 0 0 1 .403-3.1C8.222 5.411 9.97 4 12 4Z"
			/>
		</svg>
	)
}

export default IconUfoDuoSolid
