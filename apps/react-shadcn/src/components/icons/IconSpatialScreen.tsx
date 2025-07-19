// icons/svgs/solid/ar-&-vr

import type React from "react"
import type { SVGProps } from "react"

export const IconSpatialScreen: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M6.568 3c-.252 0-.498 0-.706.017a2 2 0 0 0-.77.201 2 2 0 0 0-.874.874 2 2 0 0 0-.201.77C4 5.07 4 5.316 4 5.568v9.864c0 .252 0 .498.017.706.019.229.063.499.201.77a2 2 0 0 0 .874.874c.271.138.541.182.77.201.208.017.454.017.706.017h12.864c.252 0 .498 0 .706-.017a2 2 0 0 0 .77-.201 2 2 0 0 0 .874-.874 2 2 0 0 0 .201-.77c.017-.208.017-.454.017-.706V5.568c0-.252 0-.498-.017-.706a2 2 0 0 0-.201-.77 2 2 0 0 0-.874-.874 2 2 0 0 0-.77-.201C19.93 3 19.684 3 19.432 3z"
				fill="currentColor"
			/>
			<path d="M3 7a1 1 0 1 0-2 0v7a1 1 0 1 0 2 0z" fill="currentColor" />
			<path d="M11 20a1 1 0 1 0 0 2h5a1 1 0 1 0 0-2z" fill="currentColor" />
		</svg>
	)
}

export default IconSpatialScreen
