import type { SVGProps } from "react"

type IconProps = SVGProps<SVGSVGElement> & {
	secondaryfill?: string
	title?: string
}

export function IconPlay({ fill = "currentColor", secondaryfill, title = "play", ...props }: IconProps) {
	secondaryfill = secondaryfill || fill

	return (
		<svg
			height="18"
			width="18"
			data-slot="icon"
			viewBox="0 0 18 18"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<title>{title}</title>
			<g fill={fill}>
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M1 9C1 4.58168 4.58179 1 9 1C13.4182 1 17 4.58168 17 9C17 13.4183 13.4182 17 9 17C4.58179 17 1 13.4183 1 9Z"
					fill={secondaryfill}
					opacity="0.4"
				/>
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M6.49896 6.87101C6.49896 5.905 7.54669 5.30636 8.37852 5.79096L12.0298 7.92011C12.857 8.40249 12.857 9.59852 12.0298 10.0809L8.37879 12.2099C7.54696 12.6945 6.49896 12.096 6.49896 11.13V6.87101Z"
					fill={fill}
				/>
			</g>
		</svg>
	)
}

export default IconPlay
