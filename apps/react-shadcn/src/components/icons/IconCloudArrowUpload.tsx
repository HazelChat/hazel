// icons/svgs/solid/development

import type React from "react"
import type { SVGProps } from "react"

export const IconCloudArrowUpload: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M19.127 5.986a7.503 7.503 0 0 0-13.613.778c-.15.375-.26.65-.343.848a7 7 0 0 1-.12.27l-.003.004a.3.3 0 0 1-.046.055l-.054.038q-.09.062-.271.177c-.244.154-.593.37-1.068.665A5.5 5.5 0 0 0 6.5 19H7v-.541a3 3 0 0 1-1.31-4.742 22 22 0 0 1 3.985-3.742 3.94 3.94 0 0 1 4.65 0 22 22 0 0 1 3.986 3.741A3 3 0 0 1 17 18.46v.521A6.5 6.5 0 0 0 20.176 7.14a56 56 0 0 1-.63-.44l-.022-.017a.4.4 0 0 1-.046-.052l-.006-.009-.002-.003-.075-.132z"
				fill="currentColor"
			/>
			<path
				d="M10.855 11.59a1.94 1.94 0 0 1 2.29 0 20 20 0 0 1 3.625 3.403 1 1 0 0 1-1.54 1.275A18 18 0 0 0 13 14.02V21a1 1 0 1 1-2 0v-6.98a18 18 0 0 0-2.23 2.248 1 1 0 0 1-1.54-1.275 20 20 0 0 1 3.625-3.402Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconCloudArrowUpload
