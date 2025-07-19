// icons/svgs/solid/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconArrowBigDown: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M19.804 14.79a1 1 0 0 0-.92-1.588q-1.439.167-2.884.264V4.57c0-.253 0-.499-.017-.707a2 2 0 0 0-.201-.77 2 2 0 0 0-.874-.874 2 2 0 0 0-.77-.2c-.208-.018-.454-.018-.706-.018h-2.864c-.252 0-.498 0-.706.017a2 2 0 0 0-.77.201 2 2 0 0 0-.874.874 2 2 0 0 0-.201.77C8 4.072 8 4.318 8 4.571v8.895a60 60 0 0 1-2.885-.264 1 1 0 0 0-.919 1.588 36.3 36.3 0 0 0 6.486 6.744 2.11 2.11 0 0 0 2.636 0 36.3 36.3 0 0 0 6.486-6.744Z"
				clipRule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconArrowBigDown
