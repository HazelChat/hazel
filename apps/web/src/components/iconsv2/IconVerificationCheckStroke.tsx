// stroke/general
import type { Component, JSX } from "solid-js"

export const IconVerificationCheckStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="m9 12.14 2.007 2.005a12.84 12.84 0 0 1 3.906-4.23l.087-.06M21.25 12c0-1.29-.794-2.41-1.976-3.014.415-1.255.18-2.617-.731-3.529-.912-.911-2.274-1.146-3.529-.73C14.42 3.543 13.291 2.75 12 2.75s-2.41.794-3.005 1.976c-1.264-.415-2.626-.18-3.538.731-.911.912-1.137 2.274-.722 3.529C3.553 9.59 2.75 10.709 2.75 12s.803 2.41 1.985 3.014c-.415 1.255-.19 2.617.722 3.529s2.274 1.137 3.529.73C9.59 20.457 10.709 21.25 12 21.25s2.419-.794 3.014-1.976c1.255.406 2.617.18 3.529-.731.911-.912 1.146-2.274.73-3.529 1.183-.604 1.977-1.723 1.977-3.014Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconVerificationCheckStroke
