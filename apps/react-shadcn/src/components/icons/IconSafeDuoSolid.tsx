// icons/svgs/duo-solid/money-&-payments

import type React from "react"
import type { SVGProps } from "react"

export const IconSafeDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M6.759 3c-.805 0-1.47 0-2.01.044-.563.046-1.08.145-1.565.392a4 4 0 0 0-1.748 1.748c-.247.485-.346 1.002-.392 1.564C1 7.29 1 7.954 1 8.758v6.483c0 .805 0 1.47.044 2.01.046.563.145 1.08.392 1.565a4 4 0 0 0 1.748 1.748c.262.134.533.224.816.286V21a1 1 0 1 0 2 0v-.002q.356.002.757.002h10.486q.402 0 .757-.002V21a1 1 0 1 0 2 0v-.15c.283-.062.554-.152.816-.286a4 4 0 0 0 1.748-1.748c.247-.485.346-1.002.392-1.564.044-.541.044-1.206.044-2.01V8.758c0-.805 0-1.47-.044-2.01-.046-.563-.145-1.08-.392-1.565a4 4 0 0 0-1.748-1.748c-.485-.247-1.002-.346-1.564-.392C18.71 3 18.046 3 17.242 3z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M19 14v-3M5.758 16.243l1.414-1.415m5.657-5.656 1.414-1.415m0 8.486-1.414-1.415M7.172 9.172 5.758 7.757M14 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
			/>
		</svg>
	)
}

export default IconSafeDuoSolid
