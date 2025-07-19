// icons/svgs/solid/food

import type React from "react"
import type { SVGProps } from "react"

export const IconWineGlassFilled: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M6.434 1.502A1 1 0 0 1 7.302 1h9.396a1 1 0 0 1 .868.502A11 11 0 0 1 19 6.89c0 3.561-2.361 6.579-6 7.048V21h3a1 1 0 1 1 0 2H8a1 1 0 1 1 0-2h3v-7.063c-3.639-.47-6-3.487-6-7.048 0-1.914.535-3.82 1.434-5.387ZM16.097 3H7.903c-.611 1.257-.945 2.685-.9 4.086 1.639-.596 3.37-.896 5.4-.001 1.59.7 2.869.387 4.596-.32A9 9 0 0 0 16.097 3Z"
				clipRule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconWineGlassFilled
