// icons/svgs/stroke/files-&-folders

import type React from "react"
import type { SVGProps } from "react"

export const IconReceipt02Stroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M8 7h8m-8 4h8m-8 4h4m8 4.527V8.4c0-2.24 0-3.36-.436-4.216a4 4 0 0 0-1.748-1.748C16.96 2 15.84 2 13.6 2h-3.2c-2.24 0-3.36 0-4.216.436a4 4 0 0 0-1.748 1.748C4 5.04 4 6.16 4 8.4v11.127c0 .754 0 1.13.141 1.367a1 1 0 0 0 .785.485c.275.02.612-.148 1.286-.485.607-.303.91-.455 1.228-.535a3 3 0 0 1 1.155-.06c.324.046.641.165 1.277.403l.443.166c.623.234.935.35 1.256.397.284.041.574.041.858 0 .32-.046.633-.163 1.256-.397l.443-.166c.636-.238.953-.358 1.277-.404a3 3 0 0 1 1.155.06c.318.08.621.232 1.228.536.674.337 1.011.506 1.286.485a1 1 0 0 0 .785-.485c.141-.237.141-.613.141-1.367Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconReceipt02Stroke
