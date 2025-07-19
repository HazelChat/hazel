// icons/svgs/solid/general

import type React from "react"
import type { SVGProps } from "react"

export const IconHeartSupport: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M11.237 3.166c-1.75-1.302-3.908-1.454-5.779-.747A6.925 6.925 0 0 0 1 8.944c0 3.944 2.508 7.208 4.956 9.41a22.7 22.7 0 0 0 3.551 2.613 14 14 0 0 0 1.372.718c.192.085.375.157.54.21.14.044.357.105.581.105.299 0 .616-.111.827-.193.258-.1.562-.24.894-.412a20 20 0 0 0 2.375-1.477c1.354-.972 2.877-2.287 4.147-3.884q-.27-.062-.536-.137a11.7 11.7 0 0 1-5.325-3.224l-.353.402A4.168 4.168 0 0 1 7.62 7.748z"
				fill="currentColor"
			/>
			<path
				d="M21.481 14.232C22.386 12.673 23 10.892 23 8.944a6.92 6.92 0 0 0-4.46-6.52c-1.292-.488-2.721-.567-4.058-.141L9.19 8.987a2.168 2.168 0 0 0 3.334 2.771l1.115-1.274a1 1 0 0 1 1.548.052 9.7 9.7 0 0 0 5.063 3.436q.61.17 1.231.26Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconHeartSupport
