// icons/svgs/solid/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconDivertRight: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M20.44 7.091a21.8 21.8 0 0 0-5.605.211 1 1 0 0 0-.46 1.767l1.1.88q.598.48 1.164.998l-4.225 4.225a2 2 0 0 1-2.828 0l-6.879-6.88a1 1 0 0 0-1.414 1.415l6.879 6.879a4 4 0 0 0 5.656 0l4.225-4.224q.518.564.997 1.164l.88 1.1a1 1 0 0 0 1.768-.46c.312-1.863.383-3.747.21-5.605a1.625 1.625 0 0 0-1.469-1.47Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconDivertRight
