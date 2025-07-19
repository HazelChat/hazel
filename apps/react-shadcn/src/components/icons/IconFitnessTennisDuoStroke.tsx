// icons/svgs/duo-stroke/sports

import type React from "react"
import type { SVGProps } from "react"

export const IconFitnessTennisDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				strokeLinejoin="round"
				strokeWidth="2"
				d="M12 4a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M19 6c-.828 0-1.5-.895-1.5-2s.672-2 1.5-2c.829 0 1.5.895 1.5 2s-.67 2-1.5 2Zm0 0v5"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="m15.5 22-1.37-4.565a1 1 0 0 0-.544-.623l-3.37-1.532a2 2 0 0 1-1.04-2.539L11 8H8.472a4 4 0 0 0-3.578 2.211L4 12"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="m7.5 17-.906 1.812a5 5 0 0 1-1.699 1.924L3 22"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="m14 9.5.406.61a2 2 0 0 0 1.664.89H19"
				opacity=".28"
				fill="none"
			/>
		</svg>
	)
}

export default IconFitnessTennisDuoStroke
