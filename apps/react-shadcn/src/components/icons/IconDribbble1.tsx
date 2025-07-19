// icons/svgs/contrast/apps-&-social

import type React from "react"
import type { SVGProps } from "react"

export const IconDribbble1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<path fill="currentColor" d="M21 12a9 9 0 1 0-18 0 9 9 0 0 0 18 0Z" opacity=".28" />
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M12.195 9.418a16.43 16.43 0 0 1-9.184 2.127m9.184-2.127a35 35 0 0 1 1.661 3.677m-1.661-3.677a35 35 0 0 0-3.726-5.699m3.726 5.699a16.6 16.6 0 0 0 5.181-4.637m-3.52 8.314a16.65 16.65 0 0 1 7.129-.574m-7.129.574a35 35 0 0 1 1.894 7.089m-1.894-7.089a16.5 16.5 0 0 0-8.02 5.463M8.469 3.719A9 9 0 0 1 12 3a8.96 8.96 0 0 1 5.376 1.781M8.469 3.72a9 9 0 0 0-5.458 7.826M17.376 4.78a8.99 8.99 0 0 1 3.61 7.74m0 0a9 9 0 0 1-5.236 7.663m0 0A9 9 0 0 1 12 21a8.97 8.97 0 0 1-6.164-2.442m0 0a8.98 8.98 0 0 1-2.825-7.013"
			/>
		</svg>
	)
}

export default IconDribbble1
