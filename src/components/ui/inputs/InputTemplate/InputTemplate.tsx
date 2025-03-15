import { memo } from "react";
import { InputPropsBase } from "src/components/ui/inputs/InputTypes";
import { composeStrBool } from "src/utils/stringUtils";

type InputTemplateProps<T> = InputPropsBase<T> & { children: React.ReactNode };

function InputTemplate<T>({
	label,
	readOnly,
	isValid,
	validationMsg,
	children,
	renderCustomButtons,
	onChange,
}: InputTemplateProps<T>) {
	const deleteValue = () => {
		onChange?.(undefined);
	};

	const inputClassNames = composeStrBool(
		[
			[isValid === false, "input-template--invalid"],
			[!!readOnly, "input-template--read-only"],
		],
		"input-template",
	);

	return (
		<div className={inputClassNames}>
			<div className="input-template__label">
				{label ?? ""}
				{isValid === false && validationMsg ? ` [${validationMsg}]` : ""}
			</div>

			<div className="input-template__input-container">
				<div className="input-template__input">{children}</div>

				<div className="input-template__buttons">
					<button className="input-template__button-clear" onClick={deleteValue}>
						<i className="icon-clear" />
					</button>

					{renderCustomButtons?.()}
				</div>
			</div>
		</div>
	);
}

export default memo(InputTemplate);
