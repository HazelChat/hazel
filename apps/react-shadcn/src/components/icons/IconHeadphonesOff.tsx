// icons/svgs/solid/media

import type React from "react"
import type { SVGProps } from "react"

export const IconHeadphonesOff: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M22.707 2.707a1 1 0 0 0-1.414-1.414l-2.885 2.885A10.47 10.47 0 0 0 12 2C6.194 2 1.488 6.706 1.488 12.512c0 1.19.198 2.336.564 3.406l1.029 3.587-1.788 1.788a1 1 0 1 0 1.414 1.414zM12 4a8.47 8.47 0 0 1 4.979 1.607l-8.436 8.436-.003-.01A3.378 3.378 0 0 0 3.498 12.1 8.51 8.51 0 0 1 12 4Z"
				clipRule="evenodd"
				fill="currentColor"
			/>
			<path
				d="M21.713 8.486a1 1 0 1 0-1.847.766c.367.884.589 1.843.636 2.85a3.38 3.38 0 0 0-5.042 1.93l-1.049 3.658a3.378 3.378 0 1 0 6.495 1.862l1.042-3.634a10.5 10.5 0 0 0 .564-3.406c0-1.424-.284-2.785-.799-4.026Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconHeadphonesOff
