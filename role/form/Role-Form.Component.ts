import { Component, Input, ChangeDetectorRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup, AbstractControl, FormBuilder, Validators, ValidatorFn, FormControl } from '@angular/forms';
import { ModalDirective } from 'ng2-bootstrap';


@Component({
    selector: 'utility-types',
    templateUrl: './Role-Form.Component.html'
})
export class RoleFormComponent{
    private formMode: string = "NEW" // one of these: NEW, VIEW, EDIT
    
    ngOnInit() {
        console.log(" ahsjkahjkshajk");
    }
}