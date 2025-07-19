// icons/svgs/contrast/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconMerge1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12.396 4.145A20.6 20.6 0 0 1 16 8.03l-2.021-.167a24 24 0 0 0-3.958 0L8 8.03a20.6 20.6 0 0 1 3.604-3.886.62.62 0 0 1 .792 0Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M12 7.782V13l-6 7m6-12.218q.99 0 1.979.082L16 8.03a20.6 20.6 0 0 0-3.604-3.886.62.62 0 0 0-.792 0A20.6 20.6 0 0 0 8 8.03l2.021-.167A24 24 0 0 1 12 7.782ZM18 20l-3.429-4"
			/>
		</svg>
	)
}

export default IconMerge1
