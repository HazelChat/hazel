// icons/svgs/solid/food

import type React from "react"
import type { SVGProps } from "react"

export const IconCoffeeCup02: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M8 4a1 1 0 0 0-2 0v.066c0 .04-.02.08-.055.102A2.12 2.12 0 0 0 5 5.934V6a1 1 0 1 0 2 0v-.066c0-.04.02-.08.055-.102.59-.394.945-1.056.945-1.766z"
				fill="currentColor"
			/>
			<path
				d="M12 4a1 1 0 1 0-2 0v.066c0 .04-.02.08-.055.102A2.12 2.12 0 0 0 9 5.934V6a1 1 0 0 0 2 0v-.066c0-.04.02-.08.055-.102.59-.394.945-1.056.945-1.766z"
				fill="currentColor"
			/>
			<path
				d="M16 4a1 1 0 1 0-2 0v.066c0 .04-.02.08-.055.102A2.12 2.12 0 0 0 13 5.934V6a1 1 0 1 0 2 0v-.066c0-.04.02-.08.055-.102.59-.394.945-1.056.945-1.766z"
				fill="currentColor"
			/>
			<path
				fillRule="evenodd"
				d="M3.568 9c-.252 0-.498 0-.706.017a2 2 0 0 0-.77.201 2 2 0 0 0-.874.874 2 2 0 0 0-.201.77C1 11.07 1 11.316 1 11.568v.785A9 9 0 0 0 17.008 18H19a4 4 0 0 0 0-8h-.268a2 2 0 0 0-.824-.782 2 2 0 0 0-.77-.201C16.93 9 16.684 9 16.432 9zM19 16h-.77a9 9 0 0 0 .77-3.647V12a2 2 0 1 1 0 4Z"
				clipRule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconCoffeeCup02
