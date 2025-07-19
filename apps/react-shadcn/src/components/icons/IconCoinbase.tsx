// icons/svgs/solid/apps-&-social

import type React from "react"
import type { SVGProps } from "react"

export const IconCoinbase: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75c4.775 0 8.747-3.432 9.587-7.963a.75.75 0 0 0-.738-.887h-5.48a.75.75 0 0 0-.674.42 3 3 0 1 1 0-2.64.75.75 0 0 0 .673.42h5.481a.75.75 0 0 0 .738-.887C20.747 5.682 16.775 2.25 12 2.25Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconCoinbase
