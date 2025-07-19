// icons/svgs/contrast/development

import type React from "react"
import type { SVGProps } from "react"

export const IconCloudDisabled1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g fill="currentColor" opacity=".28">
				<path
					fill="currentColor"
					d="M4.135 11.67a4.5 4.5 0 0 0 .344 7.85L17.096 6.906A6.502 6.502 0 0 0 6.466 9.08c-.323.804-.484 1.206-.562 1.327a4 4 0 0 0-.102.162l-.035.033c-.02.018-.053.045-.107.095-.106.097-.579.39-1.525.976Z"
				/>
				<path
					fill="currentColor"
					d="M20.266 9.202a1 1 0 0 0-1.287.107l-9.984 9.984A1 1 0 0 0 9.702 21H16.5a6.5 6.5 0 0 0 3.766-11.798Z"
				/>
			</g>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M9.702 20H16.5a5.5 5.5 0 0 0 3.186-9.984M6.466 9.08v-.002l.045-.108a6.502 6.502 0 0 1 10.585-2.066M6.466 9.08A6.5 6.5 0 0 0 6.174 13m.29-3.92c-.322.803-.483 1.204-.561 1.325-.152.235-.038.1-.244.29-.106.097-.579.39-1.525.976a4.5 4.5 0 0 0 .344 7.85M17.096 6.904 4.48 19.522M17.096 6.903 20 4M2 22l2.479-2.479"
			/>
		</svg>
	)
}

export default IconCloudDisabled1
