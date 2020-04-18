import { Component } from 'preact';

import { Button } from '../../components/Button';
import { ButtonGroup } from '../../components/ButtonGroup';
import {
	Form,
	FormField,
	TextInput,
	SelectInput,
	Validations,
} from '../../components/Form';
import Screen from '../../components/Screen';
import { createClassName, sortArrayByColumn } from '../../components/helpers';
import styles from './styles.scss';

const hasHelpTopicField = true;
const helptopics = [
	{
		_id: "NEED_PASSWORD_RESET",
		name: "Do you need password reset",
		showOnRegistration: true,
		showOnOfflineForm: true
	},
	{
		_id : "NEW_PORTAL_ACCOUNT",
		name : "Do you need a new portal account?",
		showOnRegistration: true,
		showOnOfflineForm: true
	}
];

const defaultTitle = I18n.t('Need help?');
const defaultMessage = I18n.t('Please, tell us some information to start the chat');

export default class Register extends Component {
	state = {
		name: null,
		email: null,
		helptopic: null,
		department: null,
	}

	validations = {
		name: [Validations.nonEmpty],
		email: [Validations.nonEmpty, Validations.email],
		department: [],
		helptopic: [],
	}

	getValidableFields = () => Object.keys(this.validations)
		.map((fieldName) => (this.state[fieldName] ? { fieldName, ...this.state[fieldName] } : null))
		.filter(Boolean)

	validate = (fieldName, value) => this.validations[fieldName].reduce((error, validation) => error || validation(value), undefined)

	validateAll = () => {
		for (const { fieldName, value } of this.getValidableFields()) {
			const error = this.validate(fieldName, value);
			this.setState({ [fieldName]: { ...this.state[fieldName], value, error, showError: false } });
		}
	}

	isValid = () => this.getValidableFields().every(({ error } = {}) => !error)

	handleFieldChange = (fieldName) => ({ target: { value } }) => {
		const error = this.validate(fieldName, value);
		this.setState({ [fieldName]: { ...this.state[fieldName], value, error, showError: false } });
	}

	handleNameChange = this.handleFieldChange('name')

	handleEmailChange = this.handleFieldChange('email')

	handleDepartmentChange = this.handleFieldChange('department')

	handleHelptopicChange = this.handleFieldChange('helptopic')

	handleSubmit = (event) => {
		event.preventDefault();

		if (this.props.onSubmit) {
			const values = Object.entries(this.state)
				.filter(([, state]) => state !== null)
				.map(([name, { value }]) => ({ [name]: value }))
				.reduce((values, entry) => ({ ...values, ...entry }), {});
			this.props.onSubmit(values);
		}
	}

	constructor(props) {
		super(props);

		const { hasNameField, hasEmailField, hasDepartmentField, departments } = props;

		if (hasNameField) {
			this.state.name = { value: '' };
		}

		if (hasEmailField) {
			this.state.email = { value: '' };
		}

		if (hasDepartmentField && departments) {
			if (departments.length > 1) {
				this.state.department = { value: '' };
			} else if (departments.length === 1) {
				this.state.department = { value: departments[0]._id };
			} else {
				this.state.department = null;
			}
		}

		if (hasHelpTopicField && helptopics) {
			if (helptopics.length > 1) {
				this.state.helptopic = { value: '' };
			} else if (helptopics.length === 1) {
				this.state.helptopic = { value: helptopics[0]._id };
			} else {
				this.state.helptopic = null;
			}
		}

		this.validateAll();
	}

	componentWillReceiveProps({ hasNameField, hasEmailField, hasDepartmentField, departmentDefault, departments, nameDefault, emailDefault }) {
		const nameValue = nameDefault || '';
		if (hasNameField && (!this.state.name || this.state.name !== nameValue)) {
			this.setState({ name: { ...this.state.name, value: nameValue } });
		} else if (!hasNameField) {
			this.setState({ name: null });
		}

		const emailValue = emailDefault || '';
		if (hasEmailField && (!this.state.email || this.state.name !== emailValue)) {
			this.setState({ email: { ...this.state.email, value: emailValue } });
		} else if (!hasEmailField) {
			this.setState({ email: null });
		}

		const departmentValue = departmentDefault || (departments && departments.length === 1 && departments[0]._id) || '';
		const showDepartmentField = hasDepartmentField && departments && departments.length > 1;
		if (showDepartmentField && (!this.state.department || this.state.department !== departmentValue)) {
			this.setState({ department: { ...this.state.department, value: departmentValue } });
		} else if (!showDepartmentField) {
			this.setState({ department: null });
		}

		const helptopicValue = (helptopics && helptopics.length === 1 && helptopics[0]._id) || '';
		const showHelptopicField = hasHelpTopicField && helptopics && helptopics.length > 1;
		if (showHelptopicField && (!this.state.helptopic || this.state.helptopic !== helptopicValue)) {
			this.setState({ helptopic: { ...this.state.helptopic, value: helptopicValue } });
		} else if (!showHelptopicField) {
			this.setState({ helptopic: null });
		}

		this.validateAll();
	}

	render({ title, color, message, loading, departments, ...props }, { name, email, department, helptopic }) {
		const valid = this.isValid();

		return (
			<Screen
				color={color}
				title={title || defaultTitle}
				className={createClassName(styles, 'register')}
				{...props}
			>
				<Screen.Content>
					<p className={createClassName(styles, 'register__message')}>{message || defaultMessage}</p>

					<Form onSubmit={this.handleSubmit}>
						{name
							? (
								<FormField
									required
									label={I18n.t('Name')}
									error={name.showError && name.error}
								>
									<TextInput
										name="name"
										value={name.value}
										placeholder={I18n.t('Insert your name here...')}
										disabled={loading}
										onInput={this.handleNameChange}
									/>
								</FormField>
							)
							: null}

						{email
							? (
								<FormField
									required
									label={I18n.t('Email')}
									error={email.showError && email.error}
								>
									<TextInput
										name="email"
										value={email.value}
										placeholder={I18n.t('Insert your email here...')}
										disabled={loading}
										onInput={this.handleEmailChange}
									/>
								</FormField>
							)
							: null}
						{helptopic
							? (
								<FormField
									label={I18n.t('What can I help you with today ?')}
									error={helptopic.showError && helptopic.error}
								>
									<SelectInput
										name="helptopic"
										value={helptopic.value}
										options={helptopics.map(({ _id, name }) => ({ value: _id, label: name }))}
										placeholder={I18n.t('Choose an option...')}
										disabled={loading}
										onInput={this.handleHelptopicChange}
									/>
								</FormField>
							)
							: null}
						{department
							? (
								<FormField
									label={I18n.t('Please select Jurisdiction for your referral')}
									error={department.showError && department.error}
								>
									<SelectInput
										name="department"
										value={department.value}
										options={sortArrayByColumn(departments, 'name').map(({ _id, name }) => ({ value: _id, label: name }))}
										placeholder={I18n.t('Choose an option...')}
										disabled={loading}
										onInput={this.handleDepartmentChange}
									/>
								</FormField>
							)
							: null}

						<ButtonGroup>
							<Button submit loading={loading} disabled={!valid || loading} stack>{I18n.t('Start chat')}</Button>
						</ButtonGroup>
					</Form>
				</Screen.Content>
				<Screen.Footer />
			</Screen>
		);
	}
}
