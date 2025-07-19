// icons/svgs/duo-solid/general

import type React from "react"
import type { SVGProps } from "react"

export const IconLabFlaskConicalDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M10 3h4m-4 0H9m1 0v5.523a1.5 1.5 0 0 1-.276.867l-2.96 4.179c5.623-2.588 7.158 3.072 11.311 1.184L14.276 9.39A1.5 1.5 0 0 1 14 8.523V3m0 0h1"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				fillRule="evenodd"
				d="M13.766 13.19c1.516.815 2.444 1.313 3.896.653a1 1 0 0 1 1.23.333l1.63 2.301C22.163 18.795 20.506 22 17.666 22H6.334c-2.84 0-4.497-3.205-2.856-5.523l2.47-3.486a1 1 0 0 1 .398-.33c1.56-.718 2.9-.89 4.11-.724 1.185.163 2.165.642 2.985 1.08zM9 15a1 1 0 1 0 0 2h.01a1 1 0 0 0 0-2z"
				clipRule="evenodd"
			/>
		</svg>
	)
}

export default IconLabFlaskConicalDuoSolid
