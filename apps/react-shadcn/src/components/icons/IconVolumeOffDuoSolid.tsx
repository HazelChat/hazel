// icons/svgs/duo-solid/media

import type React from "react"
import type { SVGProps } from "react"

export const IconVolumeOffDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g fill="currentColor" opacity=".28">
				<path
					fill="currentColor"
					d="M18 5.108c0-2.525-2.853-3.993-4.907-2.526l-2.813 2.01a3.9 3.9 0 0 1-1.514.655A5.93 5.93 0 0 0 4 11.06v1.918c0 1.949.949 3.71 2.444 4.798a1 1 0 0 0 1.296-.102l9.967-9.968A1 1 0 0 0 18 7z"
				/>
				<path
					fill="currentColor"
					d="M18 12.648a1 1 0 0 0-1.707-.707l-6.05 6.05a1 1 0 0 0 .125 1.521l2.725 1.946C15.147 22.925 18 21.457 18 18.933z"
				/>
			</g>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M22 2 2 22"
			/>
		</svg>
	)
}

export default IconVolumeOffDuoSolid
