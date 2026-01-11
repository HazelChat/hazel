import type { SVGProps } from "react"

type IconProps = SVGProps<SVGSVGElement> & {
	secondaryfill?: string
	title?: string
}

export function IconChevronDown({ fill = "currentColor", title = "chevron-down", ...props }: IconProps) {
	return (
		<svg
			height="12"
			width="12"
			data-slot="icon"
			viewBox="0 0 12 12"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<title>{title}</title>
			<g fill={fill}>
				<path
					d="m6,9.25c-.192,0-.384-.073-.53-.22L1.22,4.78c-.293-.293-.293-.768,0-1.061s.768-.293,1.061,0l3.72,3.72,3.72-3.72c.293-.293.768-.293,1.061,0s.293.768,0,1.061l-4.25,4.25c-.146.146-.338.22-.53.22Z"
					fill={fill}
				/>
			</g>
		</svg>
	)
}

export default IconChevronDown
