import {Component, Input, ChangeDetectorRef, ViewChild, ViewEncapsulation,ViewChildren, QueryList} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { FormGroup, AbstractControl, FormBuilder, Validators ,FormControl} from '@angular/forms';
import { ModalDirective } from 'ng2-bootstrap';
import { DataTable } from 'primeng/primeng';
import * as moment from 'moment';
import { UtilityUomService } from './utility-uom.service';
import { FilterInputComponent } from '../filter-input.component';
import { Subscription } from 'rxjs/Subscription';
import { saveAs } from 'file-saver';

@Component({
  selector: 'utility-uom',
  templateUrl: './utility-uom.component.html',
  styleUrls: ['./../styles/basic-theme.scss', './../styles/primeng.min.css', './../styles/modals.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UtilityUom {

    public utilities;
    public utilities$: Observable<any>;
    public processed_priorities;
    public form;
    public name;
    public description;
	public edit_form;
	public edit_name;
	public edit_description;
	public utility_edit;
	deleteConfirm;
	delete_name;

	private errMsg = [];
	private errMsgEdit=[];

    @ViewChild('addNewModal') addNewModal: ModalDirective;
    @ViewChild('editModal') editModal: ModalDirective;
	@ViewChild('deleteModal') deleteModal: ModalDirective;

	@ViewChild('dt') listUtilityTable: DataTable;

	@ViewChildren('filterUtility') filterUtility: QueryList<FilterInputComponent>;

	 // static
	private readonly DEFAULT_ITEM_PER_PAGE : number = 10;
	private readonly DEFAULT_SORT_FIELD : string = "dateUpdated";

	private totalRecords;
	private isLoadingUtilityUOM = false;
	private submitLoadingUtility=false;

	private filterUtilityUom : any = {};

	private subscription: Subscription;
	private viewEditUtilityTittle;
	private isVisible;


  	constructor(
		public fb: FormBuilder,
		public cdr: ChangeDetectorRef,
		public utilityUomService: UtilityUomService
		) {
			
			this.subscription=this.utilityUomService.eventEmitted$.subscribe(event=>{
				
				if (event == "addNewModal_btnSaveOnClick_createSuccess" || event == "addNewModal_btnSaveOnClick_updateSuccess") {
					this.hideChildModal();
					this.getAllUtilityUOM(this.buildFilter(this.listUtilityTable, this.filterUtilityUom));
				}else if(event=="deleteModal_btnSaveOnClick_deleteSuccess"){
					this.getAllUtilityUOM(this.buildFilter(this.listUtilityTable, this.filterUtilityUom));
				}

			});
  	}
	public ngOnInit(){
		
		this.form = this.fb.group({
			'name': ['', [Validators.required, Validators.minLength(2)]],
			'description': ['', [Validators.required, Validators.minLength(2)]]
		  });
		  this.name = this.form.controls['name'];
		  this.description = this.form.controls['description'];

		  this.edit_form = this.fb.group({
			  'edit_name' : ['', [Validators.required,Validators.minLength(2)]],
			  'edit_description' : ['', [Validators.required,Validators.minLength(2)]]
		  });
			this.edit_name = this.edit_form.controls['edit_name'];
			this.edit_description = this.edit_form.controls['edit_description'];
		  // Test Moment
		  var now = moment(new Date()); //todays date
		  var end = moment("2015-12-1"); // another date
		  var duration = moment.duration(now.diff(end));
		  var days = duration.asDays();

		  console.log(days);

		  this.isVisible=false;
	}

	public deleteClose(){
		this.deleteModal.hide();
	}
    public deleteUtilityUom(event){
		this.deleteConfirm= event;
		this.delete_name= event.name;
		this.deleteModal.show();
	}
	public saveDelete(){
		this.submitLoadingUtility=true;
		console.log('test', this.deleteConfirm.userId);
			this.utilityUomService.deleteUtilityUom(this.deleteConfirm.utilityUomId).subscribe(
            (data) => {
				this.utilityUomService.announceEvent("deleteModal_btnSaveOnClick_deleteSuccess");
            }
		);
		this.submitLoadingUtility=false;
		this.deleteModal.hide();
	}

    public addUtilityUom(){
        this.addNewModal.show();
    }
    
    public editUtilityUom(event){
        console.log('editing', event.utilityUomId);
        this.viewEditUtilityTittle = "Edit Utility UOM";
        this.edit_form.enable();

		this.utility_edit = event.utilityUomId;
		// Inject Initial Value to the Edit Form
        this.edit_form.patchValue({ edit_name: event.name });
		this.edit_form.patchValue({ edit_description: event.description });
        // Display data to Form Modal
		this.isVisible=false;
		this.editModal.show();
		
    }
    public onSubmit(values){
	   
	   var hasError = false;
	   if(!this.form.valid){
		    this.markAsTouchAll();
			hasError=true;
	   }
	   if(hasError){
			return ;
	   }
	   
	   this.submitLoadingUtility = true;
	   if(this.form.valid){
			 console.log('Form Values uti:', values);
			
			 this.utilityUomService.addUtilityUom(values).subscribe(
				(response) => {
					if(response.resultCode.code==0){
						this.submitLoadingUtility = false;
						this.utilityUomService.announceEvent("addNewModal_btnSaveOnClick_createSuccess");
					}else{
						this.errMsg=[];
						this.errMsg=this.errMsg.concat(response.resultCode.message);
					}
				}
			);
			
	   }
	   // 
    }
  	public onSubmitEdit(values,event){
		console.log('edit form',values)
		this.viewEditUtilityTittle="Edit Utility UOM";
		 var hasError=false;
		 if(!this.edit_form.valid){
			this.markAsTouchAllFormEdit();
			hasError=true;
		 }

		 if(hasError){
			return;
		 }
		 this.submitLoadingUtility = true;
		if(this.edit_form.valid){
			console.log("edit ");
			
			 var formatted_object = Object.assign({}, {
               	id: this.utility_edit,
                name: values.edit_name,
                description: values.edit_description,
              });
			
			 let response = this.utilityUomService. updateUtilityUom(formatted_object).subscribe(
                (data) => {
					if(data.resultCode.code==0){
						// this.hideChildModal();						
						// this.ngOnInit();
						// using announceEvent
						this.submitLoadingUtility = false;
						this.utilityUomService.announceEvent("addNewModal_btnSaveOnClick_updateSuccess");
					}else{
						this.errMsgEdit=[];
						this.errMsgEdit=this.errMsg.concat(data.data.message);
						
					}
                }
		     );
		   
		}
		
		
	}
	
	public cancel(){
		this.hideModal();
		this.clearFormInput(this.form);
	}
   
	public hideModal(){
		this.addNewModal.hide();
		this.editModal.hide();
	}

	public clearFormInput(form){
		form.reset();
	}
	public hideChildModal(){
		this.addNewModal.hide();
		this.editModal.hide();
		this.clearFormInput(this.form);
	}

	public markAsTouchAll(){
		Object.keys(this.form.controls).forEach(key => {
			this.form.controls[key].markAsTouched();
		});
	}

	private markAsTouchAllFormEdit(){
		Object.keys(this.edit_form.controls).forEach(key => {
			this.edit_form.controls[key].markAsTouched();
		});
	}

	public resetFilters(table:DataTable){

		console.log("resetFilters");
                console.log(table);

		this.filterUtility.forEach(element => {
			element.resetFilter();
		});

		this.filterUtilityUom={};

		this.getAllUtilityUOM(this.buildFilter(table,this.filterUtilityUom));
		
	}

	public refresh($event, table){

		console.log("customRefresh fisrt data ini ");
                 console.log($event);
                 console.log(table);

		this.getAllUtilityUOM(this.buildFilter(table, this.filterUtilityUom));
		
	}

	private buildFilter(table: DataTable, filterMaster: any) {
        if(table == null){
            return {
                "filters": {},
                "first": 0,
                "rows": this.DEFAULT_ITEM_PER_PAGE,
                "globalFilter": "",
                "multiSortMeta": null,
                "sortField": this.DEFAULT_SORT_FIELD,
                "sortOrder": -1
            }
        }
        else{
            return {
                 "filters": filterMaster,
                "first": table.first,
                "rows": table.rows,
                "globalFilter": table.globalFilter,
                "multiSortMeta": table.multiSortMeta,
                "sortField": table.sortField,
                "sortOrder": table.sortOrder
            };
        }
      }

	private getAllUtilityUOM(filters) {
		  this.isLoadingUtilityUOM=true;
		  this.utilityUomService.getUtilities(filters).subscribe(
			  (response)=>{
				if(response.resultCode.code==0){
					this.utilities = response.data;
				}else{
					// error
				}
				// pagging 
				if(response.paging != null)
                    this.totalRecords = response.paging.total;
                else
                    this.totalRecords = 0;

                this.isLoadingUtilityUOM = false;
			}
		);

		 
	}
	 // onFilter event
	private  onFilterUtility(event) {
        console.log("onFilter event", event.value);

        this.filterUtilityUom[event.field] = event.value;

        this.refresh(event, this.listUtilityTable);
    }



	public viewUtilityUom(values){

		this.viewEditUtilityTittle="View Utility UOM";
		// Inject Initial Value to the Edit Form
        this.edit_form.patchValue({ edit_name: values.name });
		this.edit_form.patchValue({ edit_description: values.description });
		this.isVisible=true;
		this.edit_form.disable();
        this.editModal.show();
	}

	public exportUtilityUOMCSV(dataTable: DataTable){
		let filters: any = this.buildFilter(dataTable,this.filterUtilityUom);
		filters.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
		console.log("export CSV");
        this.utilityUomService.getAllUtilityUOMCSV(filters).subscribe(response => {
            let blobData: Blob = new Blob([response.blob()], { type: response.headers.get('Content-Type') });
            saveAs(blobData, "utility_uom.csv");
        });
	}
}  
