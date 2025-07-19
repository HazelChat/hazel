// icons/svgs/stroke/food

import type React from "react"
import type { SVGProps } from "react"

export const IconCoffeeCup02Stroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M17.99 11H19a3 3 0 1 1 0 6h-2.487m1.477-6c.01.157.01.35.01.6v.753A7.96 7.96 0 0 1 16.513 17m1.477-6c-.012-.196-.038-.335-.099-.454a1 1 0 0 0-.437-.437C17.24 10 16.96 10 16.4 10H3.6c-.56 0-.84 0-1.054.109a1 1 0 0 0-.437.437C2 10.76 2 11.04 2 11.6v.753A8 8 0 0 0 16.513 17M6 6v-.066c0-.375.188-.726.5-.934s.5-.559.5-.934V4m3 2v-.066c0-.375.188-.726.5-.934s.5-.559.5-.934V4m3 2v-.066c0-.375.188-.726.5-.934s.5-.559.5-.934V4"
				fill="none"
			/>
		</svg>
	)
}

export default IconCoffeeCup02Stroke
