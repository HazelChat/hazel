// icons/svgs/contrast/general

import type React from "react"
import type { SVGProps } from "react"

export const IconHeartBreak1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M2 8.944C2 3.502 8.832.654 12 5.427c3.162-4.765 10-1.92 10 3.517C22 15.977 13 21 12 21S2 15.977 2 8.944Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M12 5.427C8.832.653 2 3.502 2 8.944 2 15.977 11 21 12 21s10-5.023 10-12.056c0-5.437-6.837-8.282-10-3.517Zm0 0 .05.07a11.35 11.35 0 0 1 1.935 4.428.11.11 0 0 1-.049.118l-2.896 1.93a.07.07 0 0 0-.032.074c.252 1.517.837 2.894 1.992 3.953"
			/>
		</svg>
	)
}

export default IconHeartBreak1
