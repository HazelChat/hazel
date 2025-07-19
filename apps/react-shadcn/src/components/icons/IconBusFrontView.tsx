// icons/svgs/solid/automotive

import type React from "react"
import type { SVGProps } from "react"

export const IconBusFrontView: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M13.708 2h-3.416C9.238 2 8.389 2 7.7 2.055c-.709.056-1.332.175-1.911.46a5 5 0 0 0-1.902 1.642A4 4 0 0 0 1 8v.5A1.5 1.5 0 0 0 2.5 10H3v10.5a2.5 2.5 0 0 0 5 0V20h8v.5a2.5 2.5 0 0 0 5 0V10h.5A1.5 1.5 0 0 0 23 8.5V8c0-1.823-1.22-3.36-2.887-3.843a5 5 0 0 0-1.902-1.641c-.579-.286-1.202-.405-1.911-.461C15.61 2 14.762 2 13.708 2ZM19 12V9.333c0-1.104 0-1.874-.048-2.475-.047-.588-.135-.928-.261-1.185a3 3 0 0 0-1.364-1.364c-.257-.126-.597-.214-1.186-.26C15.542 4 14.772 4 13.668 4h-3.334C9.23 4 8.46 4 7.858 4.048c-.588.047-.928.135-1.185.261A3 3 0 0 0 5.31 5.673c-.127.257-.214.597-.26 1.185C5 7.458 5 8.228 5 9.333V12zM3 8q0-.087.007-.172L3.005 8zm18 0h-.005l-.002-.173Q21 7.913 21 8ZM7 15a1 1 0 1 0 0 2h1a1 1 0 1 0 0-2zm8 1a1 1 0 0 1 1-1h1a1 1 0 1 1 0 2h-1a1 1 0 0 1-1-1Z"
				clipRule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconBusFrontView
