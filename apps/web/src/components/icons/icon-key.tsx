import type { SVGProps } from "react"

type IconProps = SVGProps<SVGSVGElement> & {
	secondaryfill?: string
	title?: string
}

export function IconKey({ fill = "currentColor", secondaryfill, title = "key", ...props }: IconProps) {
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
					d="M11.5 8C13.433 8 15 6.433 15 4.5C15 2.567 13.433 1 11.5 1C9.567 1 8 2.567 8 4.5C8 6.433 9.567 8 11.5 8Z"
					fill={secondaryfill}
					opacity="0.4"
				/>
				<path
					d="M11.5 6.5C12.6046 6.5 13.5 5.60457 13.5 4.5C13.5 3.39543 12.6046 2.5 11.5 2.5C10.3954 2.5 9.5 3.39543 9.5 4.5C9.5 5.60457 10.3954 6.5 11.5 6.5Z"
					fill={fill}
				/>
				<path
					d="M8.634 7.366L2.78 13.22C2.64 13.36 2.561 13.549 2.561 13.75V16.25C2.561 16.664 2.897 17 3.311 17H5.811C6.225 17 6.561 16.664 6.561 16.25V15H7.811C8.225 15 8.561 14.664 8.561 14.25V13H9.811C10.012 13 10.201 12.921 10.341 12.78L10.634 12.487C9.385 11.632 8.434 10.405 7.938 8.964L8.634 7.366Z"
					fill={fill}
				/>
			</g>
		</svg>
	)
}

export default IconKey
