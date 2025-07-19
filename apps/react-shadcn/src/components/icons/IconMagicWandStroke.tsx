// icons/svgs/stroke/general

import type React from "react"
import type { SVGProps } from "react"

export const IconMagicWandStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				strokeWidth="2"
				d="m16.13 10.095 3.786-3.786a1 1 0 0 0 0-1.414l-1.06-1.06a1 1 0 0 0-1.415 0L13.654 7.62m2.475 2.474L6.06 20.165a1 1 0 0 1-1.414 0l-1.06-1.06a1 1 0 0 1 0-1.414l10.07-10.07m2.474 2.474-2.475-2.474"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M20.5 12c.319.808.67 1.172 1.5 1.5-.83.328-1.181.692-1.5 1.5-.319-.808-.67-1.172-1.5-1.5.83-.328 1.181-.692 1.5-1.5Z"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M15.5 18c.319.808.67 1.172 1.5 1.5-.83.328-1.181.692-1.5 1.5-.319-.808-.67-1.172-1.5-1.5.83-.328 1.181-.692 1.5-1.5Z"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M7.475 2c.531 1.347 1.116 1.954 2.5 2.5-1.384.546-1.969 1.153-2.5 2.5-.531-1.347-1.116-1.954-2.5-2.5 1.384-.546 1.969-1.153 2.5-2.5Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconMagicWandStroke
