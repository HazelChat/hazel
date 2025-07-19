// icons/svgs/stroke/media

import type React from "react"
import type { SVGProps } from "react"

export const IconBluetoothOffStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M4 7.935c2.614 1.08 5.125 2.222 7.484 3.605m0 0 .016.46-.016.46m0-.92-.305-9.023c0-.384.418-.633.774-.462 2.055.992 3.92 2.093 5.577 3.692q.194.188.308.415m-6.354 5.378q.308.18.61.365M22 2l-4.162 4.162m0 0-5.743 5.743M11.33 17l-.152 4.483c0 .384.418.633.774.462 2.05-.989 3.922-2.095 5.577-3.692a1.51 1.51 0 0 0 0-2.188A29 29 0 0 0 15 13.89m-2.905-1.985L2 22"
				fill="none"
			/>
		</svg>
	)
}

export default IconBluetoothOffStroke
