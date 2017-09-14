import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions, URLSearchParams,ResponseContentType } from '@angular/http';
import { UUID } from 'angular2-uuid';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { Subject } from 'rxjs/Subject';

import { GlobalConfigs } from '../../global.state';

@Injectable()
export class UtilityUomService{
	private utility_uom_data: any;
    redirectUrl: string;
    private appUrl = GlobalConfigs.APP_MASTER_URL+ '/';


    private eventEmitted = new Subject<string>();

    public eventEmitted$ = this.eventEmitted.asObservable();

	  constructor(private http: Http){

	  }

  	getUtilities(filters : any) {
	  	var headers = new Headers();
		headers.append('Content-Type', 'application/json');
		var bearer = "Bearer " + localStorage.getItem('bearer_token');

		headers.append('Authorization', bearer);
		headers.append('Access-Control-Allow-Origin', '*');
		headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');

		var options = new RequestOptions({headers: headers});
		var load_url = this.appUrl + 'utility-uom/all';
		console.log('Options ', options);
        if(filters == null){
            filters= {
                "filters": {
                }, 
                "first": 0, 
                "multiSortMeta": "undefined", 
                "rows": 10, 
                "sortField": "description", 
                "sortOrder": -1
            };
        }

        return this.http.post(load_url, filters, options).map(this.extractData);
	}
    
  addUtilityUom(new_utility): Observable<any> {
      var headers = new Headers();
      headers.append('Content-Type', 'application/x-www-form-urlencoded');
      headers.append('Authorization', 'Bearer ' + localStorage.getItem('bearer_token'));
      headers.append('Access-Control-Allow-Origin', '*');
      headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');
      
      var options = new RequestOptions({
          headers: headers
      });
      
      var add_url = this.appUrl + 'utility-uom/add';
      
      // To Change the JSON object to urlencoded
      let url_search_params = new URLSearchParams();
      
      url_search_params.append('name', new_utility.name);
      url_search_params.append('description', new_utility.description);
	  
      let utility_body = url_search_params.toString();
      console.log('utility Body URL encode', utility_body);
      return this.http.post(add_url, utility_body, options).map(this.extractData);
  }
  
  updateUtilityUom(update_utility){
	  var headers = new Headers();
      headers.append('Content-Type', 'application/x-www-form-urlencoded');
      headers.append('Authorization', 'Bearer ' + localStorage.getItem('bearer_token'));
      headers.append('Access-Control-Allow-Origin', '*');
      headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');
      
      var options = new RequestOptions({
          headers: headers
      });
      
      
      var update_url = this.appUrl + 'utility-uom/update';
      
      // To Change the JSON object to urlencoded
      let url_search_params = new URLSearchParams();
      
      url_search_params.append('utilityUomId', update_utility.id);
      url_search_params.append('name', update_utility.name);
      url_search_params.append('description', update_utility.description);
      
      let utility_body = url_search_params.toString();
      
      console.log('expense_body URL encode', utility_body);
      
      return this.http.post(update_url, utility_body, options).map(this.extractData);
    }

    deleteUtilityUom(utilityuomid): Observable<any> {
		var headers = new Headers();
      
      headers.append('Content-Type', 'application/x-www-form-urlencoded');
      headers.append('Authorization', 'Bearer ' + localStorage.getItem('bearer_token'));
      headers.append('Access-Control-Allow-Origin', '*');
      headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');
      
      var options = new RequestOptions({
          headers: headers
      });
      
      var delete_url = this.appUrl + 'utility-uom/delete';
      
      var delete_body = "utilityUomId=" + utilityuomid;
      console.log('service delete', delete_body);
      return this.http.post(delete_url, delete_body, options).map(this.extractData);
    }
    
 
	private extractData(res: Response){
		let body = res.json();
		console.debug(body);
		return body || { };
    }
    
    public announceEvent(eventName:string){
        this.eventEmitted.next(eventName);
    }

    getAllUtilityUOMCSV(filter_data): Observable<any>{
        var bearer = "Bearer " + localStorage.getItem('bearer_token');
        var headers=new Headers();

        headers.append("Accept", "application/octet-stream");
        headers.append('Authorization', bearer);
        headers.append('Access-Control-Allow-Origin', '*');
        headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');

        var options = new RequestOptions({ headers: headers, responseType: ResponseContentType.Blob });
        var load_url=this.appUrl+ 'utility-uom/all/export';

        let formated_object={
                   filters:{},
                   first:0,
                   rows:9999,
                   globalFilter:'',
                   multiSortMeta:null,
                   sortField:'dateUpdated',
                   sortOrder:-1
        };
        console.log("filter_data ",filter_data);
        if(filter_data){
            formated_object=filter_data;
        }
        
        return this.http.post(load_url,formated_object,options);
    }
}
