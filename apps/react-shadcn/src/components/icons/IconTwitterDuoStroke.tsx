// icons/svgs/duo-stroke/apps-&-social

import type React from "react"
import type { SVGProps } from "react"

export const IconTwitterDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M20.96 5.255c.18-.41-.29-.756-.686-.545-.618.332-1.27.602-1.944.805-2.714-3.39-7.39-.536-6.699 3.12.022.118-.066.233-.187.23-2.542-.047-4.337-.874-6.069-2.823-.246-.277-.681-.264-.867.056-1.144 1.969-3.97 8.074 3.298 10.523-1.421.964-3.275 1.784-4.225 2.175-.235.097-.245.43-.014.535 9.484 4.272 18.713-1.95 15.79-11.742a7.5 7.5 0 0 0 1.604-2.334Z"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M7.806 16.62C.539 14.173 3.364 8.067 4.508 6.099c.186-.32.621-.333.867-.056 1.732 1.949 3.527 2.776 6.07 2.824.12.002.208-.113.186-.232-.691-3.655 3.985-6.509 6.7-3.12a10.6 10.6 0 0 0 1.944-.804c.394-.211.865.135.686.545a7.5 7.5 0 0 1-1.604 2.334"
				fill="none"
			/>
		</svg>
	)
}

export default IconTwitterDuoStroke
