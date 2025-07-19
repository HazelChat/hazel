// solid/general
import type { Component, JSX } from "solid-js"

export const IconSpotlight: Component<JSX.IntrinsicElements["svg"]> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g clip-path="url(#icon-39n3u6wea-a)">
				<path
					fill="currentColor"
					d="M6.286 2.108A3 3 0 0 0 1.37 5.549l1.147 1.638a1 1 0 0 0 1.393.246l3.276-2.294a1 1 0 0 0 .246-1.393zm-3.031.901a1 1 0 0 1 1.393.246l.573.819-1.638 1.147-.574-.819a1 1 0 0 1 .246-1.393Z"
				/>
				<path
					fill="currentColor"
					d="M10.03 6.288a1 1 0 1 0-1.404 1.423l10.101 9.975A20 20 0 0 0 16 17.5c-2.026 0-3.877.306-5.248.735a8.5 8.5 0 0 0-1.372.549L5.644 9.622a1 1 0 0 0-1.852.755l4.232 10.379c.059.303.212.543.352.71.181.216.409.394.636.539.456.291 1.06.547 1.74.76 1.37.429 3.222.735 5.248.735s3.877-.306 5.248-.735c.68-.213 1.284-.469 1.74-.76.227-.145.455-.323.636-.54.177-.21.376-.54.376-.965 0-.524-.298-.904-.519-1.12a3.4 3.4 0 0 0-.718-.52z"
				/>
			</g>
			<defs>
				<clipPath id="icon-39n3u6wea-a">
					<path fill="currentColor" d="M0 0h24v24H0z" />
				</clipPath>
			</defs>
		</svg>
	)
}

export default IconSpotlight
