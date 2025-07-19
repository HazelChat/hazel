// icons/svgs/contrast/general

import type React from "react"
import type { SVGProps } from "react"

export const IconMagicWand1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="m3.584 19.106 1.06 1.06a1 1 0 0 0 1.415 0l9.363-9.363a1 1 0 0 0 0-1.414l-1.06-1.06a1 1 0 0 0-1.415 0L3.584 17.69a1 1 0 0 0 0 1.415Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeWidth="2"
				d="m16.13 10.095 3.786-3.786a1 1 0 0 0 0-1.414l-1.06-1.06a1 1 0 0 0-1.415 0L13.654 7.62m2.475 2.474L6.06 20.165a1 1 0 0 1-1.414 0l-1.06-1.06a1 1 0 0 1 0-1.414l10.07-10.07m2.474 2.474-2.475-2.474"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M20.5 12c.319.808.67 1.172 1.5 1.5-.83.328-1.181.692-1.5 1.5-.319-.808-.67-1.172-1.5-1.5.83-.328 1.181-.692 1.5-1.5Z"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M15.5 18c.319.808.67 1.172 1.5 1.5-.83.328-1.181.692-1.5 1.5-.319-.808-.67-1.172-1.5-1.5.83-.328 1.181-.692 1.5-1.5Z"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M7.475 2c.531 1.347 1.116 1.954 2.5 2.5-1.384.546-1.969 1.153-2.5 2.5-.531-1.347-1.116-1.954-2.5-2.5 1.384-.546 1.969-1.153 2.5-2.5Z"
			/>
		</svg>
	)
}

export default IconMagicWand1
