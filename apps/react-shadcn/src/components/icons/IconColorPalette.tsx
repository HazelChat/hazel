// icons/svgs/solid/general

import type React from "react"
import type { SVGProps } from "react"

export const IconColorPalette: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				fillRule="evenodd"
				d="M1.487 11.447c.307-5.772 5.277-10.24 11.049-9.932 5.622.3 10.233 4.704 9.983 9.942v.006c-.184 3.448-3.158 6.12-6.605 5.936-.228-.012-.454-.038-.68-.064a9 9 0 0 0-.861-.071c-.464-.007-.675.077-.784.175-.24.215-.235.612-.083.78.678.752.763 1.924.339 2.816-.402.848-1.278 1.522-2.426 1.461-5.773-.307-10.24-5.277-9.932-11.05Zm8.762-4.184a2 2 0 1 1 4 0 2 2 0 0 1-4 0ZM5.479 11a2 2 0 1 1 4 0 2 2 0 0 1-4 0Zm9.244 0a2 2 0 1 1 4 0 2 2 0 0 1-4 0Z"
				clipRule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconColorPalette
