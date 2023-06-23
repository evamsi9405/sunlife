import { LightningElement , track} from 'lwc';
import getFinancialServicesAccounts from '@salesforce/apex/FinancialServicesAccntListingController.getFinancialServicesAccounts';
import getFinancialServicesAccountsByAccountName from '@salesforce/apex/FinancialServicesAccntListingController.getFinancialServicesAccountsByAccountName';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { updateRecord } from 'lightning/uiRecordApi';


export default class FinancialServicesAccountListing extends LightningElement {
    @track data = [];
    defaultSortDirection = 'asc';
    @track sortDirection;
    sortedBy;
    saveDraftValues = [];
    @track columns = [
        { label: 'Account Name', fieldName: 'accLink', sortable: true, editable: true,type: 'url',
        typeAttributes: { label: { fieldName: 'Name' }, target: '_blank' } },
        { label: 'Account Owner', fieldName: 'ownerName', sortable: true},
        { label: 'Phone', fieldName: 'Phone', editable: true },
        { label: 'Website', fieldName: 'Website', editable: true },
        { label: 'Annual Revenue', fieldName: 'AnnualRevenue', editable: true }
    ];

    connectedCallback()
    {
        this.fetchData();
    }

    //Fetch Financial Services Accounts
    fetchData()
    {
        console.log('entered fetchdata');
        getFinancialServicesAccounts()
        .then(result => {
            if(result && result !== null)
            {
                console.log('entered fetchdata ' +JSON.stringify(result));
                result.forEach(rec =>{
                    rec.accLink = '/' + rec.Id;
                    rec.ownerName = rec.Owner.Name;
                });
                this.data = result;
                console.log('data ' +JSON.stringify(this.data));
            }
        })
        .catch(error =>{
            console.log('entered error ' );
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: error.body.message,
                    variant: 'error'
                })
            );
        })
    }

    //Method to handle sort
    handleSort(event) {
        this.sortedBy = event.detail.fieldName;
        this.sortDirection = event.detail.sortDirection;
        this.sortData(this.sortedBy, this.sortDirection);
    }

    sortData(fieldname, direction) {
        let parseData = JSON.parse(JSON.stringify(this.data));
        // Return the value stored in the field
        let keyValue = (a) => {
            return a[fieldname];
        };
        // cheking reverse direction
        let isReverse = direction === 'asc' ? 1: -1;
        // sorting data
        parseData.sort((x, y) => {
            x = keyValue(x) ? keyValue(x) : ''; // handling null values
            y = keyValue(y) ? keyValue(y) : '';
            // sorting values based on direction
            return isReverse * ((x > y) - (y > x));
        });
        this.data = parseData;
    }

    //save draft values
    handleSave(event)
    {
        this.saveDraftValues = event.detail.draftValues;
        const recordInputs = this.saveDraftValues.slice().map(draft => {
            const fields = Object.assign({}, draft);
            return { fields };
        });
 
        const promises = recordInputs.map(recordInput => updateRecord(recordInput));
        Promise.all(promises).then(res => {
            
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Records Updated Successfully!',
                    variant: 'success'
                })
            );
            this.saveDraftValues = [];
            return this.refresh();
        }).catch(error => {
            
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Error occurred in saving the records',
                    variant: 'error'
                })
            );
        }).finally(() => {
            this.saveDraftValues = [];
        });
    }

    //Search the accounts by Account Name and refresh the data
    handleKeyUp(event)
    {
        const isEnterKey = event.keyCode === 13;
        if (isEnterKey) {
            let searchKey = event.target.value;
            if(searchKey && searchKey !== '')
            {
                getFinancialServicesAccountsByAccountName({accKey : searchKey})
                .then(result => {
                    if(result)
                    {
                        result.forEach(rec =>{
                            rec.accLink = '/' + rec.Id;
                            rec.ownerName = rec.Owner.Name;
                        });
                        this.data = result;
                    }
                })
                .catch(error =>{
                    
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error',
                            message: error.body.message,
                            variant: 'error'
                        })
                    );
                })
            }else{
                this.fetchData();
            }
        }
    }

    //refresh the data
    refresh()
    {
        this.fetchData();
    }

    //On Change of search text key
    onSearchTextChange(event)
    {
        let key = event.target.value;
        if(key === '')
        {
            this.fetchData();
        }
    }

}