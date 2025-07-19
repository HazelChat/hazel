// solid/weather
import type { Component, JSX } from "solid-js"

export const IconSun: Component<JSX.IntrinsicElements["svg"]> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g clip-path="url(#icon-x36qq4km5-a)">
				<path
					fill="currentColor"
					d="M12 0c.5523 0 1 .4477 1 1v1c0 .5523-.4477 1-1 1s-1-.4477-1-1V1c0-.5523.4477-1 1-1Z"
				/>
				<path
					fill="currentColor"
					d="M3.5147 3.5147c.3905-.3905 1.0237-.3905 1.4142 0l.7071.7071c.3906.3906.3906 1.0237 0 1.4142-.3905.3906-1.0236.3906-1.4142 0l-.707-.707c-.3906-.3906-.3906-1.0238 0-1.4143Z"
				/>
				<path
					fill="currentColor"
					d="M20.4853 3.5147c.3905.3905.3905 1.0237 0 1.4142l-.7071.7071c-.3906.3906-1.0237.3906-1.4142 0-.3906-.3905-.3906-1.0236 0-1.4142l.7071-.707c.3905-.3906 1.0237-.3906 1.4142 0Z"
				/>
				<path
					fill="currentColor"
					d="M0 12c0-.5523.4477-1 1-1h1c.5523 0 1 .4477 1 1s-.4477 1-1 1H1c-.5523 0-1-.4477-1-1Z"
				/>
				<path
					fill="currentColor"
					d="M21 12c0-.5523.4477-1 1-1h1c.5523 0 1 .4477 1 1s-.4477 1-1 1h-1c-.5523 0-1-.4477-1-1Z"
				/>
				<path
					fill="currentColor"
					d="M5.636 18.364c.3906.3905.3906 1.0236 0 1.4142l-.707.7071c-.3906.3905-1.0238.3905-1.4143 0s-.3905-1.0237 0-1.4142l.7071-.7071c.3906-.3906 1.0237-.3906 1.4142 0Z"
				/>
				<path
					fill="currentColor"
					d="M18.364 18.364c.3905-.3906 1.0236-.3906 1.4142 0l.7071.7071c.3905.3905.3905 1.0237 0 1.4142s-1.0237.3905-1.4142 0l-.7071-.7071c-.3906-.3906-.3906-1.0237 0-1.4142Z"
				/>
				<path
					fill="currentColor"
					d="M12 21c.5523 0 1 .4477 1 1v1c0 .5523-.4477 1-1 1s-1-.4477-1-1v-1c0-.5523.4477-1 1-1Z"
				/>
				<path
					fill="currentColor"
					d="M5 12c0-3.866 3.134-7 7-7s7 3.134 7 7-3.134 7-7 7-7-3.134-7-7Z"
				/>
			</g>
			<defs>
				<clipPath id="icon-x36qq4km5-a">
					<path fill="currentColor" d="M0 0h24v24H0z" />
				</clipPath>
			</defs>
		</svg>
	)
}

export default IconSun
