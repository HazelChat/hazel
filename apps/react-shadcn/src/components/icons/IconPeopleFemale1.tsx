// icons/svgs/contrast/users

import type React from "react"
import type { SVGProps } from "react"

export const IconPeopleFemale1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				fillRule="evenodd"
				d="M12 7.034a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM11.998 10a3.74 3.74 0 0 0-3.648 2.926L7 19h2.115l.756 1.638a2.345 2.345 0 0 0 4.258 0L14.885 19h2.1l-1.338-6.068A3.74 3.74 0 0 0 11.997 10z"
				clipRule="evenodd"
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
				d="M8.35 12.926a3.737 3.737 0 0 1 7.297.006L16.986 19h-2.1l-.757 1.638a2.345 2.345 0 0 1-4.258 0L9.115 19H7z"
			/>
		</svg>
	)
}

export default IconPeopleFemale1
