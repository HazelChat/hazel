// icons/svgs/duo-solid/food

import type React from "react"
import type { SVGProps } from "react"

export const IconEggBrokenDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				fill="currentColor"
				d="M12 1.5c-1.34 0-2.536.619-3.533 1.486-.997.869-1.86 2.04-2.564 3.301-1.4 2.505-2.292 5.575-2.292 7.824a8.389 8.389 0 1 0 16.778 0c0-2.25-.892-5.32-2.291-7.824-.705-1.26-1.568-2.432-2.565-3.3S13.341 1.5 12 1.5Z"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M6.015 6.089q.602.254 1.152.595A8.6 8.6 0 0 1 9.34 8.605l-1.428 1.977c-.24.332-.281.801-.04 1.187.787 1.252 1.885 2.32 3.465 2.854a1 1 0 0 0 .64-1.894c-.845-.286-1.51-.806-2.056-1.513l1.425-1.972c.257-.355.292-.856.021-1.256a10.46 10.46 0 0 0-4.224-3.586c-.41.524-.786 1.094-1.128 1.687Z"
			/>
		</svg>
	)
}

export default IconEggBrokenDuoSolid
