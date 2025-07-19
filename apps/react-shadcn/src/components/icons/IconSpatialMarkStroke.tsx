// icons/svgs/stroke/ar-&-vr

import type React from "react"
import type { SVGProps } from "react"

export const IconSpatialMarkStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="m11.999 16-3.6-2m3.6 2 3.6-2m-3.6 2-5.296 3.057m1.696-5.058v-4m0 4L3 10.882M8.399 10l3.6-2m-3.6 2V4.001m3.6 3.998 3.6 2m-3.6-2 5.296-3.057m-1.696 5.057v4m0-4L21 13.118m-5.401.881v6.002m1.696-15.06L13.457 2.81a3 3 0 0 0-2.914 0L8.4 4.001m8.896.94 2.162 1.202A3 3 0 0 1 21 8.765v4.353m0 0v2.117a3 3 0 0 1-1.543 2.622l-3.858 2.144m0 0-2.142 1.19a3 3 0 0 1-2.914 0l-3.84-2.134m0 0-2.16-1.2A3 3 0 0 1 3 15.235v-4.353m0 0V8.765a3 3 0 0 1 1.543-2.622L8.4 4"
				fill="none"
			/>
		</svg>
	)
}

export default IconSpatialMarkStroke
