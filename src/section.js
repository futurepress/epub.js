import { defer } from './utils/core';
import EpubCFI from './epubcfi';
import Hook from './hook';
import Url from './utils/url';

/**
 * Represents a Section of the Book
 * In most books this is equivelent to a Chapter
 * @param {object} item  The spine item representing the section
 * @param {object} hooks hooks for serialize and content
 */
class Section {
	constructor(item, hooks){
			this.idref = item.idref;
			this.linear = item.linear;
			this.properties = item.properties;
			this.index = item.index;
			this.href = item.href;
			this.url = item.url;
			this.next = item.next;
			this.prev = item.prev;

			this.cfiBase = item.cfiBase;

			if (hooks) {
				this.hooks = hooks;
			} else {
				this.hooks = {};
				this.hooks.serialize = new Hook(this);
				this.hooks.content = new Hook(this);
			}

	};

	/**
	 * Load the section from its url
	 * @param  {method} _request a request method to use for loading
	 * @return {document} a promise with the xml document
	 */
	load(_request){
		var request = _request || this.request || require('./request');
		var loading = new defer();
		var loaded = loading.promise;

		if(this.contents) {
			loading.resolve(this.contents);
		} else {
			request(this.url)
				.then(function(xml){
					var base;
					var directory = new Url(this.url).directory;

					this.document = xml;
					this.contents = xml.documentElement;

					return this.hooks.content.trigger(this.document, this);
				}.bind(this))
				.then(function(){
					loading.resolve(this.contents);
				}.bind(this))
				.catch(function(error){
					loading.reject(error);
				});
		}

		return loaded;
	};

	/**
	 * Adds a base tag for resolving urls in the section
	 * @private
	 * @param  {document} _document
	 */
	base(_document){
			var task = new defer();
			var base = _document.createElement("base"); // TODO: check if exists
			var head;

			base.setAttribute("href", window.location.origin + "/" +this.url);

			if(_document) {
				head = _document.querySelector("head");
			}
			if(head) {
				head.insertBefore(base, head.firstChild);
				task.resolve();
			} else {
				task.reject(new Error("No head to insert into"));
			}


			return task.promise;
	};

	/**
	 * Render the contents of a section
	 * @param  {method} _request a request method to use for loading
	 * @return {string} output a serialized XML Document
	 */
	render(_request){
		var rendering = new defer();
		var rendered = rendering.promise;
		this.output; // TODO: better way to return this from hooks?

		this.load(_request).
			then(function(contents){
				var serializer;

				if (typeof XMLSerializer === "undefined") {
					XMLSerializer = require('xmldom').XMLSerializer;
				}
				serializer = new XMLSerializer();
				this.output = serializer.serializeToString(contents);
				return this.output;
			}.bind(this)).
			then(function(){
				return this.hooks.serialize.trigger(this.output, this);
			}.bind(this)).
			then(function(){
				rendering.resolve(this.output);
			}.bind(this))
			.catch(function(error){
				rendering.reject(error);
			});

		return rendered;
	};

	/**
	 * Find a string in a section
	 * TODO: need reimplementation from v0.2
	 * @param  {string} query [description]
	 * @return {[type]} [description]
	 */
	find(query){

	};

	/**
	* Reconciles the current chapters layout properies with
	* the global layout properities.
	* @param {object} global  The globa layout settings object, chapter properties string
	* @return {object} layoutProperties Object with layout properties
	*/
	reconcileLayoutSettings(global){
		//-- Get the global defaults
		var settings = {
			layout : global.layout,
			spread : global.spread,
			orientation : global.orientation
		};

		//-- Get the chapter's display type
		this.properties.forEach(function(prop){
			var rendition = prop.replace("rendition:", '');
			var split = rendition.indexOf("-");
			var property, value;

			if(split != -1){
				property = rendition.slice(0, split);
				value = rendition.slice(split+1);

				settings[property] = value;
			}
		});
	 return settings;
	};

	/**
	 * Get a CFI from a Range in the Section
	 * @param  {range} _range
	 * @return {string} cfi an EpubCFI string
	 */
	cfiFromRange(_range) {
		return new EpubCFI(_range, this.cfiBase).toString();
	};

	/**
	 * Get a CFI from an Element in the Section
	 * @param  {element} el
	 * @return {string} cfi an EpubCFI string
	 */
	cfiFromElement(el) {
		return new EpubCFI(el, this.cfiBase).toString();
	};
}

export default Section;
