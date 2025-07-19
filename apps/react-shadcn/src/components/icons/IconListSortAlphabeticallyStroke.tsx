// icons/svgs/stroke/general

import type React from "react"
import type { SVGProps } from "react"

export const IconListSortAlphabeticallyStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12 12h9m-9 6h9M12 6h9M3 10V7.304c0-1.391.847-2.643 2.139-3.16a.97.97 0 0 1 .722 0A3.4 3.4 0 0 1 8 7.305V10M3 8h5m-5 7 .106-.021a12.2 12.2 0 0 1 4.788 0c.045.01.062.065.03.098L3.13 19.87c-.039.04-.003.106.051.095a11.8 11.8 0 0 1 4.636 0L8 20"
				fill="none"
			/>
		</svg>
	)
}

export default IconListSortAlphabeticallyStroke
