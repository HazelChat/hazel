// icons/svgs/duo-solid/sports

import type React from "react"
import type { SVGProps } from "react"

export const IconBallTennisDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M14.627 2.196a10.13 10.13 0 0 0-8.694 1.667 10.1 10.1 0 0 0-3.737 5.51 10.1 10.1 0 0 0 .48 6.64 10.13 10.13 0 0 0 6.697 5.791c3.12.836 6.292.122 8.694-1.666a10.1 10.1 0 0 0 3.737-5.511 10.1 10.1 0 0 0-.481-6.64 10.13 10.13 0 0 0-6.696-5.791Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M20.405 8.382a6.003 6.003 0 0 0-2.935 10.954M6.53 4.665a6.003 6.003 0 0 1-2.934 10.953"
			/>
		</svg>
	)
}

export default IconBallTennisDuoSolid
