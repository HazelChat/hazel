// icons/svgs/stroke/development

import type React from "react"
import type { SVGProps } from "react"

export const IconBugStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12 20v-7m0 7c2.942 0 5.46-1.945 6.496-4.7M12 20c-2.942 0-5.46-1.945-6.496-4.7M14.829 7A3 3 0 1 0 9.17 7m5.66 0h1.93a7.5 7.5 0 0 1 1.222 1.604M14.83 7H9.171m0 0H7.24a7.5 7.5 0 0 0-1.223 1.604M21 3v2.54a3 3 0 0 1-2.412 2.942l-.606.122M3 3v2.54a3 3 0 0 0 2.412 2.942l.606.122M22 21v-2.54a3 3 0 0 0-2.412-2.942l-1.092-.219M2 21v-2.54a3 3 0 0 1 2.412-2.942l1.092-.219m12.992 0A8 8 0 0 0 19 12.5a7.87 7.87 0 0 0-1.018-3.896M5.504 15.299A8 8 0 0 1 5 12.5c0-1.427.372-2.76 1.018-3.896"
				fill="none"
			/>
		</svg>
	)
}

export default IconBugStroke
