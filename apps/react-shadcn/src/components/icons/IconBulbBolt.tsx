// icons/svgs/solid/appliances

import type React from "react"
import type { SVGProps } from "react"

export const IconBulbBolt: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M4 9.737C4 5.428 7.618 2 12 2s8 3.428 8 7.737c0 2.357-1.09 4.46-2.79 5.872-.548.454-.914.936-1.046 1.442l-.28 1.078A2.5 2.5 0 0 1 13.465 20h-2.929a2.5 2.5 0 0 1-2.42-1.871l-.28-1.078c-.13-.506-.497-.988-1.044-1.442C5.09 14.197 4 12.094 4 9.737Zm9.212-2.475a1 1 0 0 0-1.654-1.125l-1.829 2.69a1.23 1.23 0 0 0-.078 1.304c.21.383.583.605.962.666l1.273.207-1.308 1.681a1 1 0 1 0 1.578 1.228l2.087-2.683.022-.03c.294-.408.302-.918.08-1.32a1.33 1.33 0 0 0-.958-.659l-1.358-.22z"
				fill="currentColor"
			/>
			<path d="M9 22a1 1 0 0 1 1-1h4a1 1 0 1 1 0 2h-4a1 1 0 0 1-1-1Z" fill="currentColor" />
		</svg>
	)
}

export default IconBulbBolt
