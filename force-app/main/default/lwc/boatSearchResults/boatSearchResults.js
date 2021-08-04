import { LightningElement, api, wire } from "lwc";
import getBoats from "@salesforce/apex/BoatDataService.getBoats";
import { MessageContext, publish } from "lightning/messageService";
import BOATMC from "@salesforce/messageChannel/BoatMessageChannel__c";
import updateBoatList from "@salesforce/apex/BoatDataService.updateBoatList";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import { updateRecord, getRecordNotifyChange } from "lightning/uiRecordApi";

const SUCCESS_TITLE   = 'Success';
const MESSAGE_SHIP_IT = 'Ship it!';
const SUCCESS_VARIANT = 'success';
const ERROR_TITLE     = 'Error';
const ERROR_VARIANT   = 'error';

const columns = [
  { label: 'Name', fieldName: 'Name', editable: true },
  { label: 'Length', fieldName: 'Length__c', editable: true },
  { label: 'Price', fieldName: 'Price__c', editable: true },
  { label: 'Description', fieldName: 'Description__c', editable: true }
];
export default class BoatSearchResults extends LightningElement {
  selectedBoatId;
  columns = columns;
  draftValues = [];
  boats;
  @api boatTypeId;
  isLoading = false;
  error = undefined;
  
  @wire(MessageContext)
  messageContext;
  
  @wire(getBoats, { boatTypeId: '$boatTypeId' })
  wiredBoats(result) { 
    if(result){
        this.boats = result;
    } else if(result.error){
        this.boats = undefined;
        this.error = result.error;
    }
  }
  
  // public function that updates the existing boatTypeId property
  // uses notifyLoading
  @api
  searchBoats(boatTypeId) {
    this.isLoading = true;
    this.notifyLoading(this.isLoading);
    this.boatTypeId = boatTypeId;
  }
  
  // this public function must refresh the boats asynchronously
  // uses notifyLoading
  @api
  async refresh() {
    this.isLoading = true;
    this.notifyLoading(this.isLoading);      
    await refreshApex(this.boats);
    this.isLoading = false;
    this.notifyLoading(this.isLoading);        
  } 
  
  // this function must update selectedBoatId and call sendMessageService
  updateSelectedTile(event) {
    this.selectedBoatId = event.detail.boatId;
    this.sendMessageService(this.selectedBoatId);
  }
  
  // Publishes the selected boat Id on the BoatMC.
  sendMessageService(boatId) { 
    const payload = { recordId: boatId };
    publish(this.messageContext, BOATMC, payload);
  }
  
  // The handleSave method must save the changes in the Boat Editor
  // passing the updated fields from draftValues to the 
  // Apex method updateBoatList(Object data).
  // Show a toast message with the title
  // clear lightning-datatable draft values
  handleSave(event) {
    this.isLoading = true;
    this.notifyLoading(this.isLoading);

    const recordInputs = event.detail.draftValues.slice().map(draft => {
      const fields = Object.assign({}, draft);
      return { fields };
    });

    const promises = recordInputs.map(recordInput => updateRecord(recordInput));
    Promise.all(promises)
      .then(() => {
        const successMsg = new ShowToastEvent({
          title: SUCCESS_TITLE,
          message: MESSAGE_SHIP_IT,
          variant: SUCCESS_VARIANT
        });
        this.dispatchEvent(successMsg)
        return this.refresh();
      })
      .catch(error => {
        const errorMsg = new ShowToastEvent({
          title: ERROR_TITLE,
          message: error.body.message,
          variant: ERROR_VARIANT
        });
        this.dispatchEvent(errorMsg);
      })
      .finally(() => {
        this.draftValues = [];
      });
  }

  /* //handleSave method using apex to update multiple records
  handleSave(event) {
    const updatedFields = event.detail.draftValues;
    
    // Prepare the record IDs for getRecordNotifyChange()
    const notifyChangeIds = updatedFields.map(row => { return { "recordId": row.Id } });
   
    // Update the records via Apex
    updateBoatList({ data: updatedFields })
    .then(() => {
      const successMsg = new ShowToastEvent({
        title: SUCCESS_TITLE,
        message: MESSAGE_SHIP_IT,
        variant: SUCCESS_VARIANT
      });
      this.dispatchEvent(successMsg);      
    })
    .catch(error => {
      const errorMsg = new ShowToastEvent({
        title: ERROR_TITLE,
        message: error.body.message,
        variant: ERROR_VARIANT
      });
      this.dispatchEvent(errorMsg);
    })
    .finally(() => {
      // Refresh LDS cache and wires
      getRecordNotifyChange(notifyChangeIds);

      // Display fresh data in the datatable
      return this.refresh();
    });
  }*/

  // Check the current value of isLoading before dispatching the doneloading or loading custom event
  notifyLoading(isLoading) {
    let spinnerEvent;
    if (isLoading) {
        spinnerEvent = new CustomEvent('loading');
    } else {
        spinnerEvent = new CustomEvent('doneloading');
    }
    this.dispatchEvent(spinnerEvent);
}
}
