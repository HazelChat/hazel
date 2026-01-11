import type { SVGProps } from "react"

type IconProps = SVGProps<SVGSVGElement> & {
	secondaryfill?: string
	title?: string
}

export function IconMinus({ fill = "currentColor", title = "minus", ...props }: IconProps) {
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
					d="M14.7501 9.75H3.25012C2.83602 9.75 2.50012 9.4141 2.50012 9C2.50012 8.5859 2.83602 8.25 3.25012 8.25H14.7501C15.1642 8.25 15.5001 8.5859 15.5001 9C15.5001 9.4141 15.1642 9.75 14.7501 9.75Z"
					fill={fill}
				/>
			</g>
		</svg>
	)
}

export default IconMinus
