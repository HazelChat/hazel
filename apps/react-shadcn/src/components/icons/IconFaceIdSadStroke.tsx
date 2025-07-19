// icons/svgs/stroke/security

import type React from "react"
import type { SVGProps } from "react"

export const IconFaceIdSadStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M7.5 8.188v1.5m9-1.5v1.5m-6 3.1c.8 0 1.5-.7 1.5-1.5V8.481m3.209 8.879c-1.8-1.8-4.7-1.8-6.5 0M15 3.188c1.977.002 3.013.027 3.816.436a4 4 0 0 1 1.748 1.748c.41.803.434 1.84.436 3.816m-6 12c1.977-.002 3.013-.027 3.816-.436a4 4 0 0 0 1.748-1.748c.41-.803.434-1.84.436-3.816m-12 6c-1.977-.002-3.013-.027-3.816-.436a4 4 0 0 1-1.748-1.748c-.41-.803-.434-1.84-.436-3.816m0-6c.002-1.977.026-3.013.435-3.816a4 4 0 0 1 1.748-1.748c.803-.41 1.84-.434 3.817-.436"
				fill="none"
			/>
		</svg>
	)
}

export default IconFaceIdSadStroke
