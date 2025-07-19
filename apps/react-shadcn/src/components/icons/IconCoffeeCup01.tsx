// icons/svgs/solid/food

import type React from "react"
import type { SVGProps } from "react"

export const IconCoffeeCup01: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M9 2a1 1 0 0 0-2 0v.066c0 .04-.02.08-.055.102A2.12 2.12 0 0 0 6 3.934V4a1 1 0 1 0 2 0v-.066c0-.04.02-.08.055-.102.59-.394.945-1.056.945-1.766z"
				fill="currentColor"
			/>
			<path
				d="M13 2a1 1 0 1 0-2 0v.066c0 .04-.02.08-.055.102A2.12 2.12 0 0 0 10 3.934V4a1 1 0 1 0 2 0v-.066c0-.04.02-.08.055-.102.59-.394.945-1.056.945-1.766z"
				fill="currentColor"
			/>
			<path
				d="M17 2a1 1 0 1 0-2 0v.066c0 .04-.02.08-.055.102A2.12 2.12 0 0 0 14 3.934V4a1 1 0 1 0 2 0v-.066c0-.04.02-.08.055-.102.59-.394.945-1.056.945-1.766z"
				fill="currentColor"
			/>
			<path
				fillRule="evenodd"
				d="M7.161 7c-.527 0-.981 0-1.356.03-.395.033-.789.104-1.167.297a3 3 0 0 0-1.311 1.311c-.193.378-.264.772-.296 1.167C3 10.18 3 10.635 3 11.162v2.925c0 .846 0 1.37.06 1.827a7 7 0 0 0 6.026 6.026c.456.06.981.06 1.826.06h.175c.846 0 1.37 0 1.827-.06A7 7 0 0 0 18.709 17H19a4 4 0 0 0 0-8h-.178a2.4 2.4 0 0 0-.149-.362 3 3 0 0 0-1.311-1.311c-.378-.193-.772-.264-1.167-.296A18 18 0 0 0 14.839 7zM19 15h-.004c.004-.26.004-.558.004-.912V11a2 2 0 0 1 0 4Z"
				clipRule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconCoffeeCup01
