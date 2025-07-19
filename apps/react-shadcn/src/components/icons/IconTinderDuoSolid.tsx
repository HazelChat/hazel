// icons/svgs/duo-solid/apps-&-social

import type React from "react"
import type { SVGProps } from "react"

export const IconTinderDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M13.11 1.058c-.888-.296-1.502.477-1.502 1.103q0 .078.012.153c.216 1.394.163 2.757-.294 3.874-.363.888-1 1.67-2.08 2.217a5 5 0 0 1-.143-.511 8 8 0 0 1-.173-1.157c-.038-.932-1.063-1.327-1.742-.903a8.717 8.717 0 0 0 4.903 16.158c5.371-.012 9.08-4.252 9.08-9.026 0-6.08-4.27-10.064-7.938-11.857q-.06-.03-.123-.05ZM6.935 6.873l.001.017z"
				clipRule="evenodd"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M20.172 12.966c0-5.557-3.906-9.261-7.379-10.96-.092-.03-.185.047-.185.155.463 2.995-.154 6.251-3.781 7.502h-.062c-.633-.865-.787-2.3-.834-2.871 0-.108-.123-.17-.216-.108a7.72 7.72 0 0 0-3.206 3.843"
			/>
		</svg>
	)
}

export default IconTinderDuoSolid
