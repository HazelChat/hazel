// icons/svgs/solid/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconArrowBigDownLeft: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M14.957 20.08a1 1 0 0 0 .472-1.773q-1.136-.9-2.226-1.853l6.29-6.29q.254-.247.487-.511c.179-.2.316-.434.403-.687a2 2 0 0 0 0-1.236 2 2 0 0 0-.403-.686c-.135-.16-.309-.333-.487-.512l-.023-.022-1.98-1.98-.022-.023c-.178-.178-.352-.352-.51-.487a2 2 0 0 0-.688-.402 2 2 0 0 0-1.236 0c-.29.094-.512.253-.686.402a9 9 0 0 0-.512.487l-.022.023-6.268 6.267A60 60 0 0 1 5.693 8.57a1 1 0 0 0-1.773.473 36.2 36.2 0 0 0-.182 9.354 2.11 2.11 0 0 0 1.864 1.865c3.113.343 6.258.281 9.355-.183Z"
				clipRule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconArrowBigDownLeft
