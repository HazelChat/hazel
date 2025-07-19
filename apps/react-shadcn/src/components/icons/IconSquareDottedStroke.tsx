// icons/svgs/stroke/general

import type React from "react"
import type { SVGProps } from "react"

export const IconSquareDottedStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12 3v.01m0 17.98V21m9-9.005v.01m-18-.01v.01m.457-5.308v.01m17.087-.01v.01M3.457 17.277v.01m17.087-.01v.01M17.3 3.451v.01m-10.587-.01v.01M17.3 20.531v.01m-10.587-.01v.01"
				fill="none"
			/>
		</svg>
	)
}

export default IconSquareDottedStroke
