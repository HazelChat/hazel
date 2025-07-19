// icons/svgs/solid/devices

import type React from "react"
import type { SVGProps } from "react"

export const IconLaptop: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M7.759 3c-.805 0-1.47 0-2.01.044-.563.046-1.08.145-1.565.392a4 4 0 0 0-1.748 1.748c-.247.485-.346 1.002-.392 1.564C2 7.29 2 7.954 2 8.758v6.51A2 2 0 0 0 1 17a4 4 0 0 0 4 4h14a4 4 0 0 0 4-4 2 2 0 0 0-1-1.732v-6.51c0-.804 0-1.469-.044-2.01-.046-.562-.145-1.079-.392-1.564a4 4 0 0 0-1.748-1.748c-.485-.247-1.002-.346-1.564-.392C17.71 3 17.046 3 16.242 3zM4 15h16V8.8c0-.857 0-1.439-.038-1.889-.035-.438-.1-.663-.18-.819a2 2 0 0 0-.874-.874c-.156-.08-.38-.145-.819-.18C17.639 5 17.057 5 16.2 5H7.8c-.857 0-1.439 0-1.889.038-.438.035-.663.1-.819.18a2 2 0 0 0-.874.874c-.08.156-.145.38-.18.819C4 7.361 4 7.943 4 8.8z"
				clipRule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconLaptop
