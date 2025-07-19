// icons/svgs/duo-stroke/files-&-folders

import type React from "react"
import type { SVGProps } from "react"

export const IconFileCodeDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M13.6 22h-3.2c-2.24 0-3.36 0-4.216-.436a4 4 0 0 1-1.748-1.748C4 18.96 4 17.84 4 15.6V8.4c0-2.24 0-3.36.436-4.216a4 4 0 0 1 1.748-1.748C7.04 2 8.16 2 10.4 2h1.949c.978 0 1.468 0 1.928.11.408.099.798.26 1.156.48.404.247.75.593 1.442 1.285l1.25 1.25c.692.692 1.038 1.038 1.286 1.442a4 4 0 0 1 .479 1.156c.11.46.11.95.11 1.928V15.6c0 2.24 0 3.36-.436 4.216a4 4 0 0 1-1.748 1.748C16.96 22 15.84 22 13.6 22Z"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M13.714 16.836a11.6 11.6 0 0 0 2.226-2.116.27.27 0 0 0 0-.34 11.6 11.6 0 0 0-2.226-2.116m-3.428 0A11.6 11.6 0 0 0 8.06 14.38a.27.27 0 0 0 0 .34c.642.797 1.39 1.509 2.226 2.115m7.84-11.71-1.251-1.25c-.692-.692-1.038-1.038-1.442-1.285a4 4 0 0 0-1.156-.48A3 3 0 0 0 14 2.059V3.2c0 1.68 0 2.52.327 3.162a3 3 0 0 0 1.311 1.311C16.28 8 17.12 8 18.8 8h1.142a3 3 0 0 0-.052-.277 4 4 0 0 0-.48-1.156c-.247-.404-.593-.75-1.285-1.441Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconFileCodeDuoStroke
