// icons/svgs/solid/general

import type React from "react"
import type { SVGProps } from "react"

export const IconCampFire: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M2 21 12 5.167m0 0L14 2m-2 3.167L22 21M12 5.167 10 2"
				fill="none"
			/>
			<path
				fill="currentColor"
				fillRule="evenodd"
				d="M13.134 13.338a1 1 0 0 0-1.496.647 6.4 6.4 0 0 1-.575 1.592 8 8 0 0 1-.39-.504 1 1 0 0 0-1.629-.01C8.481 15.845 8 16.874 8 18.034c0 .958.322 1.947 1.006 2.709C9.706 21.52 10.732 22 12 22s2.293-.48 2.994-1.258c.684-.762 1.006-1.75 1.006-2.709 0-1.148-.47-2.166-1.025-2.943s-1.25-1.394-1.841-1.752Z"
				clipRule="evenodd"
				stroke="currentColor"
			/>
		</svg>
	)
}

export default IconCampFire
