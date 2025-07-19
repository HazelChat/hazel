// icons/svgs/contrast/devices

import type React from "react"
import type { SVGProps } from "react"

export const IconIphone: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12.6 2h-1.2c-2.24 0-3.36 0-4.216.436a4 4 0 0 0-1.748 1.748C5 5.04 5 6.16 5 8.4v7.2c0 2.24 0 3.36.436 4.216a4 4 0 0 0 1.748 1.748C8.04 22 9.16 22 11.4 22h1.2c2.24 0 3.36 0 4.216-.436a4 4 0 0 0 1.748-1.748C19 18.96 19 17.84 19 15.6V8.4c0-2.24 0-3.36-.436-4.216a4 4 0 0 0-1.748-1.748C15.96 2 14.84 2 12.6 2Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M13 2h-2m2 0c1.977.002 3.013.027 3.816.436a4 4 0 0 1 1.748 1.748C19 5.04 19 6.16 19 8.4v7.2c0 2.24 0 3.36-.436 4.216a4 4 0 0 1-1.748 1.748C15.96 22 14.84 22 12.6 22h-1.2c-2.24 0-3.36 0-4.216-.436a4 4 0 0 1-1.748-1.748C5 18.96 5 17.84 5 15.6V8.4c0-2.24 0-3.36.436-4.216a4 4 0 0 1 1.748-1.748C7.987 2.026 9.024 2.002 11 2m2 0v1h-2V2"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M10 19h4"
			/>
		</svg>
	)
}

export default IconIphone
