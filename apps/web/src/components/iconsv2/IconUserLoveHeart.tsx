// solid/users
import type { Component, JSX } from "solid-js"

export const IconUserLoveHeart: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M10.711 14H8a5 5 0 0 0-5 5 3 3 0 0 0 3 3h6.582C11.447 20.936 10 19.113 10 16.653c0-1.005.266-1.899.711-2.653Z"
				fill="currentColor"
			/>
			<path
				d="M18.614 13.32a3 3 0 0 0-1.617.422c-.516-.314-1.09-.422-1.597-.422-1.67 0-3.4 1.34-3.4 3.333 0 1.802 1.174 3.221 2.194 4.108a9.6 9.6 0 0 0 1.516 1.08c.222.127.43.232.61.309.089.038.183.074.274.102.068.021.224.067.406.067s.338-.046.406-.067q.139-.044.274-.102a6 6 0 0 0 .61-.309 9.6 9.6 0 0 0 1.516-1.08c1.02-.887 2.194-2.306 2.194-4.108 0-2.003-1.74-3.31-3.386-3.333Z"
				fill="currentColor"
			/>
			<path d="M12 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z" fill="currentColor" />
		</svg>
	)
}

export default IconUserLoveHeart
