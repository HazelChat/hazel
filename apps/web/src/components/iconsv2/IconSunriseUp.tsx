// solid/weather
import type { Component, JSX } from "solid-js"

export const IconSunriseUp: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12 12a6 6 0 0 1 5.658 7.997l3.343.003a1 1 0 0 1-.002 2l-18-.016-.103-.005a1 1 0 0 1 .105-1.995l3.337.002A6 6 0 0 1 12 12Z"
				fill="currentColor"
			/>
			<path d="M3 16a1 1 0 1 1 0 2H2a1 1 0 1 1 0-2z" fill="currentColor" />
			<path d="M22.103 16.005a1 1 0 0 1 0 1.99L22 18h-1a1 1 0 1 1 0-2h1z" fill="currentColor" />
			<path
				d="M3.72 9.765a1 1 0 0 1 1.41-.096l.754.658.073.071a1 1 0 0 1-1.31 1.499l-.08-.064-.753-.658a1 1 0 0 1-.094-1.41Z"
				fill="currentColor"
			/>
			<path
				d="M18.876 9.669a1 1 0 0 1 1.316 1.506l-.753.658a1 1 0 0 1-1.316-1.506z"
				fill="currentColor"
			/>
			<path
				d="M12.132 2.006c.262.022.52.11.748.264l.111.082.312.26q.926.8 1.691 1.756l.25.321.057.085a1 1 0 0 1-1.592 1.195l-.065-.08-.212-.273A11 11 0 0 0 13 5.108V9a1 1 0 1 1-2 0V5.108q-.339.375-.644.782l-.065.079a1 1 0 0 1-1.534-1.28l.249-.32a13.2 13.2 0 0 1 2.003-2.017l.111-.082c.265-.18.573-.27.88-.27z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconSunriseUp
