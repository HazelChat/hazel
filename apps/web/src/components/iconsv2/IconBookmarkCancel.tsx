// solid/files-&-folders
import type { Component, JSX } from "solid-js"

export const IconBookmarkCancel: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				fill-rule="evenodd"
				d="M11.8 1h.4c1.669 0 2.748 0 3.654.294a6 6 0 0 1 3.852 3.852c.295.906.294 1.986.294 3.655V22a1 1 0 0 1-1.65.758l-1.794-1.537c-.936-.802-1.596-1.367-2.15-1.773-.543-.398-.926-.599-1.287-.704a4 4 0 0 0-2.238 0c-.361.105-.744.306-1.288.704-.553.406-1.213.971-2.148 1.773L5.65 22.759A1 1 0 0 1 4 22V8.8c0-1.669 0-2.748.294-3.654a6 6 0 0 1 3.852-3.852C9.052.999 10.132 1 11.8 1Zm-1.593 5.793a1 1 0 1 0-1.414 1.414l1.768 1.768-1.768 1.768a1 1 0 0 0 1.414 1.414l1.768-1.768 1.768 1.768a1 1 0 0 0 1.414-1.414l-1.768-1.768 1.768-1.768a1 1 0 0 0-1.414-1.414L11.975 8.56z"
				clip-rule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconBookmarkCancel
