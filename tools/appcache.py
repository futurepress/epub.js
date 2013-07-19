#!/usr/bin/python
 
"""WARNING:  Script is in beta and needs to be tested thoroughly.

The script generates a rudimentary appcache file based upon the content.opf file located in either: 
an uncompressed epub directory or a compressed epub file and places it in the current directory

Usage: acm_gen.py --input='/path/to/content.opf' which links to the uncompressed epub directory that includes the content.opf
OR 		 --input='/path/to/book.epub' which links to the compressed epub file
"""
 
__author__ = 'Luis Aguilar'
__email__ = 'luis@berkeley.edu'

import os
import xml.etree.ElementTree as ET
import zipfile
import datetime
import epub
from optparse import OptionParser

def get_parameters():
    """
        Parse the user input
    """
    parser = OptionParser()
    parser.add_option('-i', '--input', dest='input')
    parser.add_option('-o', '--output', dest='output', default='.')
    (options, args) = parser.parse_args()

    # code block to check for empty path, needed? path that includes proper filename, then valid file check
    if not options.input:
        return parser.error('input path is empty, use --input="path.to.opf.or.epub.filename"')
    elif not (options.input[-3:].lower() == 'pub' or options.input[-3:].lower() == 'opf'):
        return parser.error('Please include opf or epub filename in path')
    elif not os.path.isfile(options.input):
        return parser.error('input epub or content.opf file could not be found, please verify path and filename')
    else:
        return {'input': options.input, 'output': options.output, 'file': options.input[-3:].lower()}

def process_extracted_opf(userParams):
    """
        Parse the content.opf file.  Is it good practice to close file used
        for ElementTree processing?
    """
    namespaces = {'xmlns': 'http://www.idpf.org/2007/opf',
                    'dc':'http://purl.org/dc/elements/1.1/',
                    'dcterms':'http://purl.org/dc/terms/'}

    print "Parsing content.opf file at " + userParams['input']
    # return list
    itemHrefs = []

    # begin parsing content.opf
    tree = ET.parse(userParams['input'])
    root = tree.getroot()
    # extract item hrefs and place in return list
    for child in root.findall('xmlns:manifest/xmlns:item', namespaces=namespaces):
        itemHrefs.append(child.attrib['href'])
    return itemHrefs

def process_epub(userParams):
    """
        Parse manifest items using epub library
    """
    book = epub.open_epub(userParams['input'])

    print "Parsing epub file at " + userParams['input']

    itemHrefs = []
    for item in book.opf.manifest.values():
        itemHrefs.append(item.href)

    return itemHrefs 

def write_appcache(itemHrefs):
    """
        Create offline_appcache with extracted hrefs
    """
    fileName = 'epub.appcache'
    cacheHeader = 'CACHE MANIFEST\n'

    # open pointer to new appcache file
    # will need to add functionality that checks for existing appcache
    f_appcache = open(fileName, "w")
    
    # write file
    f_appcache.write(cacheHeader)
    f_appcache.write('# '+ str(datetime.datetime.now()) + '\n')

    for href in itemHrefs:
        f_appcache.write(href + '\n')

    # close file
    f_appcache.close()

def main():
    # get user defined parameters
    userParams = get_parameters()

    # process the epub or the content file extracted from an epub
    if (userParams['file']=='pub'):
        itemHrefs = process_epub(userParams)
    elif(userParams['file']=='opf'):
        itemHrefs = process_extracted_opf(userParams)

    # take extracted items and generate the appcache
    write_appcache(itemHrefs)
 
if __name__ == '__main__':
    main()