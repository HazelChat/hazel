// icons/svgs/stroke/editing

import type React from "react"
import type { SVGProps } from "react"

export const IconScalePencilCrossStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="m4.516 13.07 2.851 2.85m2.851-8.553 2.851 2.851m0-5.702 2.138 2.138m-7.84 3.564 2.138 2.138m7.571.982 3.425 3.44.061.062a1.6 1.6 0 0 1 .15 2.017l-.034.052a6.3 6.3 0 0 1-1.852 1.84 1.57 1.57 0 0 1-1.964-.212l-3.484-3.5m3.698-3.699 2.978-2.977c.799-.799 1.198-1.198 1.347-1.658a2 2 0 0 0 0-1.246c-.15-.46-.548-.86-1.347-1.658l-1.853-1.853c-.798-.799-1.198-1.198-1.658-1.347a2 2 0 0 0-1.246 0c-.46.15-.86.548-1.658 1.347l-2.963 2.963m6.4 6.43-3.698 3.698M10.676 6.91 7.528 3.748c-.275-.277-.413-.415-.574-.514a1.6 1.6 0 0 0-.46-.19C6.31 2.998 6.116 3 5.726 3L3 3.004l.066 2.68c.01.378.014.566.06.743a1.6 1.6 0 0 0 .19.445c.096.155.228.288.494.555l3.167 3.181m3.699-3.699-3.699 3.7m0 0-3.031 3.03c-.799.799-1.198 1.198-1.347 1.658a2 2 0 0 0 0 1.246c.15.46.548.86 1.347 1.658l1.853 1.853c.798.799 1.198 1.198 1.658 1.347.405.132.84.132 1.246 0 .46-.15.86-.548 1.658-1.347l3.017-3.017"
				fill="none"
			/>
		</svg>
	)
}

export default IconScalePencilCrossStroke
