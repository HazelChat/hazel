// icons/svgs/solid/navigation

import type React from "react"
import type { SVGProps } from "react"

export const IconMap: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M8.1 3.38c-.29.096-.576.24-.888.396l-3.001 1.5c-.532.265-.999.498-1.354.861a3 3 0 0 0-.693 1.12C2 7.738 2 8.26 2 8.854v6.069c0 .794 0 1.456.047 1.98.047.534.152 1.074.466 1.54a3 3 0 0 0 2.098 1.297c.557.072 1.088-.076 1.586-.271.49-.193 1.082-.49 1.792-.844l.042-.021.069-.035z"
				fill="currentColor"
			/>
			<path
				d="m9.9 18.568.07.035 3.242 1.621c.312.157.598.3.888.397V5.431l-.069-.034-3.242-1.62a7 7 0 0 0-.889-.398z"
				fill="currentColor"
			/>
			<path
				d="M15.9 5.432v15.19c.29-.098.576-.241.889-.398l3-1.5c.532-.265 1-.498 1.354-.86a3 3 0 0 0 .693-1.122c.166-.48.165-1.002.164-1.595V9.078c0-.794 0-1.456-.047-1.98-.047-.534-.152-1.074-.466-1.54a3 3 0 0 0-2.098-1.297c-.557-.072-1.087.076-1.585.272-.49.192-1.083.489-1.793.844l-.042.02z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconMap
