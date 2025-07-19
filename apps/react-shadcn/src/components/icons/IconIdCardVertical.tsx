// icons/svgs/solid/users

import type React from "react"
import type { SVGProps } from "react"

export const IconIdCardVertical: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M8.8 2h-.041c-.805 0-1.47 0-2.01.044-.563.046-1.08.145-1.565.392a4 4 0 0 0-1.748 1.748c-.247.485-.346 1.002-.392 1.564C3 6.29 3 6.954 3 7.758v8.483c0 .805 0 1.47.044 2.01.046.563.145 1.08.392 1.565a4 4 0 0 0 1.748 1.748c.485.247 1.002.346 1.564.392C7.29 22 7.954 22 8.758 22h6.484c.805 0 1.47 0 2.01-.044.563-.046 1.08-.145 1.565-.392a4 4 0 0 0 1.748-1.748c.247-.485.346-1.002.392-1.564.044-.541.044-1.206.044-2.01V7.758c0-.805 0-1.47-.044-2.01-.046-.563-.145-1.08-.392-1.565a4 4 0 0 0-1.748-1.748c-.485-.247-1.002-.346-1.564-.392C16.71 2 16.046 2 15.242 2zM10 17.333A2.333 2.333 0 0 1 12.333 15h3.334A2.333 2.333 0 0 1 18 17.333c0 .92-.746 1.667-1.667 1.667h-4.666c-.92 0-1.667-.746-1.667-1.667ZM14 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM6 6a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2H7a1 1 0 0 1-1-1Zm1 3a1 1 0 0 0 0 2h3a1 1 0 0 0 0-2z"
				clipRule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconIdCardVertical
