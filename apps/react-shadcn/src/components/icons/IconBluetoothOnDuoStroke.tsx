// icons/svgs/duo-stroke/media

import type React from "react"
import type { SVGProps } from "react"

export const IconBluetoothOnDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M4 7.935c2.614 1.08 5.125 2.222 7.484 3.605m0 0q.386.226.765.46m-.765-.46-.305-9.023c0-.384.418-.633.774-.462 2.055.992 3.92 2.093 5.577 3.692a1.51 1.51 0 0 1 0 2.188c-1.643 1.586-3.411 2.91-5.28 4.065m-.766-.46v.92m.765-.46c1.87 1.155 3.638 2.48 5.281 4.065a1.51 1.51 0 0 1 0 2.188c-1.655 1.597-3.528 2.703-5.577 3.692-.356.171-.774-.078-.774-.462l.305-9.023m.765-.46q-.38.235-.765.46m0 0c-2.36 1.383-4.87 2.525-7.484 3.605"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M11.953 21.945c2.05-.989 3.922-2.095 5.577-3.691a1.51 1.51 0 0 0 0-2.19c-1.643-1.584-3.41-2.908-5.28-4.064m-.297-9.945c2.055.992 3.92 2.093 5.577 3.692a1.51 1.51 0 0 1 0 2.188c-1.643 1.586-3.411 2.91-5.28 4.065M4 7.935c2.614 1.08 5.125 2.222 7.484 3.605q.386.226.765.46m0 0q-.38.235-.765.46c-2.36 1.383-4.87 2.525-7.484 3.605"
				fill="none"
			/>
		</svg>
	)
}

export default IconBluetoothOnDuoStroke
