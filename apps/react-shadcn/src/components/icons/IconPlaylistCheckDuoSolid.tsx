// icons/svgs/duo-solid/media

import type React from "react"
import type { SVGProps } from "react"

export const IconPlaylistCheckDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M7 3.001 17 3a1 1 0 1 0 0-2L7 1.001a1 1 0 0 0 0 2ZM5 5a1 1 0 0 0 0 2h14a1 1 0 1 0 0-2z"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				fillRule="evenodd"
				d="M6.96 9h10.08c.666 0 1.226 0 1.683.037.48.04.934.124 1.366.345a3.5 3.5 0 0 1 1.53 1.529c.22.432.305.887.344 1.366.037.457.037 1.017.037 1.683v4.08c0 .666 0 1.226-.037 1.683-.04.48-.124.934-.345 1.366a3.5 3.5 0 0 1-1.529 1.53c-.432.22-.887.305-1.366.344-.457.037-1.017.037-1.683.037H6.96c-.666 0-1.226 0-1.683-.037-.48-.04-.934-.124-1.366-.345a3.5 3.5 0 0 1-1.53-1.529c-.22-.432-.305-.887-.344-1.366C2 19.266 2 18.706 2 18.041V13.96c0-.666 0-1.226.037-1.683.04-.48.124-.934.344-1.366a3.5 3.5 0 0 1 1.53-1.53c.432-.22.887-.305 1.366-.344C5.734 9 6.295 9 6.96 9Zm9.104 5.3a1 1 0 1 0-1.128-1.651 16.4 16.4 0 0 0-4.274 4.238l-1.455-1.454a1 1 0 0 0-1.414 1.415l2.341 2.339a1 1 0 0 0 1.575-.211c1.07-1.87 2.566-3.454 4.355-4.676Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}

export default IconPlaylistCheckDuoSolid
