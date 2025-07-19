// icons/svgs/stroke/building

import type React from "react"
import type { SVGProps } from "react"

export const IconBedStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M3 20v-5c0-1.4 0-2.1.272-2.635a2.5 2.5 0 0 1 1.093-1.092C4.9 11 5.6 11 7 11h10c1.4 0 2.1 0 2.635.273a2.5 2.5 0 0 1 1.092 1.092C21 12.9 21 13.6 21 15v5"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M5 11V9.2c0-1.12 0-1.68.218-2.108a2 2 0 0 1 .874-.874C6.52 6 7.08 6 8.2 6h7.6c1.12 0 1.68 0 2.108.218a2 2 0 0 1 .874.874C19 7.52 19 8.08 19 9.2V11"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M3 18h18"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M12 6v5"
				fill="none"
			/>
		</svg>
	)
}

export default IconBedStroke
