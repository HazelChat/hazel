// icons/svgs/stroke/general

import type React from "react"
import type { SVGProps } from "react"

export const IconNotebookStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12 5.066V21.5m0-16.434c3.025-1.1 7.005-1.71 10 0v15.5c-3.197-1.37-7.063-.401-10 .934m0-16.434c-3.025-1.1-7.005-1.71-10 0v15.5c3.197-1.37 7.063-.401 10 .934"
				fill="none"
			/>
		</svg>
	)
}

export default IconNotebookStroke
