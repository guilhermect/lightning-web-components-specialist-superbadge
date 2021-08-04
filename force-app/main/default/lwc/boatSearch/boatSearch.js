// imports
import { LightningElement, api } from 'lwc';

export default class BoatSearch extends LightningElement {
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
    }
    
    createNewBoat() { }
}
  