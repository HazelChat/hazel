// icons/svgs/solid/ai

import type React from "react"
import type { SVGProps } from "react"

export const IconCloudAi: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12.593 13.435a5 5 0 0 0-.496-.435 4.8 4.8 0 0 0 .903-.902 4.8 4.8 0 0 0 .903.902 4.8 4.8 0 0 0-.903.902 5 5 0 0 0-.407-.467Z"
				fill="currentColor"
			/>
			<path
				d="M19.465 8.715a7.502 7.502 0 0 0-14.348 1.46A5.502 5.502 0 0 0 6.5 21h10a6.5 6.5 0 0 0 2.965-12.285Zm-5.535.918c.293.743.566 1.19.896 1.523s.781.614 1.54.914a1 1 0 0 1 0 1.86c-.759.3-1.21.582-1.54.914s-.603.78-.896 1.523a1 1 0 0 1-1.86 0c-.293-.743-.566-1.19-.896-1.523s-.781-.614-1.54-.914a1 1 0 0 1 0-1.86c.759-.3 1.21-.582 1.54-.914s.603-.78.896-1.523a1 1 0 0 1 1.86 0ZM9 16za1 1 0 1 1 0 2h0a1 1 0 1 1 0-2Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconCloudAi
