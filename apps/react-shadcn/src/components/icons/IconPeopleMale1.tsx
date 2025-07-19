// icons/svgs/contrast/users

import type React from "react"
import type { SVGProps } from "react"

export const IconPeopleMale1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M14.5 4.534a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm-7.06 8.85a4 4 0 0 1 3.944-3.337h1.225a4 4 0 0 1 3.946 3.345l.44 2.655L15 16l-.671 4.027a2.36 2.36 0 0 1-4.658 0L9 16H7z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M14.5 4.535a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M7.44 13.385a4 4 0 0 1 3.944-3.338h1.225a4 4 0 0 1 3.946 3.345l.44 2.655L15 16l-.671 4.027a2.36 2.36 0 0 1-4.658 0L9 16H7z"
			/>
		</svg>
	)
}

export default IconPeopleMale1
