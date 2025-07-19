// icons/svgs/duo-stroke/media

import type React from "react"
import type { SVGProps } from "react"

export const IconPhotoImageArrowLeftDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12.453 21H10c-2.8 0-4.2 0-5.27-.545a5 5 0 0 1-2.185-2.185C2 17.2 2 15.8 2 13v-2c0-2.8 0-4.2.545-5.27A5 5 0 0 1 4.73 3.545C5.8 3 7.2 3 10 3h4c2.8 0 4.2 0 5.27.545a5 5 0 0 1 2.185 2.185C22 6.8 22 8.2 22 11v2c0 .62 0 1.173-.006 1.668"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				fillRule="evenodd"
				d="M15.358 20.008a1.6 1.6 0 0 1 0-2.02 14 14 0 0 1 2.452-2.36 1 1 0 0 1 1.2 1.6q-.483.361-.927.77H22a1 1 0 0 1 0 2h-3.916q.443.41.926.772a1 1 0 1 1-1.2 1.6 14 14 0 0 1-2.452-2.362Z"
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

export default IconPhotoImageArrowLeftDuoStroke
