// icons/svgs/duo-solid/communication

import type React from "react"
import type { SVGProps } from "react"

export const IconChatRemoveDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				fillRule="evenodd"
				d="M12 2C6.477 2 2 6.477 2 12q0 .719.099 1.412l.243 1.745.013.11.004.033v.013l.012.139.002.03v.03l-.002.14c0 .119-.01.26-.037.638l-.157 2.19c-.028.397-.054.755-.05 1.053.005.317.043.67.207 1.016.232.49.627.885 1.117 1.117.347.164.699.202 1.016.206.298.005.656-.021 1.052-.05l2.192-.156c.376-.027.519-.037.638-.037l.14-.002h.03l.03.002.138.011h.004l.009.002.033.003.11.013.375.05 1.369.193h.001q.693.098 1.412.099c5.523 0 10-4.477 10-10S17.523 2 12 2Z"
				clipRule="evenodd"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M9 12h6"
			/>
		</svg>
	)
}

export default IconChatRemoveDuoSolid
