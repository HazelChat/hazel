// icons/svgs/duo-solid/media

import type React from "react"
import type { SVGProps } from "react"

export const IconPointerCursorClickDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M10.998 4.879V2.304m4.888 3.843 1.517-1.407M4.875 11.002H2.3m4.368-4.33L4.503 4.507m.233 12.9 1.407-1.518"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M14.33 8.957c-.883-.22-1.612-.403-2.2-.494-.596-.093-1.202-.12-1.774.104a3.17 3.17 0 0 0-1.793 1.793c-.224.572-.196 1.178-.104 1.774.09.588.273 1.317.494 2.2l.901 3.606c.193.77.344 1.375.475 1.827.122.42.262.846.473 1.156a3.165 3.165 0 0 0 5.09.19c.233-.294.404-.708.557-1.118.164-.441.36-1.034.609-1.787l.007-.021c.1-.302.124-.368.15-.422.114-.239.307-.432.546-.547.054-.025.12-.05.422-.149l.021-.007a57 57 0 0 0 1.787-.61c.41-.152.824-.323 1.117-.557a3.165 3.165 0 0 0-.189-5.089c-.31-.211-.736-.351-1.156-.473a57 57 0 0 0-1.827-.475z"
			/>
		</svg>
	)
}

export default IconPointerCursorClickDuoSolid
