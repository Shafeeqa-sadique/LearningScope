/* ========================================================================== */
/*                      COMMON SERVICE TO VALIDATE A FORM                     */
/* ========================================================================== */

import { AbstractControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';

export class ValidationService {
    static getValidatorErrorMessage(validatorName: string, validatorValue?: any) {
        const config = {
            'required': 'This field is required!',
            'invalidCreditCard': 'Is invalid credit card number',
            'invalidEmailAddress': 'Please enter valid email address.',
            'invalidPassword': 'Password must be between 6 and 20 characters',
            'minlength': `You need to enter at least ${validatorValue.requiredLength} characters.`,
            'notMatchPassword': 'Password confirmation does not match password',
            'mustChecked': 'This must be checked',
            'notValidBondValue': 'Number of bond must be less than or equal to available bond!',
            'dateInvalid': 'Invalid date!',
            'endDateLessThanStartDate': 'End Date should be greater than start date!',
            'notLessThanOrEqualtoZeroValue': 'This field should not be less than or equal to zero',
            'notAvailableToSold': 'Not available to sold',
            'amountLessThanRequiredAmount': 'Amount must be less than required amount',
            'invalidMobileNumber': 'Invalid mobile number!',
            'invalidNumber': 'Invalid number',
            'maxValue': `Number must be less than ${validatorValue.max}`,
            'minValue': `Number must be greater than ${validatorValue.min}`,
            'maxLength': `String must be less than ${validatorValue.requiredLength} characters`,
            'decimalValue' : `Number must be max ${validatorValue.decimalValue} decimal places`,
        };

        return config[validatorName];
    }

    static requiredValidator(control) {
        if ((control.value == null || control.value == '') && (control.value != 0)) { // || control.value == 0
            return { 'required': true };
        } else {
            return null;
        }
    }

    static creditCardValidator(control) {
        // Visa, MasterCard, American Express, Diners Club, Discover, JCB
        if (control.value.match(/^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/)) {
            return null;
        } else {
            return { 'invalidCreditCard': true };
        }
    }

    static emailValidator(control) {
        // RFC 2822 compliant regex
        if (control.value == null || control.value == '') {
            return null;
        }
        if (control.value.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/)) {
            return null;
        } else {
            return { 'invalidEmailAddress': true };
        }
    }

    static numberValidator(control) {
        // RFC 2822 compliant regex
        // console.log('Number :' + control.value);
        // ##PRABHU
        // if ((control.value == null  || control.value == '') && (Number(control.value) != 0)) {
        if ((control.value == null  || control.value == '')) {
           // console.log('Number :' + control.value);
            return null;
        }
        if (Number(control.value) < 0) {
            return { 'invalidNumber': true };
        }
        const NUMBER_REGEXP = /^-?[\d.]+(?:e-?\d+)?$/;
        if (!NUMBER_REGEXP.test(control.value)) {
            return { 'invalidNumber': true };
        }
        return null;
    }

    static decimalValidator(control) {
        // RFC 2822 compliant regex
        // console.log('Number :' + control.value);
        // ##PRABHU
        // if ((control.value == null || control.value == '') && (Number(control.value) != 0)) {
            if ((control.value == null || control.value == '')) {
            // console.log('Number :' + control.value);
            return null;
        }
       // if((Number(control.value) != 0))
        if (Number(control.value) < 0) {
            return { 'invalidNumber': true };
        }
        const NUMBER_REGEXP = /^(\d+\.?\d{0,2}|\.\d{1,2})$/ ;
        if (!NUMBER_REGEXP.test(control.value)) {
            return { 'invalidNumber': true };
        }
        return null;
    }

    static maxValue(max: Number) {
        return (control: AbstractControl): {[key: string]: any} => {
          const input = control.value,
                isValid = input > max;
          if (isValid)
              return { 'maxValue': {max} };
          else
              return null;
        };
    }

    static minValue(min: Number) {
        return (control: AbstractControl): {[key: string]: any} => {
          const input = control.value,
                isValid = input < min;
          if (isValid)
              return { 'minValue': {min} };
          else
              return null;
        };
    }

    static maxLength(length: Number) {
        return (control: AbstractControl): {[key: string]: any} => {
          const input = control.value.length,
                isValid = input > length;
          if (isValid)
              return { 'maxLength': {length} };
          else
              return null;
        };
    }

    static passwordValidator(control) {
        // {6,100}           - Assert password is between 6 and 100 characters
        // (?=.*[0-9])       - Assert a string has at least one number
        if (!control.value) {
            return null;
        }
        if (control.value.match(/^(?=.*[0-9])[a-zA-Z0-9!@#$%^&*]{6,20}$/)) {
            return null;
        } else {
            return { 'invalidPassword': true };
        }
    }

    static confirmPasswordValidator(AC: AbstractControl) {
        const formGroup = AC.parent;
        if (formGroup) {
            const passwordControl = formGroup.get('password'); // to get value in input tag
            const confirmPasswordControl = formGroup.get('confirmPassword'); // to get value in input tag

            if (passwordControl && confirmPasswordControl) {
                const password = passwordControl.value;
                const confirmPassword = confirmPasswordControl.value;
                if (password !== confirmPassword) {
                    return { notMatchPassword: true };
                } else {
                    return null;
                }
            }
        }

        return null;
    }

    static isChecked(control) {
        if (!control.value) {
            return { mustChecked: true };
        } else {
            return null;
        }
    }

    static numberOfBondValidator(AC: AbstractControl) {
        const formGroup = AC.parent;
        // if (formGroup) {
        const numberOfBondControl = formGroup.get('number_of_bond');
        const totalAvailableBond = formGroup.get('total_available_bond');
        if (totalAvailableBond.value == 0) {
            return Observable
                .of(numberOfBondControl.value == '' || numberOfBondControl.value == 0 || numberOfBondControl.value < 0)
                .map(result => !!result ? { 'notAvailableToSold': true } : null);
        }

        if (numberOfBondControl.value == '' || numberOfBondControl.value == 0 || numberOfBondControl.value < 0) {
            return Observable
                .of(numberOfBondControl.value == '' || numberOfBondControl.value == 0 || numberOfBondControl.value < 0)
                .map(result => !!result ? { 'notLessThanOrEqualtoZeroValue': true } : null);
        }

        return Observable
            .of(totalAvailableBond.value >= numberOfBondControl.value)
            .map(result => !!result ? null : { 'notValidBondValue': true });
        // }

        // return null;
    }

    static pledgeAmountValidator(AC: AbstractControl) {
        const formGroup = AC.parent;
        const amountControl = formGroup.get('amount');
        const requiredAmountControl = formGroup.get('required_amount');
        if (requiredAmountControl.value == 0) {
            return Observable
                .of(requiredAmountControl.value == '' || requiredAmountControl.value == 0 || requiredAmountControl.value < 0)
                .map(result => !!result ? { 'notAvailableToSold': true } : null);
        }

        if (amountControl.value == '' || amountControl.value == 0 || amountControl.value < 0) {
            return Observable
                .of(amountControl.value == '' || amountControl.value == 0 || amountControl.value < 0)
                .map(result => !!result ? { 'notLessThanOrEqualtoZeroValue': true } : null);
        }

        return Observable
            .of(requiredAmountControl.value >= amountControl.value)
            .map(result => !!result ? null : { 'amountLessThanRequiredAmount': true });
    }

    static dateValidator(control) {
        if (control.pristine) {
            return null;
        }

        if ((control.value !== undefined && control.value !== '' && control.value != null)) {

            let month = null;
            let day = null;
            let year = null;
            const currentTaxYear = Number(new Date().getFullYear() - 1);
            if (control.value.indexOf('/') > -1) {
                const res = control.value.split('/');
                if (res.length > 1) {
                    month = res[0];
                    day = res[1];
                    year = res[2];
                }
            } else {
                if (control.value.length == 8) {
                    month = control.value.substring(0, 2);
                    day = control.value.substring(2, 4);
                    year = control.value.substring(4, 8);
                }
            }
            if (isNaN(month) || isNaN(day) || isNaN(year)) {
                return { 'dateInvalid': true };
            }
            month = Number(month);
            day = Number(day);
            year = Number(year);
            if (month < 1 || month > 12) { // check month range
                return { 'dateInvalid': true };
            }
            if (day < 1 || day > 31) {
                return { 'dateInvalid': true };
            }
            if ((month === 4 || month === 6 || month === 9 || month === 11) && day === 31) {
                return { 'dateInvalid': true };
            }
            if (month == 2) { // check for february 29th
                const isleap = (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0));
                if (day > 29 || (day === 29 && !isleap)) {
                    return { 'dateInvalid': true };
                }
            }
            if (year !== currentTaxYear) {
                return { 'dateInvalid': true };
            }
        }
        return null;
    }

    static isRequiredIfChecked(AC: AbstractControl) {
        const formGroup = AC.parent;
        if (formGroup) {
            const is_open_end = formGroup.get('is_open_end');
            const expire_by_month = formGroup.get('expire_by_month');

            if (is_open_end.value === true) {
                return null;
            } else {
                if (expire_by_month.value == 0 || expire_by_month.value == '')
                    return { required: true };
                else
                    return null;
            }
        }
    }

    static endDateAfterOrEqualValidator(AC: AbstractControl) {
        const formGroup = AC.parent;
        if (formGroup) {

            const start_date = new Date(formGroup.get('start_date').value);
            const end_date = new Date(formGroup.get('end_date').value);

            if (end_date.getTime() < start_date.getTime()) {
                return { 'endDateLessThanStartDate': true };
            } else {
                return null;
            }
        }
    }

    static mobileNumberValidator(control) {
        return Observable
            .of(control.value.match('^[0-9]*$'))
            .map(result => !!result ? null : { 'invalidMobileNumber': true });
    }

    static decimalNumberValidator(decimalValue: Number) {
        return (control: AbstractControl): {[key: string]: any} => {
            if (control.value !== undefined && control.value !== '' && control.value != null) {
                const input = control.value.toString(),
                    decimal = input.split('.');
                    if (decimal[1]) {
                        const isValid = decimal[1].length > decimalValue;
                        if (isValid)
                            return { 'decimalValue': {decimalValue} };
                        else
                            return null;
                    } else
                        return null;
            } else {
                return null;
            }
        };
    }

    static compareStrtEnd (c: AbstractControl) {
      // safety check
      if (!c.get('cutOfDtStrt').value || !c.get('cutOfDtEnd').value) { return null; }
      const d1 = new Date(c.get('cutOfDtStrt').value);
      const d2 = new Date(c.get('cutOfDtEnd').value);
      if (d2.getTime() < d1.getTime()) {
            c.get('cutOfDtEnd').setErrors({ endDateLessThanStartDate: true });
            return { 'endDateLessThanStartDate': true };
        } else {
            return null;
        }
      // carry out the actual date checks here for is-endDate-after-startDate
      // if valid, return null,
      // if invalid, return an error object (any arbitrary name), like, return { invalidEndDate: true }
      // make sure it always returns a 'null' for valid or non-relevant cases, and a 'non-null' object for when an error should be raised on the formGroup
     }

}
