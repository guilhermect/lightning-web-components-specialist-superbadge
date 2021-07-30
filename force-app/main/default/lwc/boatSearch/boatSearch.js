// imports
import { LightningElement, api } from 'lwc';

export default class BoatSearch extends LightningElement {
    isLoading = false;
    @api boatTypeId = '';
    
    // Handles loading event
    handleLoading() { }
    
    // Handles done loading event
    handleDoneLoading() { }
    
    // Handles search boat event
    // This custom event comes from the form
    searchBoats(event) { 
       this.boatTypeId = event.detail.boatTypeId;
    }
    
    createNewBoat() { }
}
  