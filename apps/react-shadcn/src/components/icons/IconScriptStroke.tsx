// icons/svgs/stroke/development

import type React from "react"
import type { SVGProps } from "react"

export const IconScriptStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="m9 11 2-2-2-2m5 4h2m-.357 9.979A3 3 0 0 1 16 15H6c-.35 0-.687.06-1 .17m10.643 5.809c.978-.037 1.629-.138 2.173-.415a4 4 0 0 0 1.748-1.748C20 17.96 20 16.84 20 14.6V9.4c0-2.24 0-3.36-.436-4.216a4 4 0 0 0-1.748-1.748C16.96 3 15.84 3 13.6 3h-2.2c-2.24 0-3.36 0-4.216.436a4 4 0 0 0-1.748 1.748C5 6.04 5 7.16 5 9.4v5.77m10.643 5.809C15.083 21 14.416 21 13.6 21H6a3 3 0 0 1-1-5.83"
				fill="none"
			/>
		</svg>
	)
}

export default IconScriptStroke
