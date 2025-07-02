import type { Field } from "@ark-ui/solid"
import type { PolymorphicProps } from "@kobalte/core"
import * as TextFieldPrimitive from "@kobalte/core/text-field"
import { type JSXElement, mergeProps, Show, splitProps, type ValidComponent } from "solid-js"
import { cn } from "~/lib/utils"
import { FieldErrorText, FieldGroup, FieldHelperText, FieldInput, FieldLabel, FieldRoot } from "./field"

type KobaltTextFieldTextFieldRootProps<T extends ValidComponent = "div"> =
	TextFieldPrimitive.TextFieldRootProps<T> & {
		class?: string | undefined
	}

export const KobaltTextField = <T extends ValidComponent = "div">(
	props: PolymorphicProps<T, KobaltTextFieldTextFieldRootProps<T>>,
) => {
	const [local, others] = splitProps(props as KobaltTextFieldTextFieldRootProps, ["class"])
	return <TextFieldPrimitive.Root class={cn("flex flex-col gap-1", local.class)} {...others} />
}

export interface TextFieldProps extends Omit<Field.InputProps, "prefix"> {
	label?: string
	helperText?: string
	errorText?: string

	prefix?: JSXElement
	suffix?: JSXElement

	isInvalid?: boolean
}

export const TextField = (props: TextFieldProps) => {
	const [specialProps, fieldRootProps, rest] = splitProps(
		props,
		["prefix", "suffix", "label", "helperText", "errorText"],
		["isInvalid"],
	)

	return (
		<FieldRoot invalid={fieldRootProps.isInvalid}>
			<Show when={specialProps.label}>
				<FieldLabel>{specialProps.label}</FieldLabel>
			</Show>
			<FieldGroup>
				<Show when={specialProps.prefix}>
					<Show when={typeof specialProps.prefix === "string"} fallback={specialProps.prefix}>
						<span class="ml-2 text-muted-foreground">{specialProps.prefix}</span>
					</Show>
				</Show>
				<FieldInput
					{...rest}
					class="w-full min-w-0 bg-transparent px-2.5 py-2 text-base text-foreground placeholder-muted-foreground outline-hidden focus:outline-hidden sm:text-sm/6 [&::-ms-reveal]:hidden [&::-webkit-search-cancel-button]:hidden"
				/>
				<Show when={specialProps.suffix}>
					<Show when={typeof specialProps.suffix === "string"} fallback={specialProps.suffix}>
						<span class="mr-2 text-muted-foreground">{specialProps.suffix}</span>
					</Show>
				</Show>
			</FieldGroup>
			<Show when={specialProps.helperText}>
				<FieldHelperText>{specialProps.helperText}</FieldHelperText>
			</Show>
			<FieldErrorText>{specialProps.errorText}</FieldErrorText>
		</FieldRoot>
	)
}

type TextFieldInputProps<T extends ValidComponent = "input"> = TextFieldPrimitive.TextFieldInputProps<T> & {
	class?: string | undefined
	type?:
		| "button"
		| "checkbox"
		| "color"
		| "date"
		| "datetime-local"
		| "email"
		| "file"
		| "hidden"
		| "image"
		| "month"
		| "number"
		| "password"
		| "radio"
		| "range"
		| "reset"
		| "search"
		| "submit"
		| "tel"
		| "text"
		| "time"
		| "url"
		| "week"
}

export const TextFieldInput = <T extends ValidComponent = "input">(
	rawProps: PolymorphicProps<T, TextFieldInputProps<T>>,
) => {
	const props = mergeProps<TextFieldInputProps<T>[]>({ type: "text" }, rawProps)
	const [local, others] = splitProps(props as TextFieldInputProps, ["type", "class"])
	return (
		<TextFieldPrimitive.Input
			type={local.type}
			class={cn(
				"flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:font-medium file:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[invalid]:border-error-foreground data-[invalid]:text-error-foreground",
				local.class,
			)}
			{...others}
		/>
	)
}
