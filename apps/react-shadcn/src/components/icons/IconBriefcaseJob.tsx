// icons/svgs/solid/general

import type React from "react"
import type { SVGProps } from "react"

export const IconBriefcaseJob: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12.138 2c.795 0 1.386-.001 1.897.136a4 4 0 0 1 2.829 2.829c.09.333.12.701.13 1.137.31.043.593.105.86.192a6 6 0 0 1 3.852 3.852c.14.427.213.892.251 1.44a4 4 0 0 1-3.643 3.402c-.147.011-.33.012-.814.012H13v-.2a1 1 0 1 0-2 0v.2H6.5c-.483 0-.667 0-.814-.012a4 4 0 0 1-3.643-3.402c.039-.548.112-1.013.25-1.44a6 6 0 0 1 3.853-3.852c.268-.087.55-.149.86-.192.01-.436.04-.804.13-1.137a4 4 0 0 1 2.829-2.829C10.476 2 11.067 2 11.863 2zM9.01 6h5.98a2.3 2.3 0 0 0-.058-.519 2 2 0 0 0-1.414-1.414C13.295 4.008 12.994 4 12 4s-1.295.008-1.517.068a2 2 0 0 0-1.415 1.414 2.3 2.3 0 0 0-.058.52Z"
				clipRule="evenodd"
				fill="currentColor"
			/>
			<path
				d="M11 17.2V17H6.45c-.416 0-.685 0-.92-.018a6 6 0 0 1-3.524-1.504c.017.984.076 1.725.288 2.376a6 6 0 0 0 3.852 3.852c.906.295 1.986.294 3.655.294H14.2c1.669 0 2.748 0 3.654-.294a6 6 0 0 0 3.852-3.852c.212-.651.271-1.392.288-2.376a6 6 0 0 1-3.523 1.504c-.236.018-.504.018-.921.018H13v.2a1 1 0 1 1-2 0Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconBriefcaseJob
