// icons/svgs/duo-stroke/communication

import type React from "react"
import type { SVGProps } from "react"

export const IconPhoneOutgoingDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M5.407 12.974a15.8 15.8 0 0 0 5.307 5.43"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M19.889 8.353c.15-1.206.147-2.431-.007-3.647a.68.68 0 0 0-.192-.397m-4.044-.199a14.7 14.7 0 0 1 3.647.007.68.68 0 0 1 .397.192m-4.95 4.95 4.95-4.95M3.035 5.71c.321 2.724 1.135 5.168 2.373 7.265.653-.502 1.354-.974 1.959-1.534a5.43 5.43 0 0 0 1.57-5.332c-.37-1.442-1.066-2.927-2.75-3.08-.402-.036-.893-.045-1.29.02-1.262.206-2.003 1.465-1.862 2.661Zm7.68 12.696c2.164 1.343 4.715 2.223 7.573 2.56 1.196.141 2.455-.6 2.66-1.863a5 5 0 0 0 .012-1.366c-.21-1.77-1.914-2.44-3.435-2.788a5.43 5.43 0 0 0-4.867 1.276c-.714.65-1.311 1.453-1.943 2.18Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconPhoneOutgoingDuoStroke
