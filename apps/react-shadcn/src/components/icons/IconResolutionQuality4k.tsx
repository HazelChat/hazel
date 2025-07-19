// icons/svgs/solid/media

import type React from "react"
import type { SVGProps } from "react"

export const IconResolutionQuality4k: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M9.357 3h5.286c1.084 0 1.958 0 2.666.058.729.06 1.369.185 1.961.487a5 5 0 0 1 2.185 2.185c.302.592.428 1.233.487 1.961C22 8.4 22 9.273 22 10.357v3.286c0 1.084 0 1.958-.058 2.666-.06.729-.185 1.369-.487 1.961a5 5 0 0 1-2.185 2.185c-.592.302-1.232.428-1.961.487C16.6 21 15.727 21 14.643 21H9.357c-1.084 0-1.958 0-2.666-.058-.728-.06-1.369-.185-1.96-.487a5 5 0 0 1-2.186-2.185c-.302-.592-.428-1.232-.487-1.961C2 15.6 2 14.727 2 13.643v-3.286c0-1.084 0-1.958.058-2.666.06-.728.185-1.369.487-1.96A5 5 0 0 1 4.73 3.544c.592-.302 1.233-.428 1.961-.487C7.4 3 8.273 3 9.357 3Zm8.552 6.504a1 1 0 1 0-1.302-1.518l-1.854 1.59v-.83a1 1 0 0 0-2 0v6.51a1 1 0 1 0 2 0v-1.092l1.798 1.798a1 1 0 0 0 1.414-1.414l-2.742-2.742zM7.742 8.745a1 1 0 1 0-2 0v3.506a1 1 0 0 0 1 1h2.505v2.004a1 1 0 1 0 2 0v-6.51a1 1 0 1 0-2 0v2.506H7.742z"
				clipRule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconResolutionQuality4k
