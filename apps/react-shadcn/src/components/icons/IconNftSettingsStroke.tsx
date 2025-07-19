// icons/svgs/stroke/web3-&-crypto

import type React from "react"
import type { SVGProps } from "react"

export const IconNftSettingsStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M11.174 21h-.428c-.773 0-1.33 0-1.778-.035m12.445-9.752A3 3 0 0 0 21.36 11m0 0h-2.322c-.935 0-1.402 0-1.796.034-4.381.38-7.855 3.83-8.238 8.182-.034.386-.035.843-.035 1.749M21.36 11c-.15-.519-.458-1.067-1.005-2.045l-1.49-2.663c-.67-1.198-1.004-1.797-1.481-2.233a4 4 0 0 0-1.466-.857C15.302 3 14.612 3 13.232 3h-2.486c-1.38 0-2.07 0-2.685.202a4 4 0 0 0-1.466.857c-.477.436-.812 1.035-1.482 2.233l-1.454 2.6c-.635 1.134-.952 1.702-1.076 2.302-.11.532-.11 1.08 0 1.612.124.6.441 1.168 1.076 2.302l1.454 2.6c.67 1.198 1.005 1.797 1.482 2.234.422.385.921.677 1.466.856a3.8 3.8 0 0 0 .907.167M18 18h.01m-9.042-8a1.003 1.003 0 0 1-1.007-1c0-.552.451-1 1.007-1s1.007.448 1.007 1-.45 1-1.007 1ZM18 14l1.179 1.155 1.65.017.017 1.65L22 18l-1.154 1.179-.018 1.65-1.65.017L18 22l-1.179-1.154-1.65-.018-.016-1.65L14 18l1.155-1.179.017-1.65 1.65-.016z"
				fill="none"
			/>
		</svg>
	)
}

export default IconNftSettingsStroke
