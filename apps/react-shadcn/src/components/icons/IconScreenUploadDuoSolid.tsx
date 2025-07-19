// icons/svgs/duo-solid/devices

import type React from "react"
import type { SVGProps } from "react"

export const IconScreenUploadDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M4.364 1h11.992A18 18 0 0 0 14.6 3.012a3 3 0 0 0 2.4 4.8V9a3 3 0 1 0 6 0v5.636c0 .39 0 .74-.024 1.03a2.5 2.5 0 0 1-.248.969 2.5 2.5 0 0 1-1.093 1.092 2.5 2.5 0 0 1-.968.25c-.292.023-.642.023-1.03.023H4.363c-.39 0-.74 0-1.03-.024a2.5 2.5 0 0 1-.969-.248 2.5 2.5 0 0 1-1.093-1.093 2.5 2.5 0 0 1-.248-.968q-.03-.515-.023-1.03V4.363c0-.39 0-.74.024-1.03.025-.313.083-.644.248-.969a2.5 2.5 0 0 1 1.093-1.093c.325-.165.656-.223.968-.248C3.625 1 3.976 1 4.364 1ZM20 1c-.38 0-.76.127-1.073.38A16 16 0 0 0 16.2 4.212a1 1 0 1 0 1.6 1.2q.554-.739 1.2-1.398V9a1 1 0 1 0 2 0V4.014q.646.66 1.2 1.398a1 1 0 1 0 1.6-1.2 16 16 0 0 0-2.727-2.832A1.7 1.7 0 0 0 20 1Z"
				clipRule="evenodd"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M12 20.875V17m0 3.875c-1.75 0-3.5.375-5 1.125m5-1.125c1.75 0 3.5.375 5 1.125"
				opacity=".28"
			/>
		</svg>
	)
}

export default IconScreenUploadDuoSolid
