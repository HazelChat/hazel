import type { SVGProps } from "react"

type IconProps = SVGProps<SVGSVGElement> & {
	secondaryfill?: string
	title?: string
}

export function IconMenu({ fill = "currentColor", title = "menu", ...props }: IconProps) {
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
					d="M15.75,9.75H2.25c-.414,0-.75-.336-.75-.75s.336-.75,.75-.75H15.75c.414,0,.75,.336,.75,.75s-.336,.75-.75,.75Z"
					fill={fill}
				/>
				<path
					d="M15.75,4.5H2.25c-.414,0-.75-.336-.75-.75s.336-.75,.75-.75H15.75c.414,0,.75,.336,.75,.75s-.336,.75-.75,.75Z"
					fill={fill}
				/>
				<path
					d="M15.75,15H2.25c-.414,0-.75-.336-.75-.75s.336-.75,.75-.75H15.75c.414,0,.75,.336,.75,.75s-.336,.75-.75,.75Z"
					fill={fill}
				/>
			</g>
		</svg>
	)
}

export default IconMenu
