// icons/svgs/duo-solid/apps-&-social

import type React from "react"
import type { SVGProps } from "react"

export const IconTwitterDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M13.239 3.547c1.647-.865 3.76-.78 5.392.812q.604-.226 1.171-.53c.56-.3 1.199-.212 1.64.128.468.36.728 1.026.435 1.698a8.5 8.5 0 0 1-1.405 2.21c1.294 5.025-.398 9.257-3.774 11.68-3.462 2.486-8.528 2.956-13.541.697-1.065-.479-.97-1.953.042-2.37a31 31 0 0 0 2.407-1.116c-.993-.543-1.761-1.19-2.33-1.92-.893-1.144-1.239-2.414-1.273-3.628-.067-2.369 1.046-4.59 1.64-5.613.581-.998 1.853-.922 2.48-.218.797.897 1.572 1.496 2.404 1.882.605.281 1.27.463 2.035.55.037-1.884 1.179-3.475 2.677-4.262Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M7.806 16.62C.539 14.173 3.364 8.067 4.508 6.099c.186-.32.621-.333.867-.056 1.732 1.949 3.527 2.776 6.07 2.824.12.002.208-.113.186-.232-.691-3.655 3.985-6.509 6.7-3.12a10.6 10.6 0 0 0 1.944-.804c.394-.211.865.135.686.545a7.5 7.5 0 0 1-1.604 2.334"
			/>
		</svg>
	)
}

export default IconTwitterDuoSolid
