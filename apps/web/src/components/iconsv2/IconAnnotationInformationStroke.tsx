// stroke/communication
import type { Component, JSX } from "solid-js"

export const IconAnnotationInformationStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 10.501v4M11.993 7h.01m4.573 11.207a1.9 1.9 0 0 0-1.233.616c-.335.37-.61.802-.91 1.2-.825 1.1-1.238 1.651-1.744 1.848a1.9 1.9 0 0 1-1.376 0c-.506-.197-.92-.747-1.745-1.848-.298-.398-.575-.83-.91-1.2a1.9 1.9 0 0 0-1.23-.616c-.572-.053-1.15.035-1.72-.055a3.8 3.8 0 0 1-3.16-3.159c-.047-.295-.047-.648-.047-1.354V9.08c0-2.128 0-3.192.414-4.004a3.8 3.8 0 0 1 1.661-1.66C5.388 3 6.452 3 8.58 3h6.84c2.127 0 3.191 0 4.004.414a3.8 3.8 0 0 1 1.66 1.66c.416.813.416 1.877.416 4.006v4.56c0 .705 0 1.058-.047 1.353a3.8 3.8 0 0 1-3.16 3.16c-.57.09-1.148 0-1.72.054z"
				fill="none"
			/>
		</svg>
	)
}

export default IconAnnotationInformationStroke
