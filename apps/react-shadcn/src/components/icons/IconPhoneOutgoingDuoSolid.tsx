// icons/svgs/duo-solid/communication

import type React from "react"
import type { SVGProps } from "react"

export const IconPhoneOutgoingDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M5.407 12.974a15.8 15.8 0 0 0 5.307 5.43"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M4.736 2.06c.516-.084 1.101-.067 1.541-.027 1.165.105 2.002.69 2.576 1.45.548.726.855 1.608 1.052 2.377a6.43 6.43 0 0 1-1.859 6.313c-.473.438-1.023.845-1.514 1.208-.182.135-.357.264-.515.386a1 1 0 0 1-1.471-.285c-1.314-2.226-2.168-4.805-2.504-7.656-.19-1.615.799-3.456 2.694-3.766Z"
			/>
			<path
				fill="currentColor"
				d="M11.985 15.484a6.43 6.43 0 0 1 5.763-1.51c.797.182 1.747.47 2.544 1.005.829.558 1.514 1.405 1.66 2.64a6 6 0 0 1-.017 1.645c-.31 1.894-2.15 2.885-3.765 2.694-2.991-.353-5.684-1.277-7.983-2.704a1 1 0 0 1-.228-1.505 28 28 0 0 0 .475-.564c.461-.555.985-1.186 1.55-1.7Z"
			/>
			<path
				fill="currentColor"
				d="M15.769 5.103Q16.67 4.99 17.584 5l-3.551 3.55a1 1 0 1 0 1.414 1.415l3.551-3.551q.01.913-.102 1.815a1 1 0 1 0 1.985.246 15.7 15.7 0 0 0-.007-3.895 1.68 1.68 0 0 0-1.456-1.456 15.7 15.7 0 0 0-3.895-.007 1 1 0 1 0 .246 1.985Z"
			/>
		</svg>
	)
}

export default IconPhoneOutgoingDuoSolid
