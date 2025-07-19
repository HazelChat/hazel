// icons/svgs/duo-solid/general

import type React from "react"
import type { SVGProps } from "react"

export const IconToolsDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
					d="M3.541 2.278a3.5 3.5 0 0 1 4.115 0c.225.163.442.38.718.656L9.94 4.501l.766.766a1 1 0 0 1-.053 1.464l-4.55 3.934a1 1 0 0 1-1.362-.05l-.663-.662L2.717 8.59c-.276-.275-.494-.493-.657-.717a3.5 3.5 0 0 1 0-4.115 7 7 0 0 1 1.481-1.481Z"
				/>
				<path
					fill="currentColor"
					d="M15.292 15.527a1 1 0 0 1 1.414 0l5.157 5.157a1 1 0 1 1-1.415 1.414l-5.156-5.156a1 1 0 0 1 0-1.415Z"
				/>
			</g>
			<path
				fill="currentColor"
				d="M18.122 2.96a1 1 0 0 0-1.5-1.25l-2.343 1.814a4.416 4.416 0 0 0 1.64 7.78 4.42 4.42 0 0 0 4.556-1.583l1.815-2.343a1 1 0 0 0-1.25-1.5l-.617.319a1.944 1.944 0 0 1-2.62-2.621z"
			/>
			<path
				fill="currentColor"
				d="M2.877 15.884 11.28 8.59c.263.955.771 1.86 1.521 2.61a5.9 5.9 0 0 0 2.61 1.52l-7.296 8.405a6 6 0 0 1-.399.435c-.778.738-1.73 1.008-2.651.9-.896-.104-1.719-.556-2.343-1.18-.625-.626-1.077-1.448-1.182-2.344-.107-.922.163-1.873.9-2.651.116-.122.259-.245.438-.401Z"
			/>
		</svg>
	)
}

export default IconToolsDuoSolid
