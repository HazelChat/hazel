// icons/svgs/duo-solid/ar-&-vr

import type React from "react"
import type { SVGProps } from "react"

export const IconVisionProDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12 5.5c-2.015 0-4.668.026-6.832.799-1.102.393-2.142 1.001-2.91 1.953-.779.964-1.215 2.203-1.235 3.735-.018 1.418.3 2.929 1.073 4.151.792 1.253 2.06 2.183 3.814 2.341 1.662.15 2.843-.666 3.726-1.287l.01-.007c.948-.668 1.55-1.09 2.355-1.091.808 0 1.41.421 2.353 1.083l.043.03c.898.631 2.097 1.447 3.79 1.262 1.732-.188 2.973-1.125 3.747-2.371.755-1.217 1.06-2.71 1.043-4.11-.02-1.533-.456-2.772-1.235-3.736-.768-.952-1.808-1.56-2.91-1.953C16.668 5.526 14.015 5.5 12 5.5Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M18 7.08c-1.883-.55-4.124-.58-6-.58s-4.118.03-6 .58m3 9.337c.91-.638 1.79-1.323 3-1.323 1.214-.001 2.098.684 3.01 1.323"
			/>
		</svg>
	)
}

export default IconVisionProDuoSolid
