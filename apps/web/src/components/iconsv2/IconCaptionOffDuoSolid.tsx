// duo-solid/media
import type { Component, JSX } from "solid-js"

export const IconCaptionOffDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g fill="currentColor" opacity=".28">
				<path
					fill="currentColor"
					d="M9.357 3C8.273 3 7.4 3 6.691 3.058c-.728.06-1.369.185-1.96.487A5 5 0 0 0 2.544 5.73c-.302.592-.428 1.233-.487 1.961C2 8.4 2 9.273 2 10.357v3.286c0 1.084 0 1.958.058 2.666.06.729.185 1.369.487 1.961a5 5 0 0 0 1.6 1.835 1 1 0 0 0 1.278-.114L19.991 5.423a1 1 0 0 0-.136-1.528 5 5 0 0 0-.585-.35c-.592-.302-1.232-.428-1.961-.487C16.6 3 15.727 3 14.643 3z"
				/>
				<path
					fill="currentColor"
					d="M21.988 8.644a1 1 0 0 0-1.707-.683L8.95 19.293A1 1 0 0 0 9.656 21h4.987c1.084 0 1.958 0 2.666-.058.729-.06 1.369-.185 1.961-.487a5 5 0 0 0 2.185-2.185c.302-.592.428-1.232.487-1.961C22 15.6 22 14.727 22 13.643V10.39c0-.662 0-1.241-.012-1.746Z"
				/>
			</g>
			<path
				fill="currentColor"
				d="M22.707 2.707a1 1 0 0 0-1.414-1.414L8.756 13.83a2 2 0 0 1-.506-1.33V12a2 2 0 0 1 2-2 1 1 0 1 0 0-2 4 4 0 0 0-4 4v.5a4 4 0 0 0 1.09 2.745l-6.047 6.048a1 1 0 1 0 1.414 1.414z"
			/>
			<path
				fill="currentColor"
				d="M16.75 14.5a2 2 0 0 1-1.826-1.182l-1.461 1.461A4 4 0 0 0 16.75 16.5a1 1 0 1 0 0-2Z"
			/>
		</svg>
	)
}

export default IconCaptionOffDuoSolid
