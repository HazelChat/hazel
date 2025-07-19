// icons/svgs/solid/devices

import type React from "react"
import type { SVGProps } from "react"

export const IconScreenUpload: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g clip-path="url(#icon-ap1kknh6s-a)">
				<path
					fill="currentColor"
					fillRule="evenodd"
					d="M4.364 1h11.992A18 18 0 0 0 14.6 3.012a3 3 0 0 0 2.4 4.8V9a3 3 0 0 0 6 0v5.636c0 .39 0 .74-.024 1.03a2.5 2.5 0 0 1-.248.969 2.5 2.5 0 0 1-1.093 1.092 2.5 2.5 0 0 1-.968.25c-.292.023-.642.023-1.03.023H13v1.913c1.552.118 3.085.511 4.447 1.193a1 1 0 1 1-.894 1.788c-1.346-.672-2.94-1.019-4.553-1.019s-3.207.347-4.553 1.02a1 1 0 1 1-.894-1.79c1.362-.68 2.895-1.074 4.447-1.192V18H4.364c-.39 0-.74 0-1.03-.024a2.5 2.5 0 0 1-.969-.248 2.5 2.5 0 0 1-1.093-1.093 2.5 2.5 0 0 1-.248-.968q-.032-.515-.024-1.03V4.363c0-.39 0-.74.024-1.03.025-.313.083-.644.248-.969a2.5 2.5 0 0 1 1.093-1.093c.325-.165.656-.223.968-.248C3.625 1 3.976 1 4.364 1ZM20 1c-.38 0-.76.127-1.073.38A16 16 0 0 0 16.2 4.212a1 1 0 0 0 1.6 1.2q.554-.739 1.2-1.398V9a1 1 0 0 0 2 0V4.014a14 14 0 0 1 1.2 1.398 1 1 0 1 0 1.6-1.2 16 16 0 0 0-2.727-2.832A1.7 1.7 0 0 0 20 1Z"
					clipRule="evenodd"
				/>
			</g>
			<defs>
				<clipPath id="icon-ap1kknh6s-a">
					<path fill="currentColor" d="M0 0h24v24H0z" />
				</clipPath>
			</defs>
		</svg>
	)
}

export default IconScreenUpload
