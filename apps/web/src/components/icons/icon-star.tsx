import type { SVGProps } from "react"

type IconProps = SVGProps<SVGSVGElement> & {
	secondaryfill?: string
	strokewidth?: number
}

export function IconStar({ fill = "currentColor", secondaryfill, ...props }: IconProps) {
	secondaryfill = secondaryfill || fill

	return (
		<svg
			height="48"
			width="48"
			data-slot="icon"
			viewBox="0 0 48 48"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<g fill={fill}>
				<path
					d="M24 2L30.7949 15.8188L46 18.0375L34.9975 28.8033L37.5928 44L24 36.8282L10.4072 44L13.0025 28.8033L2 18.0375L17.2051 15.8188L24 2Z"
					fill={fill}
					fillRule="evenodd"
				/>
			</g>
		</svg>
	)
}
