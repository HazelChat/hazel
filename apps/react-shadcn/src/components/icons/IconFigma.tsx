// icons/svgs/solid/apps-&-social

import type React from "react"
import type { SVGProps } from "react"

export const IconFigma: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M4.334 4.833A3.833 3.833 0 0 1 8.166 1h7.667a3.833 3.833 0 1 1 0 7.667H12v11.5a3.833 3.833 0 1 1-3.833-3.834 3.833 3.833 0 1 1 0-7.666 3.833 3.833 0 0 1-3.833-3.834Z"
				fill="currentColor"
			/>
			<path d="M12 12.5a3.833 3.833 0 1 0 7.667 0 3.833 3.833 0 0 0-7.667 0Z" fill="currentColor" />
		</svg>
	)
}

export default IconFigma
