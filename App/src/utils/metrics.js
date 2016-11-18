import AyxStore from '../stores/AyxStore'
import {toJS} from 'mobx' 
console.log('metrics.js file exported')
// hard-coded IDs may be temp (discuss further)
const profileId = '113553943'
const accountId = '226181'
const webPropertyId = 'UA-226181-9'
const metadataRequestUri = 'https://www.googleapis.com/analytics/v3/metadata/ga/columns'
const customMetricsMetadataRequestUri = 'https://www.googleapis.com/analytics/v3/management/accounts/'+accountId+'/webproperties/'+webPropertyId+'/customMetrics'
const accessToken = 'ya29.Ci-XAz0oDLbyzBrYi_r7lBBnJHvOI09hIqwKUPsvjpAocWTatFLGG1FyPmjstk92kA'

// get metadata for standard metrics
const getMetricsMetadata = (accessToken) => {
    const settings = {
        "async": true,
        "crossDomain": true,
        "url": metadataRequestUri,
        "method": "GET",
        "dataType": "json",
        "headers": {
            "Authorization": 'Bearer ' + accessToken,
            "cache-control": "private, max-age=0, must-revalidate, no-transform",
            "content-type": "application/json; charset=UTF-8" 
        } 
    }
    return $.ajax(settings)
}

// remove deprecated metrics from standard metrics metadata array
const filterMetricsMetadata = (response) => {
    const filteredMetadataItems = response.items.filter( (d) => d.attributes.status != 'DEPRECATED')
    const standardMetrics = filteredMetadataItems.map( (d) => d.id )
	return standardMetrics
}

// get metadata for custom metrics
const getCustomMetricsMetadata = (accessToken) => {
    const settings = {
        "async": true,
        "crossDomain": true,
        "url": customMetricsMetadataRequestUri,
        "method": "GET",
        "dataType": "json",
        "headers": {
            "Authorization": 'Bearer ' + accessToken,
            "cache-control": "private, max-age=0, must-revalidate, no-transform",
            "content-type": "application/json; charset=UTF-8" 
        } 
    }
    return $.ajax(settings)
}

// remove inactive custom metrics from the custom metrics metadata array
const filterCustomMetricsMetadata = (response) => {
        const filteredCustomMetricsMetadataItems = response.items.filter( (d) => d.active != false)
        const customMetrics = filteredCustomMetricsMetadataItems.map( (d) => d.id )
        return customMetrics
}

// merge the standard and custom metrics metadata arrays and store them in metricsList
const combinedMetricsMetadata = (accessToken, store) => {

	const standardMetrics = getMetricsMetadata(accessToken)
	standardMetrics
		.then(filterMetricsMetadata)
		.done( (result) => {
            result.map((d) => {
                store.metricsList.stringList.push({uiobject: d, dataname: d})
            })
            console.log(toJS(store.metricsList.stringList))
		})
    
    const customMetrics = getCustomMetricsMetadata(accessToken)
	customMetrics
		.then(filterCustomMetricsMetadata)
		.done( (result) => {
            result.map((d) => {
                store.metricsList.stringList.push({uiobject: d, dataname: d})
            })
            console.log(toJS(store.metricsList.stringList))
        })
}

export { getMetricsMetadata, getCustomMetricsMetadata, combinedMetricsMetadata };