import { type ParentComponent, Show, createSignal, onCleanup, onMount } from "solid-js"

type MessageOnScreenProps = {
	/**
	 * An estimated height for the message. This is used for the placeholder
	 * element to prevent the scrollbar from jumping when messages are loaded.
	 * A reasonable average like '70px' is a good start.
	 */
	estimatedHeight: string
	/**
	 * A larger rootMargin is better for chat apps to ensure messages are
	 * rendered well before they appear, creating a smoother scroll experience.
	 * Defaults to '250px'.
	 */
	rootMargin?: string
}

/**
 * A wrapper that conditionally renders its children only when they are near
 * the viewport. It uses a placeholder with a fixed height to prevent
 * layout shifts and scrollbar jumps, making it ideal for chat applications.
 */
export const MessageOnScreen: ParentComponent<MessageOnScreenProps> = (props) => {
	let placeholderRef: HTMLDivElement | undefined
	const [shouldRender, setShouldRender] = createSignal(false)

	onMount(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setShouldRender(true)
					// The placeholder is no longer needed, so we can stop observing it.
					observer.unobserve(placeholderRef!)
				}
			},
			{
				// A larger margin is better for a smooth chat scrolling experience
				rootMargin: props.rootMargin ?? "500px 0px",
			},
		)

		observer.observe(placeholderRef!)

		onCleanup(() => observer.disconnect())
	})

	return (
		<Show
			when={shouldRender()}
			fallback={<div ref={placeholderRef} style={{ height: props.estimatedHeight }} />}
		>
			{props.children}
		</Show>
	)
}
