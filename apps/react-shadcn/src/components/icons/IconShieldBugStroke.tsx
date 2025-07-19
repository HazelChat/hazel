// icons/svgs/stroke/development

import type React from "react"
import type { SVGProps } from "react"

export const IconShieldBugStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M13.257 9.018a1.333 1.333 0 1 0-2.515 0m2.515 0h.858q.317.315.544.712m-1.402-.712h-2.514m0 0h-.858q-.317.315-.544.712M16 7.557v.812c0 .636-.449 1.183-1.072 1.307l-.27.054M8 7.557v.812c0 .636.449 1.183 1.072 1.307l.27.054m7.102 5.51v-1.13c0-.635-.448-1.182-1.071-1.307l-.486-.097M7.556 15.24v-1.13c0-.635.448-1.182 1.071-1.307l.486-.097m5.774 0c.145-.384.224-.804.224-1.244 0-.634-.165-1.227-.452-1.732m.228 2.976c-.46 1.225-1.58 2.09-2.887 2.09-1.308 0-2.427-.865-2.887-2.09m0 0a3.5 3.5 0 0 1-.224-1.244c0-.634.165-1.227.452-1.732m1.542-7.362L5.496 4.313a3 3 0 0 0-1.98 2.707l-.126 3.308a11 11 0 0 0 5.543 9.979l1.52.867a3 3 0 0 0 2.915.032l1.489-.807a11 11 0 0 0 5.729-10.516l-.227-2.95a3 3 0 0 0-1.973-2.592l-5.465-1.973a3 3 0 0 0-2.038 0Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconShieldBugStroke
