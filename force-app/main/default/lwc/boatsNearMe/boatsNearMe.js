import { LightningElement, api, wire } from 'lwc';
import getBoatsByLocation from '@salesforce/apex/BoatDataService.getBoatsByLocation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const LABEL_YOU_ARE_HERE = 'You are here!';
const ICON_STANDARD_USER = 'standard:user';
const ERROR_TITLE = 'Error loading Boats Near Me';
const ERROR_VARIANT = 'error';

export default class BoatsNearMe extends LightningElement {
    @api boatTypeId;
    mapMarkers = [];
    isLoading = true;
    isRendered = false;
    latitude = '';
    longitude = '';

    @wire(getBoatsByLocation, { latitude: '$latitude', longitude: '$longitude', boatTypeId: '$boatTypeId' })
    wiredBoatsJSON({error, data}) {
        if(error){
            const event = new ShowToastEvent({
                variant: ERROR_VARIANT,
                title: ERROR_TITLE
            });
            this.dispatchEvent(event);
            this.isLoading = false;
        } else if(data){
            this.createMapMarkers(data);
            this.isLoading = false;
        }
    }

    renderedCallback() {
        if(!this.isRendered){
            this.getLocationFromBrowser();
            this.isRendered = true;
        } 
    }

    getLocationFromBrowser() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                this.latitude = position.coords.latitude;
                this.longitude = position.coords.longitude;
            })
        }
    }

    createMapMarkers(boatData) {
        const newMarkers = JSON.parse(boatData).map(boat => ({
            title : boat.Name,
            location : {
                Latitude: boat.Geolocation__Latitude__s,
                Longitude: boat.Geolocation__Longitude__s
            }
        }));
        newMarkers.unshift({ 
            location: {
                Latitude: this.latitude,
                Longitude: this.longitude
            },
            title : LABEL_YOU_ARE_HERE, 
            icon : ICON_STANDARD_USER
        });
        this.mapMarkers = newMarkers;
    }
}
