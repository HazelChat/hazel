import type { SVGProps } from "react"

type IconProps = SVGProps<SVGSVGElement> & {
	secondaryfill?: string
	title?: string
}

export function IconFile({ fill = "currentColor", secondaryfill, title = "file", ...props }: IconProps) {
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
					d="M14.25 17H3.75C2.507 17 1.5 15.993 1.5 14.75V3.25C1.5 2.007 2.507 1 3.75 1H10.25C10.449 1 10.64 1.079 10.78 1.22L16.28 6.72C16.421 6.86 16.5 7.051 16.5 7.25V14.75C16.5 15.993 15.493 17 14.25 17Z"
					fill={secondaryfill}
					opacity="0.4"
				/>
				<path
					d="M16.28 6.72L10.78 1.22C10.64 1.079 10.449 1 10.25 1V6.25C10.25 6.664 10.586 7 11 7H16.5C16.5 7.051 16.421 6.86 16.28 6.72Z"
					fill={fill}
				/>
			</g>
		</svg>
	)
}

export default IconFile
