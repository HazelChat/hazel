// icons/svgs/stroke/apps-&-social

import type React from "react"
import type { SVGProps } from "react"

export const IconNpmLogoSymbolStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M14 11v9m0 0h-3.6c-2.24 0-3.36 0-4.216-.436a4 4 0 0 1-1.748-1.748C4 16.96 4 15.84 4 13.6v-3.2c0-2.24 0-3.36.436-4.216a4 4 0 0 1 1.748-1.748C7.04 4 8.16 4 10.4 4h3.2c2.24 0 3.36 0 4.216.436a4 4 0 0 1 1.748 1.748C20 7.04 20 8.16 20 10.4v3.2c0 2.24 0 3.36-.436 4.216a4 4 0 0 1-1.748 1.748c-.803.41-1.84.434-3.816.436Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconNpmLogoSymbolStroke
