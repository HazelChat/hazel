import type { SVGProps } from "react"

type IconProps = SVGProps<SVGSVGElement> & {
	secondaryfill?: string
	title?: string
}

export function IconChevronRight({ fill = "currentColor", title = "chevron-right", ...props }: IconProps) {
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
					d="m4.25,11c-.192,0-.384-.073-.53-.22-.293-.293-.293-.768,0-1.061l3.72-3.72-3.72-3.72c-.293-.293-.293-.768,0-1.061s.768-.293,1.061,0l4.25,4.25c.293.293.293.768,0,1.061l-4.25,4.25c-.146.146-.338.22-.53.22Z"
					fill={fill}
				/>
			</g>
		</svg>
	)
}

export default IconChevronRight
