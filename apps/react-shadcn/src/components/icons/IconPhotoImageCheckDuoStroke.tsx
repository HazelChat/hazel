// icons/svgs/duo-stroke/media

import type React from "react"
import type { SVGProps } from "react"

export const IconPhotoImageCheckDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M22 12.5V11c0-2.8 0-4.2-.545-5.27a5 5 0 0 0-2.185-2.185C18.2 3 16.8 3 14 3h-4c-2.8 0-4.2 0-5.27.545A5 5 0 0 0 2.545 5.73C2 6.8 2 8.2 2 11v2c0 2.8 0 4.2.545 5.27a5 5 0 0 0 2.185 2.185C5.8 21 7.2 21 10 21h2.324"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				fillRule="evenodd"
				d="M22.826 15.936a1 1 0 0 1-.262 1.39 12.7 12.7 0 0 0-3.851 4.17 1 1 0 0 1-1.575.212l-2.135-2.133a1 1 0 1 1 1.414-1.415l1.25 1.25a14.7 14.7 0 0 1 3.769-3.736 1 1 0 0 1 1.39.262Z"
				clipRule="evenodd"
			/>
			<path
				fill="currentColor"
				d="M7.096 19.956q.412.024.94.034.489.008 1.072.01a10.5 10.5 0 0 1 9.318-8.945C18.95 11.001 19.582 11 21 11l-.001-.996A59 59 0 0 0 20.988 9h-.066c-1.32 0-2.062 0-2.7.066a12.5 12.5 0 0 0-11.126 10.89Z"
			/>
			<path
				fill="currentColor"
				fillRule="evenodd"
				d="M5.5 8.5a2 2 0 1 1 4 0 2 2 0 0 1-4 0Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}

export default IconPhotoImageCheckDuoStroke
