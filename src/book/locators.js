import {qs, sprint, locationOf, defer} from "../utils/core";
import Queue from "../utils/queue";
import EpubCFI from "../utils/epubcfi";
import { EVENTS } from "../utils/constants";
import EventEmitter from "event-emitter";

/**
 * Locators
 * @param {object} [manifest]
 */
class Locators {
	constructor(manifest) {
		if (manifest) {
			this.unpack(manifest);
		}
	}

	unpack(manifest) {
		if (manifest.locations) {
			this.unpackLocations(manifest.locations);
		}

		if (manifest.pages) {
			this.unpackPages(manifest.page);
		}
	}

	unpackLocations(locations) {
		this.locations = locations;
		this.totalLocations = this.locations.length - 1;
	}

	unpackPages(pages) {
		this.pages = pages;
		this.firstPage = parseInt(this.pages[0]);
		this.lastPage = parseInt(this.pages[this.pages.length-1]);
		this.totalPages = this.lastPage - this.firstPage;

		pages.forEach((item) => {
			if (item.cfi) {
				this.pageLocations.push(item.cfi);
			}
		});
	}

	/**
	 * Get a location from an EpubCFI
	 * @param {EpubCFI} cfi
	 * @return {number}
	 */
	locationFromCfi(cfi){
		let loc;
		if (EpubCFI.prototype.isCfiString(cfi)) {
			cfi = new EpubCFI(cfi);
		}
		// Check if the location has not been set yet
		if(this.locations.length === 0) {
			return -1;
		}

		loc = locationOf(cfi, this.locations, EpubCFI.prototype.compare);

		if (loc > this.totalLocations) {
			return this.totalLocations;
		}

		return loc;
	}

	/**
	 * Get a percentage position in locations from an EpubCFI
	 * @param {EpubCFI} cfi
	 * @return {number}
	 */
	percentageFromCfi(cfi) {
		if(this.locations.length === 0) {
			return null;
		}
		// Find closest cfi
		var loc = this.locationFromCfi(cfi);
		// Get percentage in total
		return this.percentageFromLocation(loc);
	}

	/**
	 * Get a percentage position from a location index
	 * @param {number} location
	 * @return {number}
	 */
	percentageFromLocation(loc) {
		if (!loc || !this.totalLocations) {
			return 0;
		}

		return (loc / this.totalLocations);
	}

	/**
	 * Get an EpubCFI from location index
	 * @param {number} loc
	 * @return {EpubCFI} cfi
	 */
	cfiFromLocation(loc){
		var cfi = -1;
		// check that pg is an int
		if(typeof loc != "number"){
			loc = parseInt(loc);
		}

		if(loc >= 0 && loc < this.locations.length) {
			cfi = this.locations[loc];
		}

		return cfi;
	}

	/**
	 * Get an EpubCFI from location percentage
	 * @param {number} percentage
	 * @return {EpubCFI} cfi
	 */
	cfiFromPercentage(percentage){
		let loc;
		if (percentage > 1) {
			console.warn("Normalize cfiFromPercentage value to between 0 - 1");
		}

		// Make sure 1 goes to very end
		if (percentage >= 1) {
			let cfi = new EpubCFI(this.locations[this.totalLocations]);
			cfi.collapse();
			return cfi.toString();
		}

		loc = Math.ceil(this.totalLocations * percentage);
		return this.cfiFromLocation(loc);
	}

	/**
	 * Get a PageList result from a EpubCFI
	 * @param  {string} cfi EpubCFI String
	 * @return {string} page
	 */
	pageFromCfi(cfi){
		var pg = -1;

		// Check if the pageList has not been set yet
		if(!this.pageLocations || this.pageLocations.length === 0) {
			return -1;
		}

		// check if the cfi is in the location list
		var index = indexOfSorted(cfi, this.pageLocations, EpubCFI.prototype.compare);
		if(index != -1) {
			pg = this.pages[index];
		} else {
			// Otherwise add it to the list of locations
			// Insert it in the correct position in the locations page
			index = locationOf(cfi, this.pageLocations, EpubCFI.prototype.compare);
			// Get the page at the location just before the new one, or return the first
			pg = index-1 >= 0 ? this.pages[index-1] : this.pages[0];
			if(pg !== undefined) {
				// Add the new page in so that the locations and page array match up
				//this.pages.splice(index, 0, pg);
			} else {
				pg = -1;
			}

		}
		return pg;
	}

	/**
	 * Get an EpubCFI from a Page List Item
	 * @param  {string} pg
	 * @return {string} cfi
	 */
	cfiFromPage(pg){
		var cfi = -1;
		// check that pg is an int
		if(typeof pg != "number"){
			pg = parseInt(pg);
		}

		// check if the cfi is in the page list
		// Pages could be unsorted.
		var index = this.pages.indexOf(pg);
		if(index != -1) {
			cfi = this.pageLocations[index];
		}
		// TODO: handle pages not in the list
		return cfi;
	}

	/**
	 * Get a Page from Book percentage
	 * @param  {number} percent
	 * @return {string} page
	 */
	pageFromPercentage(percent){
		var pg = Math.round(this.totalPages * percent);
		return pg;
	}

	/**
	 * Returns a value between 0 - 1 corresponding to the location of a page
	 * @param  {int} pg the page
	 * @return {number} percentage
	 */
	percentageFromPage(pg){
		var percentage = (pg - this.firstPage) / this.totalPages;
		return Math.round(percentage * 1000) / 1000;
	}

	/**
	 * Returns a value between 0 - 1 corresponding to the location of a cfi
	 * @param  {string} cfi EpubCFI String
	 * @return {number} percentage
	 */
	percentagePageFromCfi(cfi){
		var pg = this.pageFromCfi(cfi);
		var percentage = this.percentageFromPage(pg);
		return percentage;
	}

	destroy () {

	}
}

EventEmitter(Locators.prototype);

export default Locators;
