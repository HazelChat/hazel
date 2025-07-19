// icons/svgs/stroke/security

import type React from "react"
import type { SVGProps } from "react"

export const IconLayerTwoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M20.923 14.574c-.118.235-.486.41-1.222.757l-6.272 2.966c-.524.248-.786.372-1.06.42a2.1 2.1 0 0 1-.737 0c-.275-.048-.537-.172-1.061-.42l-6.272-2.966c-.736-.348-1.104-.522-1.222-.757m10.352-.777 6.272-2.966c.736-.348 1.104-.522 1.222-.757a.72.72 0 0 0 0-.648c-.118-.235-.486-.41-1.222-.757l-6.272-2.966c-.524-.248-.786-.372-1.06-.42a2.1 2.1 0 0 0-.737 0c-.275.048-.537.172-1.061.42L4.299 8.669c-.736.348-1.104.522-1.222.757a.72.72 0 0 0 0 .648c.118.235.486.41 1.222.757l6.272 2.966c.524.248.786.372 1.06.42.244.044.494.044.737 0 .275-.048.537-.172 1.061-.42Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconLayerTwoStroke
