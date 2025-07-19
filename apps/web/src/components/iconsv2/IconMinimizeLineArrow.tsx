// solid/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconMinimizeLineArrow: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M20.707 3.293a1 1 0 0 1 0 1.414l-3.87 3.87q.274.252.557.495l1.659 1.425q.045.038.084.081a1 1 0 0 1 .26.589 1 1 0 0 1-.828 1.074 21.7 21.7 0 0 1-5.568.225 1.62 1.62 0 0 1-.99-.456c.258.263.421.61.455.99a21.5 21.5 0 0 1-.118 4.874 22 22 0 0 1-.107.695 1 1 0 0 1-1.755.471l-1.414-1.647a23 23 0 0 0-.494-.557l-3.87 3.871a1 1 0 0 1-1.415-1.414l3.87-3.87a23 23 0 0 0-.557-.495l-1.645-1.414a.996.996 0 0 1-.266-1.197 1 1 0 0 1 .736-.559 21.7 21.7 0 0 1 5.568-.224c.38.034.728.197.99.455a1.62 1.62 0 0 1-.455-.99 21.4 21.4 0 0 1 .118-4.873 22 22 0 0 1 .116-.742 1 1 0 0 1 1.735-.437l1.425 1.66q.243.282.494.556l3.87-3.87a1 1 0 0 1 1.415 0Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconMinimizeLineArrow
