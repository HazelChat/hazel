// icons/svgs/stroke/general

import type React from "react"
import type { SVGProps } from "react"

export const IconFloppy02Stroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M13 3v2c0 .838 0 1.257-.118 1.594a2.1 2.1 0 0 1-1.288 1.288C11.257 8 10.838 8 10 8s-1.257 0-1.594-.118a2.1 2.1 0 0 1-1.288-1.288C7 6.257 7 5.838 7 5V3.046M13 3H9.56C8.485 3 7.662 3 7 3.046M13 3h2.01c.45.001.674.001.904.057.197.047.404.133.576.24.202.123.367.288.698.62l2.896 2.895c.33.33.496.496.62.698.106.172.192.38.24.576.055.23.055.455.056.904v5.45c0 2.296 0 3.444-.447 4.321a4.1 4.1 0 0 1-1.792 1.792c-.466.238-1.01.35-1.761.401M7 3.046c-.752.052-1.295.163-1.761.4A4.1 4.1 0 0 0 3.447 5.24C3 6.116 3 7.264 3 9.56v4.88c0 2.296 0 3.444.447 4.321a4.1 4.1 0 0 0 1.792 1.792c.466.238 1.01.35 1.761.401m0 0V16.36c0-1.176 0-1.764.229-2.213a2.1 2.1 0 0 1 .918-.918C8.596 13 9.184 13 10.36 13h3.28c1.176 0 1.764 0 2.213.229a2.1 2.1 0 0 1 .918.918c.229.449.229 1.037.229 2.213v4.594m-10 0C7.662 21 8.485 21 9.56 21h4.88c1.075 0 1.898 0 2.56-.046"
				fill="none"
			/>
		</svg>
	)
}

export default IconFloppy02Stroke
