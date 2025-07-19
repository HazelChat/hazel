// icons/svgs/duo-solid/devices

import type React from "react"
import type { SVGProps } from "react"

export const IconInputFieldDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
					d="M6.884 6c-.817 0-1.375 0-1.86.096a5 5 0 0 0-3.928 3.929C1 10.509 1 11.067 1 11.885v.23c0 .818 0 1.376.096 1.86a5 5 0 0 0 3.929 3.929C5.509 18 6.067 18 6.885 18H17a1 1 0 1 0 0-2V8a1 1 0 1 0 0-2z"
				/>
				<path
					fill="currentColor"
					d="M20.5 6.67a1 1 0 0 0-1 1.732 3 3 0 0 1 1.442 2.013c.053.265.058.608.058 1.585s-.005 1.32-.058 1.585a3 3 0 0 1-1.442 2.013 1 1 0 0 0 1 1.732 5 5 0 0 0 2.404-3.354c.096-.485.096-1.043.096-1.86v-.232c0-.817 0-1.375-.096-1.86A5 5 0 0 0 20.5 6.67Z"
				/>
			</g>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M17 7v10m0-10c0-.93 0-1.395-.102-1.776a3 3 0 0 0-2.121-2.122C14.395 3 13.93 3 13 3m4 4c0-.93 0-1.395.102-1.776a3 3 0 0 1 2.122-2.122C19.605 3 20.07 3 21 3m-4 14c0 .93 0 1.395-.102 1.776a3 3 0 0 1-2.121 2.122C14.395 21 13.93 21 13 21m4-4c0 .93 0 1.395.102 1.776a3 3 0 0 0 2.122 2.122C19.605 21 20.07 21 21 21M7 13a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm6 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"
			/>
		</svg>
	)
}

export default IconInputFieldDuoSolid
