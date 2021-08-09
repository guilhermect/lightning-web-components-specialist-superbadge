// imports
import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class BoatSearch extends NavigationMixin(LightningElement){
    isLoading = false;
    @api boatTypeId = '';
    
    // Handles loading event
    handleLoading() {
        this.isLoading = true;
    }
    
    // Handles done loading event
    handleDoneLoading() {
        this.isLoading = false;
    }
    
    searchBoats(event) { 
       this.boatTypeId = event.detail.boatTypeId;
       this.template.querySelector('c-boat-search-results').searchBoats(this.boatTypeId);
       this.handleDoneLoading();
    }
    
    createNewBoat() {
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Boat__c',
                actionName: 'new'
            }
        });
    }
}
  