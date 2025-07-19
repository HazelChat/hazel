// icons/svgs/solid/apps-&-social

import type React from "react"
import type { SVGProps } from "react"

export const IconVercel: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M13.724 2.959c-.774-1.315-2.675-1.315-3.448 0L2.025 16.986C1.24 18.32 2.202 20 3.748 20h16.504c1.546 0 2.508-1.68 1.723-3.014z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconVercel
